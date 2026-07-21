/**
 * Wraps an async route handler so that any rejected promise
 * is forwarded to Express error-handling middleware.
 * Note: Express v5 already catches async errors automatically,
 * but this provides explicit compatibility and clarity.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
