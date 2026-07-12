import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["profile_view", "link_click", "qr_scan"],
      required: true,
    },
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

analyticsSchema.index({ userId: 1, type: 1, date: -1 });
analyticsSchema.index({ userId: 1, date: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
