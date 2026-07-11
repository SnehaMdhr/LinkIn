import User from "../models/user.js";

// @desc  Register a new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, username: rawUsername } = req.body;
    const username = rawUsername?.trim();
    const trimmedEmail = email?.trim();
    const trimmedName = name?.trim();

    if (!username || !trimmedEmail || !trimmedName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: trimmedEmail }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    // NOTE: password stored as plain text for now (Day 1, no security)
    const user = await User.create({ name: trimmedName, email: trimmedEmail, password, username });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        theme: user.theme,
        bio: user.bio,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim();

    if (!trimmedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // NOTE: plain text comparison for now (Day 1, no security)
    // bcrypt.compare() will replace this in Phase 2
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    // NOTE: no JWT yet — returning basic user info directly (Day 1, no auth tokens)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        theme: user.theme,
        bio: user.bio,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};