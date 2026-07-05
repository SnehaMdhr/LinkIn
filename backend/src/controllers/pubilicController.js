import User from "../models/user.js";
import Link from "../models/link.js";

// @desc  Get a public profile by username
// @route GET /api/user/:username
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password -email -role -status");
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const links = await Link.find({ userId: user._id }).sort({ position: 1 });

    res.status(200).json({ user, links });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};