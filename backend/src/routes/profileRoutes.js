import express from "express";
import { getProfile, updateProfile, getCustomization, updateCustomization, resetCustomization } from "../controllers/profileController.js";
import verifyToken from "../middleware/verifyToken.js";
import upload from "../config/upload.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);

// Wrap multer upload in inline error handler so file filter / size errors are caught HERE
// instead of falling through to the generic error handler
router.put("/", verifyToken, (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      // Multer fileFilter error (wrong file type)
      if (err.message && err.message.includes("Only JPEG")) {
        return res.status(400).json({ message: err.message });
      }
      // Multer file size error
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Max size is 2MB." });
      }
      // Any other multer error
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    next();
  });
}, updateProfile);

router.get("/customization", verifyToken, getCustomization);
router.put("/customization", verifyToken, updateCustomization);
router.put("/customization/reset", verifyToken, resetCustomization);

export default router;