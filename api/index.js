// Vercel serverless entry point — self-contained Express app
import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// ─── MongoDB connection ──────────────────────────────────────
let isConnected = false;
const connectOnce = async () => {
  if (isConnected) return;
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI");
  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
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
    ].filter(Boolean).map((url) => url.replace(/\/+$/, ""));
    if (!origin || allowed.includes(origin.replace(/\/+$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// ─── CSRF ─────────────────────────────────────────────────────
import { generateCsrfToken, doubleCsrfProtection } from "../backend/src/middleware/csrf.js";
import { correlationIdMiddleware } from "../backend/src/middlewares/correlationId.js";

// ─── Routes ───────────────────────────────────────────────────
import publicAuthRoutes from "../backend/src/routes/publicAuthRoutes.js";
import publicMfaRoutes from "../backend/src/routes/publicMfaRoutes.js";
import authRoutes from "../backend/src/routes/authRoutes.js";
import profileRoutes from "../backend/src/routes/profileRoutes.js";
import linkRoutes from "../backend/src/routes/linkRoutes.js";
import publicRoutes from "../backend/src/routes/publicRoutes.js";
import adminRoutes from "../backend/src/routes/adminRoutes.js";
import analyticsRoutes from "../backend/src/routes/analyticsRoutes.js";
import mfaRoutes from "../backend/src/routes/mfaRoutes.js";
import auditRoutes from "../backend/src/routes/audit.routes.js";
import errorHandler from "../backend/src/middleware/errorHandler.js";

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

// Public routes (no CSRF)
app.use("/api/auth", publicAuthRoutes);
app.use("/api/auth/mfa", publicMfaRoutes);
app.use("/api/analytics", async (req, res, next) => { await connectOnce(); next(); }, analyticsRoutes);

// CSRF protection for state-changing methods
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
