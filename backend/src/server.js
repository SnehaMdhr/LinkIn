import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { generateCsrfToken, doubleCsrfProtection } from "./middleware/csrf.js";
import mfaRoutes from "./routes/mfaRoutes.js";
import { correlationIdMiddleware } from "./middlewares/correlationId.js";
import auditRoutes from "./routes/audit.routes.js";
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(morgan("combined"));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3001",
    ];
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

// ─── Correlation ID (stamped on every request for audit trail) ────
app.use(correlationIdMiddleware);

// Public tracking endpoints + auth + MFA routes (called before user has CSRF token)
// Auth routes already have rate limiting + captcha verification
// MFA verify-login is public (needed during login step 2 before user is authenticated)
app.use("/api/auth", authRoutes);
app.use("/api/auth/mfa", mfaRoutes);
app.use("/api/analytics", analyticsRoutes);

// Apply CSRF protection to all other state-changing API routes
app.use("/api", doubleCsrfProtection);

// Protected routes (require CSRF token for POST/PUT/DELETE)
app.use("/api/profile", profileRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/user", publicRoutes);
app.use("/api/admin", adminRoutes);

// Audit log routes (RBAC-scoped: user activity + admin audit logs)
app.use("/api", auditRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ─── TLS options (graceful fallback if certs missing) ──────────────
const keyPath = path.join(__dirname, "..", "localhost+2-key.pem");
const certPath = path.join(__dirname, "..", "localhost+2.pem");
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

if (hasCerts) {
  const tlsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  // HTTP → HTTPS redirect
  const httpApp = express();
  httpApp.use((req, res) => {
    res.redirect(301, `https://localhost:${PORT}${req.url}`);
  });

  https.createServer(tlsOptions, app).listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
  });

  const HTTP_PORT = process.env.HTTP_PORT || 5001;
  http.createServer(httpApp).listen(HTTP_PORT, () => {
    console.log(`HTTP redirect server running on http://localhost:${HTTP_PORT}`);
  });
} else {
  // Fallback to HTTP
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[SSL] Certs not found. To enable HTTPS, run mkcert in backend/certs/`);
  });
}