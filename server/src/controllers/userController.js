const userService = require('../services/userService');

/**
 * GET /api/admin/users
 */
async function getUsers(req, res) {
  try {
    const { role, status, departmentId, search } = req.query;
    const users = await userService.getUsers({ role, status, departmentId, search });
    return res.status(200).json({
      success: true,
      data: users,
      users,
      count: users.length,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
}

/**
 * GET /api/admin/users/:id
 */
async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      data: user,
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch user',
    });
  }
}

/**
 * POST /api/admin/users
 */
async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
}

/**
 * PUT /api/admin/users/:id
 */
async function updateUser(req, res) {
  try {
    const currentUserId = req.user?.id;
    const user = await userService.updateUser(req.params.id, req.body, currentUserId);
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
}

/**
 * PUT /api/admin/users/:id/status
 */
async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;
    const currentUserId = req.user?.id;
    const user = await userService.updateUserStatus(req.params.id, status, currentUserId);
    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user status',
    });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
};
