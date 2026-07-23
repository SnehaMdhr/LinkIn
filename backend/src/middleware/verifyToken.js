import jwt from "jsonwebtoken";
import User from "../models/user.js";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[verifyToken] No Bearer token in Authorization header");
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch current tokenVersion and role from DB.
    // tokenVersion is checked to invalidate tokens after password changes.
    // role is fetched from DB (not the token) so that authorization checks
    // in downstream middleware like isAdmin always use the live DB value.
    // This means role changes (via API or directly in Compass) take effect
    // immediately without requiring the user to re-login.
    const user = await User.findById(decoded.userId).select("tokenVersion role").lean();
    if (!user) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    // Handle legacy users whose DB documents don't have tokenVersion
    const dbTokenVersion = user.tokenVersion ?? 0;
    if (dbTokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    // Override role with the live DB value so authorization decisions
    // (e.g., isAdmin middleware) always reflect the current role,
    // regardless of when the JWT was issued.
    req.user = { ...decoded, role: user.role };
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