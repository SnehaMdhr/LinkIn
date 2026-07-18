import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    const time = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    res.status(429).json({
      message: `Too many attempts. Please try again in ${time}.`,
    });
  },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;