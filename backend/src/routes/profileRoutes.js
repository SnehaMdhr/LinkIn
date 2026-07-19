import express from "express";
import { getProfile, updateProfile, getCustomization, updateCustomization, resetCustomization } from "../controllers/profileController.js";
import verifyToken from "../middleware/verifyToken.js";
import upload from "../config/upload.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, upload.single("profileImage"), updateProfile);
router.get("/customization", verifyToken, getCustomization);
router.put("/customization", verifyToken, updateCustomization);
router.put("/customization/reset", verifyToken, resetCustomization);

export default router;