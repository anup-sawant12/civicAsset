const workOrderService = require('../services/workOrderService');

/**
 * GET /api/work-orders
 */
async function getWorkOrders(req, res) {
  try {
    const {
      page,
      limit,
      search,
      status,
      departmentId,
      assignedWorkerId,
      assignedOfficerId,
      complaintId,
      assetId,
      slaBreached,
    } = req.query;

    const result = await workOrderService.getWorkOrders({
      user: req.user,
      page,
      limit,
      search,
      status,
      departmentId,
      assignedWorkerId,
      assignedOfficerId,
      complaintId,
      assetId,
      slaBreached,
    });

    return res.status(200).json({
      success: true,
      data: {
        workOrders: result.workOrders,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch work orders',
    });
  }
}

/**
 * GET /api/work-orders/stats
 */
async function getWorkOrderStats(req, res) {
  try {
    const stats = await workOrderService.getWorkOrderStats(req.user);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch work order statistics',
    });
  }
}

/**
 * GET /api/work-orders/:id
 */
async function getWorkOrderById(req, res) {
  try {
    const workOrder = await workOrderService.getWorkOrderById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch work order',
    });
  }
}

/**
 * POST /api/work-orders
 */
async function createWorkOrder(req, res) {
  try {
    const workOrder = await workOrderService.createWorkOrder(req.body, req.user, req.ip);
    return res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create work order',
    });
  }
}

/**
 * PUT /api/work-orders/:id
 */
async function updateWorkOrder(req, res) {
  try {
    const workOrder = await workOrderService.updateWorkOrder(req.params.id, req.body, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Work order updated successfully',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update work order',
    });
  }
}

/**
 * PATCH /api/work-orders/:id/status
 */
async function updateWorkOrderStatus(req, res) {
  try {
    const { status, rejectionReason, reason } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const workOrder = await workOrderService.updateWorkOrderStatus(
      req.params.id,
      status,
      { rejectionReason: rejectionReason || reason },
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: `Work order status updated to ${status}`,
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update work order status',
    });
  }
}

/**
 * PATCH /api/work-orders/:id/assign
 */
async function assignWorker(req, res) {
  try {
    const { assignedWorkerId } = req.body;
    if (!assignedWorkerId) {
      return res.status(400).json({ success: false, message: 'assignedWorkerId is required' });
    }
    const workOrder = await workOrderService.assignWorker(
      req.params.id,
      { assignedWorkerId },
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: 'Field worker assigned successfully',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to assign field worker',
    });
  }
}

/**
 * PATCH /api/work-orders/:id/assign-officer
 */
async function assignOfficer(req, res) {
  try {
    const { assignedOfficerId } = req.body;
    if (!assignedOfficerId) {
      return res.status(400).json({ success: false, message: 'assignedOfficerId is required' });
    }
    const workOrder = await workOrderService.assignOfficer(
      req.params.id,
      { assignedOfficerId },
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: 'Officer assigned successfully',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to assign officer',
    });
  }
}

/**
 * PATCH /api/work-orders/:id/start
 */
async function startWork(req, res) {
  try {
    const workOrder = await workOrderService.startWork(req.params.id, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Work order marked as IN_PROGRESS',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to start work on work order',
    });
  }
}

/**
 * PATCH /api/work-orders/:id/complete
 */
async function completeWork(req, res) {
  try {
    const { repairNotes, afterImage, afterImageUrl } = req.body;
    const workOrder = await workOrderService.completeWork(
      req.params.id,
      { repairNotes, afterImage, afterImageUrl },
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: 'Work order completed successfully',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to complete work order',
    });
  }
}

/**
 * DELETE /api/work-orders/:id (Controlled cancellation)
 */
async function deleteWorkOrder(req, res) {
  try {
    const { reason } = req.body || {};
    const workOrder = await workOrderService.cancelWorkOrder(
      req.params.id,
      { reason },
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: 'Work order cancelled successfully',
      data: workOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to cancel work order',
    });
  }
}

module.exports = {
  getWorkOrders,
  getWorkOrderStats,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  assignWorker,
  assignOfficer,
  startWork,
  completeWork,
  deleteWorkOrder,
};
