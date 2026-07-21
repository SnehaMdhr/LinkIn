import crypto from "crypto";

/**
 * Ensures every request has an X-Correlation-Id.
 * - If the client sent one (e.g. from a calling service or upstream proxy), reuse it.
 * - Otherwise generate a fresh UUID v4.
 * - Attach to req.correlationId and echo back on the response header so
 *   downstream services / logs can trace the same request.
 */
export function correlationIdMiddleware(req, res, next) {
  const incoming = req.headers["x-correlation-id"];
  req.correlationId =
    typeof incoming === "string" && incoming.length > 0
      ? incoming
      : crypto.randomUUID();
  res.setHeader("X-Correlation-Id", req.correlationId);
  next();
}
