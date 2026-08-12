const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid ID format: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'. Please use another value.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
