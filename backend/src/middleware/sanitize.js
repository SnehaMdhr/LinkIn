/**
 * Express 5–compatible MongoDB query sanitizer.
 *
 * Express 5 defines req.query and req.params as getter-only properties,
 * so we cannot reassign them (as express-mongo-sanitize does).
 * Instead we mutate the properties of those objects in place and reassign
 * only req.body (which is still writable).
 */

const DISALLOWED_KEYS = new Set([
  "$where",
  "$regex",
  "$ne",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$in",
  "$nin",
  "$or",
  "$and",
  "$not",
  "$nor",
  "$exists",
  "$expr",
  "$text",
  "$search",
  "$options",
  "$elemMatch",
  "$mod",
  "$all",
  "$size",
  "$pull",
  "$push",
  "$inc",
  "$set",
  "$unset",
  // Prototype-pollution keys
  "__proto__",
  "constructor",
  "prototype",
]);

/**
 * Walk an object tree and strip any key that matches the blacklist.
 * Returns a new object for plain values; mutates arrays in place.
 */
function sanitize(value) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = sanitize(value[i]);
    }
    return value;
  }

  if (value && typeof value === "object" && value.constructor === Object) {
    for (const key of Object.keys(value)) {
      if (DISALLOWED_KEYS.has(key)) {
        delete value[key];
      } else {
        value[key] = sanitize(value[key]);
      }
    }
    return value;
  }

  return value;
}

/** Mutate an object's own properties in place (for getter-only objects like Express 5's req.query). */
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (DISALLOWED_KEYS.has(key)) {
      delete obj[key];
    } else {
      const val = obj[key];
      if (val && typeof val === "object") {
        sanitizeInPlace(val);
      }
    }
  }
}

export default function mongoSanitize(options = {}) {
  return (req, _res, next) => {
    // req.body is writable — safe to reassign
    if (req.body && typeof req.body === "object") {
      req.body = sanitize(req.body);
    }

    // req.query is a getter in Express 5 — mutate in place instead
    if (req.query && typeof req.query === "object") {
      sanitizeInPlace(req.query);
    }

    // req.params is a getter in Express 5 — same treatment
    if (req.params && typeof req.params === "object") {
      sanitizeInPlace(req.params);
    }

    next();
  };
}
