import xss from "xss";
import User from "../models/user.js";

// @desc  Get logged-in user's profile
// @route GET /api/profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc  Get user's profile customization
// @route GET /api/profile/customization
export const getCustomization = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("profileCustomization");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.profileCustomization || {});
  } catch (error) {
    next(error);
  }
};

// @desc  Update user's profile customization
// @route PUT /api/profile/customization
export const updateCustomization = async (req, res, next) => {
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
    next(error);
  }
};

// @desc  Reset user's profile customization to defaults
// @route PUT /api/profile/customization/reset
export const resetCustomization = async (req, res, next) => {
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
    next(error);
  }
};

// @desc  Update logged-in user's profile
// @route PUT /api/profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Mass assignment protection: only allow specific fields
    const ALLOWED_FIELDS = ["name", "bio", "theme", "profileImage"];

    const updateData = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        if (field === "bio") {
          updateData[field] = xss(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    // Handle file upload separately
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

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
    next(error);
  }
};
