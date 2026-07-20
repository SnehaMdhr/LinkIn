import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, logoutUser, forgotPassword, verifyOtpAndResetPassword } from "../controllers/authController.js";

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

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtpAndResetPassword);

export default router;