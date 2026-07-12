import express from "express";
import {
  trackProfileView,
  trackLinkClick,
  trackQrScan,
  getUserStats,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/profile-view", trackProfileView);
router.post("/link-click", trackLinkClick);
router.post("/qr-scan", trackQrScan);
router.get("/stats", getUserStats);

export default router;
