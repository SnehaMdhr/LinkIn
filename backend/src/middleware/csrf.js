import crypto from "crypto";
import { doubleCsrf } from "csrf-csrf";

// FIX: no hardcoded fallback secret — CSRF_SECRET must be configured
const csrfSecret = process.env.CSRF_SECRET;
if (!csrfSecret) {
  throw new Error("CSRF_SECRET environment variable must be set");
}

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) => {
    // Use JWT userId for authenticated users
    if (req.user?.userId) return req.user.userId.toString();
    // Use session ID already set in this request (by token endpoint)
    if (req.sessionId) return req.sessionId;
    // Read existing session cookie
    if (!req.cookies?.["session-id"]) {
      req.sessionId = crypto.randomUUID();
    } else {
      req.sessionId = req.cookies["session-id"];
    }
    return req.sessionId;
  },
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

export { generateCsrfToken, doubleCsrfProtection };
