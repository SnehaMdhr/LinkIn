import crypto from "crypto";
import { doubleCsrf } from "csrf-csrf";

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
  if (req.sessionId) {
    return req.sessionId;
  }

  if (req.cookies?.["session-id"]) {
    req.sessionId = req.cookies["session-id"];
    return req.sessionId;
  }

  req.sessionId = crypto.randomUUID();
  return req.sessionId;
},

  cookieName: "csrf-token",

  cookieOptions: {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  },

  size: 64,

  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

export { generateCsrfToken, doubleCsrfProtection };