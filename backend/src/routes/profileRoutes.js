import express from "express";
import { getProfile, updateProfile, getCustomization, updateCustomization, resetCustomization } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", getProfile);
router.put("/", updateProfile);
router.get("/customization", getCustomization);
router.put("/customization", updateCustomization);
router.put("/customization/reset", resetCustomization);

export default router;