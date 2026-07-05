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

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, bio, profileImage, theme },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};