import User from "../models/user.js";
import Link from "../models/link.js";

// @desc  Get all users (optionally filtered by search query)
// @route GET /api/admin/users?search=xxxx
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Get single user details + their links
// @route GET /api/admin/users/:id
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const links = await Link.find({ userId: id }).sort({ position: 1 });

    res.status(200).json({ user, links });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Update user status (suspend/activate) or role
// @route PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...(status && { status }), ...(role && { role }) },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Delete a user (and their links)
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clean up their links too, so we don't leave orphaned data
    await Link.deleteMany({ userId: id });

    res.status(200).json({ message: "User and their links deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};