import jwt from "jsonwebtoken";
import User from "../models/user.js";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Try Authorization header first, then fall back to the httpOnly cookie
  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.error("[verifyToken] No Bearer token in Authorization header or cookie");
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("tokenVersion").lean();
    if (!user) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    // Handle legacy users whose DB documents don't have tokenVersion
    const dbTokenVersion = user.tokenVersion ?? 0;
    if (dbTokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("[verifyToken] JWT verification FAILED:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

export { verifyToken, isAdmin };
export default verifyToken;