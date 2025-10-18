// Centralized error handling middleware
// Errors are handled HERE
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      // Avoid leaking stack in production (security reasons)
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};
