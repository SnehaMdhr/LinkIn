import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import connectDB from "../src/config/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "../src/middleware/errorHandler.js";
import publicAuthRoutes from "../src/routes/publicAuthRoutes.js";
import publicMfaRoutes from "../src/routes/publicMfaRoutes.js";
import authRoutes from "../src/routes/authRoutes.js";
import profileRoutes from "../src/routes/profileRoutes.js";
import linkRoutes from "../src/routes/linkRoutes.js";
import publicRoutes from "../src/routes/publicRoutes.js";
import adminRoutes from "../src/routes/adminRoutes.js";
import analyticsRoutes from "../src/routes/analyticsRoutes.js";
import { generateCsrfToken, doubleCsrfProtection } from "../src/middleware/csrf.js";
import mfaRoutes from "../src/routes/mfaRoutes.js";
import { correlationIdMiddleware } from "../src/middlewares/correlationId.js";
import auditRoutes from "../src/routes/audit.routes.js";

// Connect to MongoDB (cached for serverless)
let isConnected = false;
const connectOnce = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

const app = express();

app.use(morgan("combined"));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ].filter(Boolean);
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

app.get("/", (req, res) => {
  res.send("LinkIn API is running...");
});

app.get("/api/csrf-token", async (req, res) => {
  await connectOnce();
  if (!req.cookies?.["session-id"]) {
    const sessionId = crypto.randomUUID();
    req.sessionId = sessionId;
    res.cookie("session-id", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

app.use(correlationIdMiddleware);

// Public routes
app.use("/api/auth", publicAuthRoutes);
app.use("/api/auth/mfa", publicMfaRoutes);
app.use("/api/analytics", async (req, res, next) => { await connectOnce(); next(); }, analyticsRoutes);

// CSRF protection
app.use("/api", async (req, res, next) => { await connectOnce(); next(); }, doubleCsrfProtection);

// Protected routes
app.use("/api/auth", async (req, res, next) => { await connectOnce(); next(); }, authRoutes);
app.use("/api/auth/mfa", async (req, res, next) => { await connectOnce(); next(); }, mfaRoutes);
app.use("/api/profile", async (req, res, next) => { await connectOnce(); next(); }, profileRoutes);
app.use("/api/links", async (req, res, next) => { await connectOnce(); next(); }, linkRoutes);
app.use("/api/user", async (req, res, next) => { await connectOnce(); next(); }, publicRoutes);
app.use("/api/admin", async (req, res, next) => { await connectOnce(); next(); }, adminRoutes);
app.use("/api", async (req, res, next) => { await connectOnce(); next(); }, auditRoutes);

app.use(errorHandler);

export default app;
