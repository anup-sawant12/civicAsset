const prisma = require('../config/db');

/**
 * Log an audit trail entry into the database.
 * Silently handles failures to ensure main transactional logic is not broken.
 */
async function logAudit({
  userId,
  action,
  entityType = 'WorkOrder',
  entityId,
  description,
  oldValue,
  newValue,
  ipAddress,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        description: description || null,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.warn(`[AuditLog] Warning: Failed to record audit log (${action} ${entityType}):`, err.message);
  }
}

module.exports = {
  logAudit,
};
