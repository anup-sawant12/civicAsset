const auditService = require('../services/auditService');

/**
 * GET /api/admin/audit-logs
 */
async function getAuditLogs(req, res) {
  try {
    const { page, limit, search, action, entityType, userId, fromDate, toDate } = req.query;
    const result = await auditService.getAuditLogs({
      page,
      limit,
      search,
      action,
      entityType,
      userId,
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      data: result.logs,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch audit logs',
    });
  }
}

/**
 * GET /api/admin/audit-logs/stats
 */
async function getAuditStats(req, res) {
  try {
    const stats = await auditService.getAuditStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch audit stats',
    });
  }
}

/**
 * GET /api/admin/audit-logs/:id
 */
async function getAuditLogById(req, res) {
  try {
    const log = await auditService.getAuditLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log entry not found' });
    }
    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch audit log entry',
    });
  }
}

module.exports = {
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
};
