import xss from "xss";
import Link from "../models/link.js";

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

    const link = await Link.create({ userId, platform, title: xss(title), url, position, isHidden, isPinned, category });
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

    const updatedLink = await Link.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

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

    const deletedLink = await Link.findByIdAndDelete(id);
    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

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

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "items array is required" });
    }

    const updates = items.map(({ _id, position }) => ({
      updateOne: { filter: { _id }, update: { position } },
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

    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json(link);
  } catch (error) {
    next(error);
  }
};
