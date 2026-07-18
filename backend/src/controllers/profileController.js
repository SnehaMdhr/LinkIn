import User from "../models/user.js";

// @desc  Get logged-in user's profile
// @route GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

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

// @desc  Get user's profile customization
// @route GET /api/profile/customization?userId=xxxx
export const getCustomization = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }
    const user = await User.findById(userId).select("profileCustomization");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.profileCustomization || {});
  } catch (error) {
    console.error("Get customization error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Update user's profile customization
// @route PUT /api/profile/customization
export const updateCustomization = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { customization } = req.body;
    if (!customization || typeof customization !== "object") {
      return res.status(400).json({ message: "customization object is required" });
    }

    const allowedFields = [
      "backgroundType", "backgroundColor", "backgroundGradient", "backgroundImage",
      "customGradientFrom", "customGradientTo",
      "accentColor", "textColor", "textColorSecondary", "font", "layout", "avatarShape", "buttonStyle", "buttonWidth",
      "buttonAnimation", "buttonTextColor", "linkAlignment", "cardOpacity", "cardBlur", "cardBorderColor", "cardBorderWidth",
      "showBio", "showIcons", "showQr", "showProfilePicture",
      "qrPosition", "animation",
    ];

    const sanitized = {};
    for (const field of allowedFields) {
      if (customization[field] !== undefined) {
        sanitized[`profileCustomization.${field}`] = customization[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: sanitized },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Customization updated", user: updatedUser });
  } catch (error) {
    console.error("Update customization error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Reset user's profile customization to defaults
// @route PUT /api/profile/customization/reset
export const resetCustomization = async (req, res) => {
  try {
    const userId = req.user.userId;

    const defaults = {
      backgroundType: "gradient",
      backgroundColor: "#ffffff",
      backgroundGradient: "lime-emerald",
      backgroundImage: "",
      customGradientFrom: "#84cc16",
      customGradientTo: "#10b981",
      accentColor: "#AFF33E",
      textColor: "#000000",
      textColorSecondary: "#6b7280",
      font: "Inter",
      layout: "classic",
      avatarShape: "circle",
      buttonStyle: "pill",
      buttonWidth: "full",
      buttonAnimation: "lift",
      buttonTextColor: "#000000",
      linkAlignment: "center",
      cardOpacity: 18,
      cardBlur: "medium",
      cardBorderColor: "#ffffff",
      cardBorderWidth: "1px",
      showBio: true,
      showIcons: true,
      showQr: true,
      showProfilePicture: true,
      qrPosition: "bottom",
      animation: "fade",
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profileCustomization: defaults } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Customization reset to defaults", user: updatedUser });
  } catch (error) {
    console.error("Reset customization error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Update logged-in user's profile
// @route PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, profileImage, theme } = req.body;

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