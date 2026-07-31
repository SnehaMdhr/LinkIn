import AuditLog from "../models/AuditLog.js";
import { isAuditEvent } from "../types/audit.types.js";
import { computeAuditHash } from "../utils/hashChain.js";

/**
 * Singleton-ish audit logger.
 *
 * CONTRACT:
 *  - `log()` is async but MUST be called fire-and-forget (no await) in
 *    hot paths. Internally it swallows all errors and logs them to
 *    console.error. Logging must NEVER break auth/business flows.
 *  - Unknown events are rejected silently (logged) — fail closed so a
 *    typo doesn't pollute the audit trail with invalid event names.
 *  - IP is normalized (`::ffff:` prefix stripped) before storage.
 */
export class AuditService {
  /**
   * Write a structured, hash-chained audit log entry.
   * Never throws. Returns void (fire-and-forget).
   */
  async log(event, ctx) {
    try {
      if (!isAuditEvent(event)) {
        console.error(
          `[AuditService] Rejected unknown event "${event}". ` +
            `Add it to AUDIT_EVENTS if intentional. Context:`,
          { userId: ctx.userId, ip: ctx.ip },
        );
        return;
      }

      await AuditLog.appendEntry({
        event,
        userId: ctx.userId ?? null,
        actorEmail: ctx.actorEmail ?? null,
        actorName: ctx.actorName ?? null,
        ip: normalizeIp(ctx.ip),
        userAgent: ctx.userAgent ?? null,
        correlationId: ctx.correlationId ?? null,
        metadata: ctx.metadata ?? null,
        createdAt: new Date(),
      });
    } catch (err) {
      // Logging must never crash the caller.
      console.error("[AuditService] Failed to write audit log:", err);
    }
  }

  /**
   * Verify the integrity of the hash chain.
   * Walks every entry in createdAt order, recomputes each hash, and
   * checks (a) the stored hash matches the recomputed hash, and
   * (b) prevHash matches the previous entry's hash.
   *
   * Returns a report. If any entry is broken, also logs a
   * `audit_chain_broken` event (meta-logging the integrity failure).
   *
   * WARNING: This is O(n) over the whole collection. Run it as a cron
   * job, not on every request.
   */
  async verifyChain() {
    const cursor = AuditLog.find()
      .sort({ createdAt: 1 })
      .select("-__v")
      .lean()
      .cursor();

    let prevHash = null;
    let count = 0;
    let brokenId = null;
    let reason = "";

    for await (const doc of cursor) {
      count++;
      const recomputed = computeHashForDoc(doc);
      if (doc.prevHash !== prevHash) {
        brokenId = String(doc._id);
        reason = `prevHash mismatch at entry #${count}: stored=${doc.prevHash} expected=${prevHash}`;
        break;
      }
      if (doc.hash !== recomputed) {
        brokenId = String(doc._id);
        reason = `hash mismatch at entry #${count}: stored=${doc.hash} recomputed=${recomputed}`;
        break;
      }
      prevHash = doc.hash;
    }

    const ok = brokenId === null;

    if (!ok) {
      try {
        await AuditLog.appendEntry({
          event: "audit_chain_broken",
          userId: null,
          actorEmail: "system",
          actorName: "Integrity Checker",
          ip: null,
          userAgent: null,
          correlationId: null,
          metadata: { brokenAt: brokenId, reason, entriesChecked: count },
          createdAt: new Date(),
        });
      } catch {
        console.error("[AuditService] Chain broken AND failed to log it:", reason);
      }
    }

    return {
      ok,
      totalEntries: count,
      brokenAt: brokenId,
      reason: reason || null,
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Strip IPv4-mapped IPv6 prefix for clean display + consistent matching. */
function normalizeIp(ip) {
  if (!ip) return null;
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

/**
 * Recompute the hash for a stored document (lean form).
 * Used by verifyChain.
 */
function computeHashForDoc(doc) {
  return computeAuditHash({
    event: doc.event,
    userId: doc.userId,
    actorEmail: doc.actorEmail,
    actorName: doc.actorName,
    ip: doc.ip,
    userAgent: doc.userAgent,
    correlationId: doc.correlationId,
    metadata: doc.metadata,
    prevHash: doc.prevHash,
    createdAt: new Date(doc.createdAt),
  });
}

/**
 * Shared singleton instance — reuse across controllers/services to avoid
 * repeated instantiation.
 */
export const auditService = new AuditService();
export default auditService;
