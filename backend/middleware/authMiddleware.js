import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { ApiError } from '../utils/apiError.js';

/**
 * @desc    Protect routes - Require valid JWT
 * @access  Private
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    throw new ApiError(401, 'Authentication token missing', 'TOKEN_MISSING');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'User not found', 'USER_NOT_FOUND');
    }

    if (user.isSuspended) {
      throw new ApiError(403, 'Account is suspended', 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    next();

  } catch (error) {

    // Let JWT-specific errors bubble to global handler
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw error;
    }

    throw new ApiError(401, 'Authentication failed', 'AUTH_FAILED');
  }
});

/**
 * @desc    Admin role check
 * @access  Private/Admin
 */
export const admin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED');
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Admin privileges required', 'ADMIN_ONLY');
  }

  next();
};
