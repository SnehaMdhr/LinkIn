import mongoose from "mongoose";
import Analytics from "../models/analytics.js";
import Link from "../models/link.js";

// @desc  Track a profile view
// @route POST /api/analytics/profile-view
export const trackProfileView = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    await Analytics.create({ userId, type: "profile_view" });
    res.status(200).json({ message: "Tracked" });
  } catch (error) {
    next(error);
  }
};

// @desc  Track a link click
// @route POST /api/analytics/link-click
export const trackLinkClick = async (req, res, next) => {
  try {
    const { userId, linkId } = req.body;
    if (!userId || !linkId) return res.status(400).json({ message: "userId and linkId are required" });

    await Analytics.create({ userId, linkId, type: "link_click" });
    res.status(200).json({ message: "Tracked" });
  } catch (error) {
    next(error);
  }
};

// @desc  Track a QR scan
// @route POST /api/analytics/qr-scan
export const trackQrScan = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    await Analytics.create({ userId, type: "qr_scan" });
    res.status(200).json({ message: "Tracked" });
  } catch (error) {
    next(error);
  }
};

// @desc  Get dashboard stats for the authenticated user
// @route GET /api/analytics/stats
export const getUserStats = async (req, res, next) => {
  try {
    // IDOR fix: always use the authenticated user's ID, ignore query params
    const userId = req.user.userId;
    if (!userId) return res.status(400).json({ message: "Not authenticated" });

    const [profileViews, linkClicks, qrScans, totalLinksCount] = await Promise.all([
      Analytics.countDocuments({ userId, type: "profile_view" }),
      Analytics.countDocuments({ userId, type: "link_click" }),
      Analytics.countDocuments({ userId, type: "qr_scan" }),
      Link.countDocuments({ userId }),
    ]);

    const mostClicked = await Analytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "link_click" } },
      { $group: { _id: "$linkId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let mostClickedLink = null;
    if (mostClicked.length > 0 && mostClicked[0]._id) {
      mostClickedLink = await Link.findById(mostClicked[0]._id).select("title url");
    }

    const recentLinks = await Link.find({ userId }).sort({ createdAt: -1 }).limit(5).select("title platform url createdAt");

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const dailyViews = await Analytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "profile_view", date: { $gte: lastWeek } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const weeklyViews = await Analytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "profile_view", date: { $gte: lastMonth } } },
      { $group: { _id: { $week: "$date" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const monthlyViews = await Analytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "profile_view", date: { $gte: lastYear } } },
      { $group: { _id: { $month: "$date" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      profileViews,
      linkClicks,
      qrScans,
      totalLinks: totalLinksCount,
      mostClickedLink,
      recentLinks,
      dailyViews,
      weeklyViews,
      monthlyViews,
    });
  } catch (error) {
    next(error);
  }
};
