import crypto from "crypto";

/**
 * Deterministic JSON serialization: sorts object keys recursively so that
 * re-hashing the same logical payload always produces the same string.
 * Without this, key insertion order would make hashes non-reproducible.
 */
export function canonicalJsonStringify(value) {
  // Primitives & null — JSON.stringify handles these. `undefined` is
  // normalized to `null` so the output is always a valid JSON string
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  // Date — serialize deterministically via toISOString().
  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJsonStringify).join(",")}]`;
  }
  const sortedKeys = Object.keys(value).sort();
  const pairs = sortedKeys.map(
    (k) => `"${k}":${canonicalJsonStringify(value[k])}`,
  );
  return `{${pairs.join(",")}}`;
}

/**
 * Compute the SHA-256 hash of an audit log entry's payload.
 * The payload excludes `hash` itself (that's what we're computing) and
 * excludes `_id` / `__v` (Mongoose internals). `prevHash` IS included so
 * the chain links backwards.
 */
export function computeAuditHash(payload) {
  const serialized = canonicalJsonStringify({
    event: payload.event,
    userId: payload.userId,
    actorEmail: payload.actorEmail,
    actorName: payload.actorName,
    ip: payload.ip,
    userAgent: payload.userAgent,
    correlationId: payload.correlationId,
    metadata: payload.metadata,
    prevHash: payload.prevHash,
    // toISOString gives deterministic UTC — avoids locale/timezone drift
    createdAt: payload.createdAt.toISOString(),
  });
  return crypto.createHash("sha256").update(serialized, "utf8").digest("hex");
}
