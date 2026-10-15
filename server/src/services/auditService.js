const prisma = require('../config/db');

/**
 * Fetch paginated audit logs with search, filtering, and user relation
 */
async function getAuditLogs({
  page = 1,
  limit = 20,
  search,
  action,
  entityType,
  userId,
  fromDate,
  toDate,
} = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * pageSize;

  const where = {};

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entityType = { equals: entityType, mode: 'insensitive' };
  }

  if (userId) {
    where.userId = userId;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    where.OR = [
      { description: { contains: q, mode: 'insensitive' } },
      { entityId: { contains: q, mode: 'insensitive' } },
      { ipAddress: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) {
      where.createdAt.gte = new Date(fromDate);
    }
    if (toDate) {
      where.createdAt.lte = new Date(toDate);
    }
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize) || 1,
    },
  };
}

/**
 * Summary stats for audit logs
 */
async function getAuditStats() {
  const [totalCount, recent24hCount] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    total: totalCount,
    last24Hours: recent24hCount,
  };
}

/**
 * Fetch single audit log by ID
 */
async function getAuditLogById(id) {
  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return log;
}

module.exports = {
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
};
