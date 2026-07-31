import crypto from "crypto";
import { doubleCsrf } from "csrf-csrf";

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "csrf-secret-key-change-in-production",
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
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

export { generateCsrfToken, doubleCsrfProtection };
