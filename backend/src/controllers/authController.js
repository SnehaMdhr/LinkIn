import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import { validatePassword } from "../utils/validatePassword.js";
import { sendEmail, buildOtpEmail } from "../utils/email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const googleClient = new OAuth2Client();

const SALT_ROUNDS = 10;

// @desc  Register a new user
// @route POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, username: rawUsername } = req.body;
    const username = rawUsername?.trim();
    const trimmedEmail = email?.trim();
    const trimmedName = name?.trim();

    if (!username || !trimmedEmail || !trimmedName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ message: "Confirm password is required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ message: pwCheck.message });
    }

    const existingUser = await User.findOne({ $or: [{ email: trimmedEmail }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      username,
      passwordHistory: [hashedPassword],
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        theme: user.theme,
        bio: user.bio,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim();

    if (!trimmedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    // Set JWT as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        theme: user.theme,
        bio: user.bio,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      // Always return the same message to avoid leaking whether the email exists
      return res.status(200).json({ message: "If that email is registered, you will receive an OTP." });
    }

    // Generate a 6-digit OTP using crypto (secure random)
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Store OTP in the user document (reuse resetPasswordToken field)
    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send the email with the OTP
    const emailHtml = buildOtpEmail(otp, user.name);
    await sendEmail({
      to: user.email,
      subject: "Your LinkIn password reset OTP",
      html: emailHtml,
    });

    res.status(200).json({
      message: "If that email is registered, you will receive an OTP.",
    });
  } catch (error) {
    next(error);
  }
};


// @desc  Google sign-in via ID token (popup flow — no redirect URI needed)
// @route POST /api/auth/google
export const googleSignIn = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Load client ID from env or JSON file
    let clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      const jsonPath = path.resolve(__dirname, "../config/google-credentials.json");
      if (fs.existsSync(jsonPath)) {
        try {
          const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
          const web = json.web || json.installed || json;
          clientId = web.client_id;
        } catch (err) {
          console.warn("Failed to parse google-credentials.json:", err.message);
        }
      }
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profileImage && picture) {
          user.profileImage = picture;
        }
        await user.save();
      }
    } else {
      const baseUsername = email.split("@")[0];
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        name,
        email,
        username,
        googleId,
        password: "",
        profileImage: picture || "",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google sign-in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        theme: user.theme,
        bio: user.bio,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    return res.status(401).json({ message: "Invalid Google credential" });
  }
};

// @desc  Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ message: pwCheck.message });
    }

    const user = await User.findOne({
      email: email.trim(),
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Password reuse prevention: check against last 5 passwords
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const oldHash of user.passwordHistory) {
        const isReused = await bcrypt.compare(password, oldHash);
        if (isReused) {
          return res.status(400).json({ message: "You cannot reuse any of your last 5 passwords." });
        }
      }
    }

    user.password = hashedPassword;
    // Add to history, keep only last 5
    user.passwordHistory = [...(user.passwordHistory || []), hashedPassword].slice(-5);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    next(error);
  }
};
