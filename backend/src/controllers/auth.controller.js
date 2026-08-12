const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    return sendSuccess(res, 200, 'User profile fetched', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
