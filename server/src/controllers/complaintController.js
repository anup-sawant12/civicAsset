const complaintService = require('../services/complaintService');

/**
 * GET /api/complaints
 */
async function getComplaints(req, res) {
  try {
    const {
      page,
      limit,
      search,
      status,
      category,
      severity,
      priority,
      departmentId,
      assetId,
    } = req.query;

    const result = await complaintService.getComplaints({
      user: req.user,
      page,
      limit,
      search,
      status,
      category,
      severity,
      priority,
      departmentId,
      assetId,
    });

    return res.status(200).json({
      success: true,
      data: {
        complaints: result.complaints,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch complaints',
    });
  }
}

/**
 * GET /api/complaints/stats
 */
async function getComplaintStats(req, res) {
  try {
    const stats = await complaintService.getComplaintStats(req.user);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch complaint statistics',
    });
  }
}

/**
 * GET /api/complaints/:id
 */
async function getComplaintById(req, res) {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch complaint',
    });
  }
}

/**
 * POST /api/complaints
 */
async function createComplaint(req, res) {
  try {
    const complaint = await complaintService.createComplaint(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to submit complaint',
    });
  }
}

/**
 * PUT /api/complaints/:id
 */
async function updateComplaint(req, res) {
  try {
    const complaint = await complaintService.updateComplaint(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update complaint',
    });
  }
}

/**
 * PATCH /api/complaints/:id/status
 */
async function updateComplaintStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const complaint = await complaintService.updateComplaintStatus(req.params.id, status, req.user);
    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update complaint status',
    });
  }
}

/**
 * PATCH /api/complaints/:id/priority
 */
async function updateComplaintPriority(req, res) {
  try {
    const { priority } = req.body;
    if (!priority) {
      return res.status(400).json({ success: false, message: 'Priority is required' });
    }
    const complaint = await complaintService.updateComplaintPriority(req.params.id, priority, req.user);
    return res.status(200).json({
      success: true,
      message: 'Complaint priority updated successfully',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update complaint priority',
    });
  }
}

/**
 * PATCH /api/complaints/:id/severity
 */
async function updateComplaintSeverity(req, res) {
  try {
    const { severity } = req.body;
    if (!severity) {
      return res.status(400).json({ success: false, message: 'Severity is required' });
    }
    const complaint = await complaintService.updateComplaintSeverity(req.params.id, severity, req.user);
    return res.status(200).json({
      success: true,
      message: 'Complaint severity updated successfully',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update complaint severity',
    });
  }
}

/**
 * PATCH /api/complaints/:id/department
 */
async function updateComplaintDepartment(req, res) {
  try {
    const { departmentId } = req.body;
    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'Department ID is required' });
    }
    const complaint = await complaintService.updateComplaintDepartment(req.params.id, departmentId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Complaint routed to department successfully',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to route complaint',
    });
  }
}

/**
 * DELETE /api/complaints/:id (Controlled cancellation)
 */
async function deleteComplaint(req, res) {
  try {
    const complaint = await complaintService.cancelComplaint(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Complaint successfully cancelled',
      data: complaint,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to cancel complaint',
    });
  }
}

module.exports = {
  getComplaints,
  getComplaintStats,
  getComplaintById,
  createComplaint,
  updateComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  updateComplaintSeverity,
  updateComplaintDepartment,
  deleteComplaint,
};
