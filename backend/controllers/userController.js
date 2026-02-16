import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { ApiError } from '../utils/apiError.js';
import cacheEvents from '../events/cacheEvents.js';

/**
 * @desc    Auth user & get token
 * @route   POST /api/users/auth
 * @access  Public
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required', 'MISSING_CREDENTIALS');
  }

  const user = await User.findOne({ email }).select('+password');

  // Avoid revealing whether email exists
  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (user.isSuspended) {
    throw new ApiError(403, 'Account is suspended', 'ACCOUNT_SUSPENDED');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  generateToken(res, user._id);

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    },
  });
});


/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'All fields are required', 'MISSING_FIELDS');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(409, 'User already exists', 'USER_ALREADY_EXISTS');
  }

  const user = await User.create({ name, email, password });

  generateToken(res, user._id);
  cacheEvents.emit('USER_UPDATED');
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    },
  });
});


/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/users/logout
 * @access  Public
 */
const logoutUser = (req, res) => {//todo if we put online users stat in dashboard, then we need to invalidate cache here
  res.cookie('jwt', '', {//must match the options we used while generating cookie so that it clears properly
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'none',//this is none as we are using vercel + render for hosting, cross site cookies needed.
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
  });
};


/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    },
  });
});


/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;

  if (req.body.email && req.body.email !== user.email) {
     const emailExists = await User.findOne({ email: req.body.email });
     if (emailExists) {
        throw new ApiError(409, 'Email already in use', 'EMAIL_IN_USE');//todo add 409 in swagger docs' error responses
     }
  }


  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  cacheEvents.emit('USER_UPDATED');

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role || 'user',
    },
  });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
