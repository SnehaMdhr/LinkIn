import xss from "xss";
import Link from "../models/link.js";
import { auditService } from "../services/audit.service.js";
import { auditContextForUser } from "../middlewares/auditContext.js";

// @desc  Get all links for the logged-in user
// @route GET /api/links
export const getLinks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const links = await Link.find({ userId }).sort({ isPinned: -1, position: 1 });
    res.status(200).json(links);
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new link
// @route POST /api/links
export const createLink = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { platform, title, url, position, isHidden, isPinned, category } = req.body;

    if (!platform || !title || !url) {
      return res.status(400).json({ message: "platform, title, and url are required" });
    }

    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ message: "URL must start with http:// or https://" });
    }

    const link = await Link.create({ userId, platform, title: xss(title), url, position, isHidden, isPinned, category });

    // Fire-and-forget audit log
    auditService.log("profile_updated", {
      ...auditContextForUser(req),
      userId: userId.toString(),
      metadata: { action: "link_created", linkId: link._id.toString(), platform, title },
    });

    res.status(201).json({ message: "Link created", link });
  } catch (error) {
    next(error);
  }
};

// @desc  Update an existing link
// @route PUT /api/links/:id
export const updateLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const allowed = ["platform", "title", "url", "position", "isHidden", "isPinned", "category"];

    // Only include fields that were actually sent in the request body
    const updateFields = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updateFields[field] = field === "title" ? xss(req.body[field]) : req.body[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    if (updateFields.url && !/^https?:\/\//i.test(updateFields.url)) {
      return res.status(400).json({ message: "URL must start with http:// or https://" });
    }

    // IDOR check: only update if the link belongs to the authenticated user
    const updatedLink = await Link.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Fire-and-forget audit log
    auditService.log("profile_updated", {
      ...auditContextForUser(req),
      userId: userId.toString(),
      metadata: { action: "link_updated", linkId: id, updatedFields: Object.keys(updateFields) },
    });

    res.status(200).json({ message: "Link updated", link: updatedLink });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a link
// @route DELETE /api/links/:id
export const deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // IDOR check: ensure the link belongs to the authenticated user
    const deletedLink = await Link.findOneAndDelete({ _id: id, userId });
    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Fire-and-forget audit log
    auditService.log("profile_updated", {
      ...auditContextForUser(req),
      userId: userId.toString(),
      metadata: { action: "link_deleted", linkId: id, platform: deletedLink.platform },
    });

    res.status(200).json({ message: "Link deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc  Reorder links (bulk update positions)
// @route PUT /api/links/reorder
export const reorderLinks = async (req, res, next) => {
  try {
    const { items } = req.body;
    const userId = req.user.userId;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "items array is required" });
    }

    // IDOR check: only reorder links that belong to the authenticated user
    const linkIds = items.map((item) => item._id);
    const ownedCount = await Link.countDocuments({ _id: { $in: linkIds }, userId });
    if (ownedCount !== linkIds.length) {
      return res.status(403).json({ message: "You can only reorder your own links" });
    }

    const updates = items.map(({ _id, position }) => ({
      updateOne: { filter: { _id, userId }, update: { position } },
    }));

    await Link.bulkWrite(updates);
    res.status(200).json({ message: "Links reordered" });
  } catch (error) {
    next(error);
  }
};

// @desc  Get a single link by its ID
// @route GET /api/links/single/:id
export const getLinkById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // IDOR check: ensure the link belongs to the authenticated user
    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json(link);
  } catch (error) {
    next(error);
  }
};
