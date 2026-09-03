import express from "express";
import { verifyMfaLogin } from "../controllers/mfaController.js";

const router = express.Router();

router.post("/verify-login", verifyMfaLogin);

export default router;
