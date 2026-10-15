const authService = require('../services/authService');

/**
 * Handle user registration (public citizen registration)
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
}

/**
 * Handle user login
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
}

/**
 * Handle getting current user profile
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    // req.user is set by authMiddleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await authService.getCurrentUser(req.user.id);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve user profile'
    });
  }
}

module.exports = {
  register,
  login,
  getMe
};
