/**
 * Extract audit context (IP, User-Agent, correlationId) from an Express
 * request. Called by controllers right before invoking AuditService.log().
 *
 * NOTE: `req.user` is populated by verifyToken middleware. For unauthenticated
 * events (failed login, forgot-password), pass actor info from the
 * service layer via the `metadata` or explicit args.
 */
export function auditContextFromReq(req) {
  return {
    ip: req.ip ?? req.socket?.remoteAddress ?? null,
    userAgent:
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : null,
    correlationId: req.correlationId ?? null,
  };
}

/**
 * Convenience: build a full AuditContext that merges request-derived
 * fields with the authenticated user's identity snapshot.
 *
 * req.user is populated by verifyToken:
 *   { userId, email, role }  — role is "user" or "admin"
 */
export function auditContextForUser(req) {
  return {
    ...auditContextFromReq(req),
    userId: req.user?.userId ?? null,
    actorEmail: req.user?.email ?? null,
    actorName: req.user?.name ?? null,
  };
}
