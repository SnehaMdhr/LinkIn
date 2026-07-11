import mongoose from "mongoose";
import User from "../models/user.js";

// @desc  Get logged-in user's profile
// @route GET /api/profile?userId=xxxx
// NOTE: userId comes from query param for now — no auth middleware yet (Day 1)
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Update logged-in user's profile
// @route PUT /api/profile
// NOTE: userId comes from request body for now — no auth middleware yet (Day 1)
export const updateProfile = async (req, res) => {
  try {
    const { userId, name, bio, profileImage, theme } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format — your session may be corrupted. Try logging out and back in.",
        receivedUserId: userId,
      });
    }

    // Only update fields that are actually provided (supports both full
    // profile saves from the profile page and partial updates like theme-only)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (theme !== undefined) updateData.theme = theme;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Profile update validation error:", error.errors);
    } else {
      console.error("Profile update error:", error);
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};