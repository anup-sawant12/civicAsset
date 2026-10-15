const departmentService = require('../services/departmentService');

/**
 * GET /api/admin/departments and /api/departments
 */
async function getDepartments(req, res) {
  try {
    const { search, isActive } = req.query;
    const departments = await departmentService.getDepartments({ search, isActive });
    return res.status(200).json({
      success: true,
      data: departments,
      departments,
      count: departments.length,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch departments',
    });
  }
}

/**
 * GET /api/admin/departments/:id and /api/departments/:id
 */
async function getDepartmentById(req, res) {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    return res.status(200).json({
      success: true,
      data: department,
      department,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch department',
    });
  }
}

/**
 * POST /api/admin/departments
 */
async function createDepartment(req, res) {
  try {
    const department = await departmentService.createDepartment(req.body);
    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
      department,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create department',
    });
  }
}

/**
 * PUT /api/admin/departments/:id
 */
async function updateDepartment(req, res) {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
      department,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update department',
    });
  }
}

/**
 * PUT /api/admin/departments/:id/status
 */
async function updateDepartmentStatus(req, res) {
  try {
    const { isActive } = req.body;
    const department = await departmentService.updateDepartmentStatus(req.params.id, isActive);
    return res.status(200).json({
      success: true,
      message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: department,
      department,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update department status',
    });
  }
}

/**
 * DELETE /api/admin/departments/:id
 */
async function deleteDepartment(req, res) {
  try {
    const result = await departmentService.deleteDepartment(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete department',
    });
  }
}

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
};
