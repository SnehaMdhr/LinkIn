import mongoose, { Schema } from "mongoose";
import { isAuditEvent } from "../types/audit.types.js";
import { computeAuditHash } from "../utils/hashChain.js";

const AuditLogSchema = new Schema(
  {
    event: {
      type: String,
      required: true,
      validate: {
        validator: (v) => isAuditEvent(v),
        message: (props) =>
          `Unknown audit event: "${props.value}". Add it to AUDIT_EVENTS.`,
      },
    },
    userId: { type: String, default: null },
    actorEmail: { type: String, default: null },
    actorName: { type: String, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    correlationId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
    hash: { type: String, required: true, unique: true, index: true },
    prevHash: { type: String, default: null, index: true },
  },
  {
    // Append-only: NO updatedAt. createdAt is set once.
    timestamps: { createdAt: true, updatedAt: false },
    // Don't return __v to clients.
    versionKey: false,
  },
);

// ─── Indexes for fast querying ──────────────────────────────────────
// User's own activity (most common query — user activity page).
AuditLogSchema.index({ userId: 1, createdAt: -1 });
// Filter by event type within a time window (admin filters).
AuditLogSchema.index({ event: 1, createdAt: -1 });
// Chronological admin browsing.
AuditLogSchema.index({ createdAt: -1 });
// Chain traversal: find the previous entry quickly.
AuditLogSchema.index({ prevHash: 1 });

// ─── Enforce append-only at the Mongoose layer ─────────────────────
// Block any update or delete attempted through Mongoose models.
AuditLogSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany", "replaceOne"],
  function (next) {
    next(new Error("AuditLog is append-only. Updates are not permitted."));
  },
);

AuditLogSchema.pre(
  ["deleteOne", "deleteMany", "findOneAndDelete"],
  function (next) {
    next(new Error("AuditLog is append-only. Deletes are not permitted."));
  },
);

/**
 * Static helper that creates a new chain entry.
 * It fetches the current tail (most recent entry by createdAt),
 * uses its hash as `prevHash`, computes this entry's hash, and inserts.
 */
AuditLogSchema.statics.appendEntry = async function (payload) {
  // Find current tail
  const tail = await this.findOne()
    .sort({ createdAt: -1 })
    .select("hash")
    .lean()
    .exec();

  const prevHash = tail ? tail.hash : null;

  const hash = computeAuditHash({
    ...payload,
    prevHash,
  });

  return this.create({
    event: payload.event,
    userId: payload.userId,
    actorEmail: payload.actorEmail,
    actorName: payload.actorName,
    ip: payload.ip,
    userAgent: payload.userAgent,
    correlationId: payload.correlationId,
    metadata: payload.metadata,
    prevHash,
    hash,
    // CRITICAL: pass createdAt explicitly so Mongoose's `timestamps`
    // option does NOT override it with a different millisecond. The hash
    // above was computed with payload.createdAt — if Mongoose generated
    // its own, verifyChain would always report a hash mismatch.
    createdAt: payload.createdAt,
  });
};

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;
