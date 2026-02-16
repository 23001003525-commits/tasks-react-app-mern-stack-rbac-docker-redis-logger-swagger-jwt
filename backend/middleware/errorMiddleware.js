import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';
import logger from '../config/logger.js';

/**
 * 404 Not Found Middleware
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
};

/**
 * Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let details = err.details || null;

  // Mongoose CastError (Invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid resource ID';
    code = 'INVALID_OBJECT_ID';
  }

  // Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }


  // Log the error
  if (statusCode >= 500) {
    logger.error(err);
  } else {
    logger.warn({
      message,
      code,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    });
  }
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};


