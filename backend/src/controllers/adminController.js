import bcrypt from "bcrypt";
import User from "../models/user.js";
import Link from "../models/link.js";

const SALT_ROUNDS = 10;

// @desc  Create a new user
// @route POST /api/admin/users
export const createUser = async (req, res, next) => {
  try {
    const { name, email, username, password, role, status, profileImage } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "Name, email, username, and password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(400).json({ message: `A user with that ${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      role: role || "user",
      status: status || "active",
      profileImage: profileImage || "",
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ message: "User created", user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (optionally filtered by search query, with pagination)
// @route GET /api/admin/users?search=xxxx&page=1&limit=10
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

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

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single user details + their links
// @route GET /api/admin/users/:id
export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const links = await Link.find({ userId: id }).sort({ position: 1 });

    res.status(200).json({ user, links });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user (status, role, name, email, username, bio)
// @route PUT /api/admin/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Mass assignment protection: only allow specific fields
    const ALLOWED_FIELDS = ["status", "role", "name", "email", "username", "bio", "profileImage"];

    const updateFields = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a user (and their links)
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Link.deleteMany({ userId: id });

    res.status(200).json({ message: "User and their links deleted" });
  } catch (error) {
    next(error);
  }
};
