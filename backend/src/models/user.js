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
      required: true,
      // NOTE: stored as plain text for now (Day 1, no security).
      // bcrypt hashing will be added in Phase 2.
    },
    username: {
      type: String,
      required: true,
      unique: true,
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
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model("User", userSchema);

export default User;