import AuditLog from "../models/AuditLog.js";
import { auditService } from "../services/audit.service.js";
import { isAuditEvent } from "../types/audit.types.js";

/** Convert a Mongoose lean doc to the API-facing entry shape. */
function toEntry(doc) {
  return {
    id: String(doc._id),
    event: doc.event,
    userId: doc.userId,
    actorEmail: doc.actorEmail,
    actorName: doc.actorName,
    ip: doc.ip,
    userAgent: doc.userAgent,
    correlationId: doc.correlationId,
    metadata: doc.metadata,
    hash: doc.hash,
    prevHash: doc.prevHash,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

/** Build a Mongoose filter from the common query params. */
function buildFilter(query, opts = {}) {
  const filter = {};

  if (opts.restrictToUserId) {
    // User endpoint: HARD filter. Ignore any userId the user tries to pass.
    filter.userId = opts.restrictToUserId;
  }

  if (query.event && isAuditEvent(query.event)) {
    filter.event = query.event;
  }

  const createdAtRange = {};
  if (query.dateFrom) {
    createdAtRange.$gte = new Date(query.dateFrom);
  }
  if (query.dateTo) {
    const end = new Date(query.dateTo);
    end.setHours(23, 59, 59, 999);
    createdAtRange.$lte = end;
  }
  if (Object.keys(createdAtRange).length > 0) {
    filter.createdAt = createdAtRange;
  }

  // Admin-only free-text search across email/ip/userId
  if (query.search && !opts.restrictToUserId) {
    const esc = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { actorEmail: { $regex: esc, $options: "i" } },
      { ip: { $regex: esc, $options: "i" } },
      { userId: { $regex: esc, $options: "i" } },
    ];
  }

  return filter;
}

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "50", 10) || 50));
  return { page, limit };
}

export class AuditController {
  /**
   * GET /api/admin/audit-logs
   * Admin-only: full visibility with filters + search.
   */
  async getAdminAuditLogs(req, res) {
    const query = req.query;
    const { page, limit } = parsePagination(query);
    const filter = buildFilter(query, { restrictToUserId: undefined });

    const [docs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      AuditLog.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: docs.map(toEntry),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }

  /**
   * GET /api/me/activity
   * User-only: returns ONLY the authenticated user's own audit entries.
   * Server-side hard filter on req.user.userId — the user cannot query
   * anyone else's logs through this endpoint.
   */
  async getMyActivity(req, res) {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const query = req.query;
    const { page, limit } = parsePagination(query);
    // HARD server-side filter — ignore any userId in the query.
    const filter = buildFilter(query, { restrictToUserId: user.userId });

    const [docs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      AuditLog.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: docs.map(toEntry),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }

  /**
   * GET /api/admin/audit-logs/verify
   * Admin-only: run the chain integrity check. Returns the report.
   * Heavy operation — recommend rate-limiting this route.
   */
  async verifyChain(_req, res) {
    const report = await auditService.verifyChain();
    res.status(200).json({ success: true, data: report });
  }
}
