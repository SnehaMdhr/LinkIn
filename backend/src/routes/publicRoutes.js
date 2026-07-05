import express from "express";
import { getPublicProfile } from "../controllers/pubilicController.js";

const router = express.Router();

router.get("/:username", getPublicProfile);

export default router;