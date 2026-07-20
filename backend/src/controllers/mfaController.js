import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";

// @desc  Setup MFA — generate TOTP secret and QR code
// @route POST /api/auth/mfa/setup
export const setupMfa = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Generate a TOTP secret
    const secret = speakeasy.generateSecret({
      name: `LinkIn:${req.user.email}`,
    });

    // Temporarily store the secret (not yet enabled)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.totpSecret = secret.base32;
    await user.save();

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "MFA setup initiated",
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify and enable MFA (confirm with first TOTP code)
// @route POST /api/auth/mfa/verify-setup
export const verifyMfaSetup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.totpSecret) return res.status(400).json({ message: "MFA not initialized. Please run setup first." });

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token,
      window: 1, // Allow 30s drift
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code. Please try again." });
    }

    user.mfaEnabled = true;
    await user.save();

    res.status(200).json({ message: "MFA has been enabled successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc  Disable MFA
// @route POST /api/auth/mfa/disable
export const disableMfa = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { token, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Require either TOTP code or password to disable
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token,
        window: 1,
      });
      if (!verified) return res.status(400).json({ message: "Invalid verification code" });
    } else if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    } else {
      return res.status(400).json({ message: "Verification code or password required to disable MFA" });
    }

    user.totpSecret = null;
    user.mfaEnabled = false;
    await user.save();

    res.status(200).json({ message: "MFA has been disabled" });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify TOTP code during login (step 2 of MFA login)
// @route POST /api/auth/mfa/verify-login
export const verifyMfaLogin = async (req, res, next) => {
  try {
    const { userId, token, rememberMe } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ message: "userId and token are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.mfaEnabled || !user.totpSecret) {
      return res.status(400).json({ message: "MFA is not enabled for this account" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Generate JWT after successful MFA verification
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    const maxAge = rememberMe !== false ? 15 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    res.status(200).json({
      message: "MFA verification successful",
      token: accessToken,
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

// @desc  Get MFA status (whether enabled/available)
// @route GET /api/auth/mfa/status
export const getMfaStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("totpSecret mfaEnabled");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      mfaEnabled: user.mfaEnabled,
      hasSecret: !!user.totpSecret,
    });
  } catch (error) {
    next(error);
  }
};
