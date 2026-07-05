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
    },
    position: {
      type: Number,
      default: 0, // used for ordering links on the public profile
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only need createdAt per your spec
  }
);

const Link = mongoose.model("Link", linkSchema);

export default Link;