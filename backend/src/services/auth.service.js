const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tiffin_super_secret_jwt_key_2026_safe', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);
  user.password = undefined;

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

module.exports = {
  loginUser,
  getUserProfile,
};
