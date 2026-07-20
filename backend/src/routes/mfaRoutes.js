import express from "express";
import {
  setupMfa,
  verifyMfaSetup,
  disableMfa,
  verifyMfaLogin,
  getMfaStatus,
} from "../controllers/mfaController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Public route — used during login step 2
router.post("/verify-login", verifyMfaLogin);

// Protected routes — require auth
router.get("/status", verifyToken, getMfaStatus);
router.post("/setup", verifyToken, setupMfa);
router.post("/verify-setup", verifyToken, verifyMfaSetup);
router.post("/disable", verifyToken, disableMfa);

export default router;
