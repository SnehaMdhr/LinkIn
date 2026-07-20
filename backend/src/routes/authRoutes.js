import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, logoutUser, forgotPassword, googleSignIn, verifyOtpAndResetPassword, changePassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyTurnstile } from "../middleware/verifyTurnstile.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime;
    const msRemaining = resetTime ? resetTime - Date.now() : options.windowMs;
    const totalSeconds = Math.ceil(Math.max(0, msRemaining) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const time = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    res.status(429).json({
      message: `Too many attempts. Please try again in ${time}.`,
      resetTime: resetTime?.toISOString?.() || null,
    });
  },
});

router.post("/register", authLimiter, verifyTurnstile, registerUser);
router.post("/login", authLimiter, verifyTurnstile, loginUser);
router.post("/logout", logoutUser);
// Google sign-in (popup flow — no redirect URI needed)
router.post("/google", googleSignIn);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtpAndResetPassword);
router.post("/change-password", verifyToken, changePassword);

export default router;