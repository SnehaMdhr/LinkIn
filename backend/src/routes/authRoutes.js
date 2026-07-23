import express from "express";
import { logoutUser, changePassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/logout", logoutUser);
router.post("/change-password", verifyToken, changePassword);

export default router;