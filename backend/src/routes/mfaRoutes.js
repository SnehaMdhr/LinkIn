import express from "express";
import {
  setupMfa,
  verifyMfaSetup,
  disableMfa,
  getMfaStatus,
} from "../controllers/mfaController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/status", verifyToken, getMfaStatus);
router.post("/setup", verifyToken, setupMfa);
router.post("/verify-setup", verifyToken, verifyMfaSetup);
router.post("/disable", verifyToken, disableMfa);

export default router;
