import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true, // e.g. "GitHub", "Instagram", "Website"
    },
    title: {
      type: String,
      required: true, // e.g. "My GitHub Profile"
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^https?:\/\//i.test(v),
        message: "URL must start with http:// or https://",
      },
    },
    position: {
      type: Number,
      default: 0, // used for ordering links on the public profile
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "Others",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only need createdAt per your spec
  }
);

const Link = mongoose.model("Link", linkSchema);

export default Link;