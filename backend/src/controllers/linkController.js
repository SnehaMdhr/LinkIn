import Link from "../models/link.js";

// @desc  Get all links for a user
// @route GET /api/links?userId=xxxx
export const getLinks = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const links = await Link.find({ userId }).sort({ position: 1 });
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Create a new link
// @route POST /api/links
export const createLink = async (req, res) => {
  try {
    const { userId, platform, title, url, position } = req.body;

    if (!userId || !platform || !title || !url) {
      return res.status(400).json({ message: "userId, platform, title, and url are required" });
    }

    const link = await Link.create({ userId, platform, title, url, position });
    res.status(201).json({ message: "Link created", link });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Update an existing link
// @route PUT /api/links/:id
export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, title, url, position } = req.body;

    const updatedLink = await Link.findByIdAndUpdate(
      id,
      { platform, title, url, position },
      { new: true, runValidators: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json({ message: "Link updated", link: updatedLink });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Delete a link
// @route DELETE /api/links/:id
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLink = await Link.findByIdAndDelete(id);
    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json({ message: "Link deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Get a single link by its ID
// @route GET /api/links/single/:id
export const getLinkById = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};