import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuditController } from "../controllers/audit.controller.js";
import verifyToken, { isAdmin } from "../middleware/verifyToken.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();
const controller = new AuditController();

// ─── User: own activity ─────────────────────────────────────────────
// Hard server-side filter on req.user.userId. No adminMiddleware.
router.get(
  "/me/activity",
  verifyToken,
  asyncHandler(controller.getMyActivity),
);

// ─── Admin: full visibility ─────────────────────────────────────────
router.get(
  "/admin/audit-logs",
  verifyToken,
  isAdmin,
  asyncHandler(controller.getAdminAuditLogs),
);

// Chain verification is expensive — rate-limit hard.
const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Chain verification is rate-limited. Max 3/hour.",
  },
});

router.get(
  "/admin/audit-logs/verify",
  verifyToken,
  isAdmin,
  verifyLimiter,
  asyncHandler(controller.verifyChain),
);

export default router;
