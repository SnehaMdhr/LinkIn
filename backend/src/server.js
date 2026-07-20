import crypto from "crypto";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { generateCsrfToken, doubleCsrfProtection } from "./middleware/csrf.js";
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(morgan("combined"));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = ["http://localhost:3000", "http://localhost:3001"];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Test route to confirm server is alive
app.get("/", (req, res) => {
  res.send("LinkIn API is running...");
});

// CSRF token endpoint (excluded from protection so clients can fetch a token)
app.get("/api/csrf-token", (req, res) => {
  // Set a stable session identifier if the visitor doesn't have one yet
  if (!req.cookies?.["session-id"]) {
    const sessionId = crypto.randomUUID();
    req.sessionId = sessionId;
    res.cookie("session-id", sessionId, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

// Public tracking endpoints + auth routes (called before user has CSRF token)
// Auth routes already have rate limiting + captcha verification
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

// Apply CSRF protection to all other state-changing API routes
app.use("/api", doubleCsrfProtection);

// Protected routes (require CSRF token for POST/PUT/DELETE)
app.use("/api/profile", profileRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/user", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});