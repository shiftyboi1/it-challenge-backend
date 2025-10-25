// Centralizovany error handling middleware
// tuten chlap handluje errory
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      // Odstrani stack trace ked runuje v production (aby frontend nevidel do pana serverika)
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};
