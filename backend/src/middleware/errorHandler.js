const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Mongoose invalid ObjectId (e.g. bad /:id param)
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongoose validation failure
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation failed", errors: messages });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Duplicate value for ${field}` });
  }

  // JWT issues
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired." });
  }

  // Default: unexpected server error
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
