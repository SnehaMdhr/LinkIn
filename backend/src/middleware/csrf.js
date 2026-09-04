import crypto from "crypto";
import { doubleCsrf } from "csrf-csrf";

const getCsrfSecret = () => {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error("CSRF_SECRET environment variable must be set");
  }
  return secret;
};

let _generateCsrfToken;
let _doubleCsrfProtection;

function initCsrf() {
  if (_generateCsrfToken) return;
  const result = doubleCsrf({
    getSecret: getCsrfSecret,
    getSessionIdentifier: (req) => {
      if (req.user?.userId) return req.user.userId.toString();
      if (req.sessionId) return req.sessionId;
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
  _generateCsrfToken = result.generateCsrfToken;
  _doubleCsrfProtection = result.doubleCsrfProtection;
}

const generateCsrfToken = (req, res) => {
  initCsrf();
  return _generateCsrfToken(req, res);
};

const doubleCsrfProtection = (req, res, next) => {
  initCsrf();
  return _doubleCsrfProtection(req, res, next);
};

export { generateCsrfToken, doubleCsrfProtection };
