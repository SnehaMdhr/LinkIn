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

    // Check if account is temporarily locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const msRemaining = user.lockUntil - Date.now();
      const minutes = Math.ceil(msRemaining / 60000);
      return res.status(429).json({
        message: `Account temporarily locked. Too many failed attempts. Try again in ${minutes} minute(s).`,
        locked: true,
      });
    }

    // Reset lock if lock period has expired
    if (user.lockUntil && user.lockUntil < Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 15) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    // If MFA is enabled, return pending MFA status (don't issue JWT yet)
    if (user.mfaEnabled) {
      return res.status(200).json({
        message: "MFA verification required",
        pendingMfa: true,
        userId: user._id.toString(),
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
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    // Set JWT as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 24 * 60 * 60 * 1000,
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

    // Check account lockout (applies even to OAuth to prevent bypass)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const msRemaining = user.lockUntil - Date.now();
      const minutes = Math.ceil(msRemaining / 60000);
      return res.status(429).json({
        message: `Account temporarily locked. Try again in ${minutes} minute(s).`,
        locked: true,
      });
    }
    if (user.lockUntil && user.lockUntil < Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // If MFA is enabled, require MFA verification even for Google sign-in
    if (user.mfaEnabled) {
      return res.status(200).json({
        message: "MFA verification required",
        pendingMfa: true,
        userId: user._id.toString(),
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
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion },
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
    user.tokenVersion += 1;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password (authenticated user)
// @route POST /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      return res.status(400).json({ message: pwCheck.message });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const oldHash of user.passwordHistory) {
        const isReused = await bcrypt.compare(newPassword, oldHash);
        if (isReused) {
          return res.status(400).json({ message: "You cannot reuse any of your last 5 passwords." });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    user.passwordHistory = [...(user.passwordHistory || []), hashedPassword].slice(-5);
    user.tokenVersion += 1;
    await user.save();

    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    res.status(200).json({ message: "Password changed successfully. Please log in again." });
  } catch (error) {
    next(error);
  }
};
