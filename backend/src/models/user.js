import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: "", // Empty for OAuth users
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      default: "light",
    },
    role: {
      type: String,
      default: "user", // "user" or "admin"
    },
    status: {
      type: String,
      default: "active", // "active" or "suspended"
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    profileCustomization: {
      backgroundType: { type: String, default: "gradient" },
      backgroundColor: { type: String, default: "#ffffff" },
      backgroundGradient: { type: String, default: "lime-emerald" },
      backgroundImage: { type: String, default: "" },
      accentColor: { type: String, default: "#AFF33E" },
      textColor: { type: String, default: "#000000" },
      textColorSecondary: { type: String, default: "#6b7280" },
      font: { type: String, default: "Inter" },
      layout: { type: String, default: "classic" },
      avatarShape: { type: String, default: "circle" },
      buttonStyle: { type: String, default: "pill" },
      buttonWidth: { type: String, default: "full" },
      buttonAnimation: { type: String, default: "lift" },
      buttonTextColor: { type: String, default: "#000000" },
      linkAlignment: { type: String, default: "center" },
      cardOpacity: { type: Number, default: 18 },
      cardBlur: { type: String, default: "medium" },
      cardBorderColor: { type: String, default: "#ffffff" },
      cardBorderWidth: { type: String, default: "1px" },
      showBio: { type: Boolean, default: true },
      showIcons: { type: Boolean, default: true },
      showQr: { type: Boolean, default: true },
      showProfilePicture: { type: Boolean, default: true },
      qrPosition: { type: String, default: "bottom" },
      animation: { type: String, default: "fade" },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model("User", userSchema);

export default User;