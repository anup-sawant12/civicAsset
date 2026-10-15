const prisma = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const VALID_STATUSES = [
  'CREATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'VERIFIED',
  'CLOSED',
  'CANCELLED',
];

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  departmentId: true,
};

class WorkOrderServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Generate unique work order code (e.g. WO-10001, WO-10002)
 */
async function generateWorkOrderCode() {
  const count = await prisma.workOrder.count();
  let nextNum = 10001 + count;
  let code = `WO-${nextNum}`;
  let exists = await prisma.workOrder.findUnique({ where: { workOrderCode: code } });
  while (exists) {
    nextNum += 1;
    code = `WO-${nextNum}`;
    exists = await prisma.workOrder.findUnique({ where: { workOrderCode: code } });
  }
  return code;
}

/**
 * Helper to check and mark SLA breach if deadline has passed and work order is incomplete
 */
function computeSlaBreached(workOrder) {
  if (!workOrder.slaDeadline) return false;
  const isTerminal = ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(workOrder.status);
  if (isTerminal) return Boolean(workOrder.slaBreached);
  return new Date() > new Date(workOrder.slaDeadline);
}

/**
 * List work orders with pagination, search, filters, and role-based access control
 */
async function getWorkOrders({
  user,
  page = 1,
  limit = 10,
  search,
  status,
  departmentId,
  assignedWorkerId,
  assignedOfficerId,
  complaintId,
  assetId,
  slaBreached,
}) {
  if (user.role === 'CITIZEN') {
    throw new WorkOrderServiceError('Access denied: Citizens cannot access work order management', 403);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  const where = {};

  // Role-based scoping:
  // FIELD_WORKER: MUST only view work orders assigned to themselves
  if (user.role === 'FIELD_WORKER') {
    where.assignedWorkerId = user.id;
  } else if (user.role === 'OFFICER') {
    // Officers can view orders for their department or specified department
    if (departmentId) {
      where.departmentId = departmentId;
    } else if (user.departmentId) {
      where.departmentId = user.departmentId;
    }
  } else if (user.role === 'ADMIN') {
    // Admin can filter by any department
    if (departmentId) {
      where.departmentId = departmentId;
    }
  }

  // Explicit worker filter (for officers/admin)
  if (assignedWorkerId && user.role !== 'FIELD_WORKER') {
    where.assignedWorkerId = assignedWorkerId;
  }

  // Explicit officer filter
  if (assignedOfficerId) {
    where.assignedOfficerId = assignedOfficerId;
  }

  // Status filter
  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  // Complaint filter
  if (complaintId) {
    where.complaintId = complaintId;
  }

  // Asset filter
  if (assetId) {
    where.assetId = assetId;
  }

  // SLA breached filter
  if (slaBreached !== undefined && slaBreached !== null && slaBreached !== '') {
    const isBreached = slaBreached === 'true' || slaBreached === true;
    where.slaBreached = isBreached;
  }

  // Search filter
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    where.OR = [
      { workOrderCode: { contains: q, mode: 'insensitive' } },
      { complaint: { complaintCode: { contains: q, mode: 'insensitive' } } },
      { complaint: { description: { contains: q, mode: 'insensitive' } } },
      { asset: { assetCode: { contains: q, mode: 'insensitive' } } },
      { asset: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, rawWorkOrders] = await Promise.all([
    prisma.workOrder.count({ where }),
    prisma.workOrder.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        complaint: {
          select: {
            id: true,
            complaintCode: true,
            category: true,
            description: true,
            priority: true,
            severity: true,
            status: true,
            address: true,
            latitude: true,
            longitude: true,
            imageUrl: true,
            submittedAt: true,
            citizen: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        asset: {
          select: {
            id: true,
            assetCode: true,
            name: true,
            assetType: true,
            status: true,
            condition: true,
            latitude: true,
            longitude: true,
            address: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedOfficer: {
          select: USER_SELECT,
        },
        assignedWorker: {
          select: USER_SELECT,
        },
      },
    }),
  ]);

  // Dynamically evaluate SLA breaches and ensure before/after imageUrl compatibility
  const workOrders = rawWorkOrders.map((wo) => {
    const computedBreach = computeSlaBreached(wo);
    return {
      ...wo,
      slaBreached: computedBreach,
      beforeImageUrl: wo.beforeImage || wo.complaint?.imageUrl || null,
      afterImageUrl: wo.afterImage || null,
    };
  });

  return {
    workOrders,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

/**
 * Get work order statistics for dashboards
 */
async function getWorkOrderStats(user) {
  if (user.role === 'CITIZEN') {
    throw new WorkOrderServiceError('Access denied', 403);
  }

  const where = {};
  if (user.role === 'FIELD_WORKER') {
    where.assignedWorkerId = user.id;
  } else if (user.role === 'OFFICER' && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const [total, created, assigned, inProgress, completed, verified, closed, cancelled, breached] =
    await Promise.all([
      prisma.workOrder.count({ where }),
      prisma.workOrder.count({ where: { ...where, status: 'CREATED' } }),
      prisma.workOrder.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.workOrder.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.workOrder.count({ where: { ...where, status: 'VERIFIED' } }),
      prisma.workOrder.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.workOrder.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.workOrder.count({
        where: {
          ...where,
          OR: [
            { slaBreached: true },
            {
              slaDeadline: { lt: new Date() },
              status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] },
            },
          ],
        },
      }),
    ]);

  return {
    total,
    created,
    assigned,
    inProgress,
    completed,
    verified,
    closed,
    cancelled,
    slaBreached: breached,
  };
}

/**
 * Get single work order details by ID with role authorization
 */
async function getWorkOrderById(id, user) {
  if (user.role === 'CITIZEN') {
    throw new WorkOrderServiceError('Access denied: Citizens cannot access work orders', 403);
  }

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      complaint: {
        select: {
          id: true,
          complaintCode: true,
          category: true,
          description: true,
          priority: true,
          severity: true,
          status: true,
          latitude: true,
          longitude: true,
          address: true,
          imageUrl: true,
          submittedAt: true,
          citizen: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      asset: {
        select: {
          id: true,
          assetCode: true,
          name: true,
          assetType: true,
          status: true,
          condition: true,
          latitude: true,
          longitude: true,
          address: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      assignedOfficer: {
        select: USER_SELECT,
      },
      assignedWorker: {
        select: USER_SELECT,
      },
    },
  });

  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  // Access validation:
  if (user.role === 'FIELD_WORKER' && workOrder.assignedWorkerId !== user.id) {
    throw new WorkOrderServiceError('Access denied: You are not assigned to this work order', 403);
  }

  // Provide compatibility aliases
  const computedBreach = computeSlaBreached(workOrder);
  return {
    ...workOrder,
    slaBreached: computedBreach,
    beforeImageUrl: workOrder.beforeImage || workOrder.complaint?.imageUrl || null,
    afterImageUrl: workOrder.afterImage || null,
  };
}

/**
 * Create a new work order from an existing complaint
 */
async function createWorkOrder(data, user, reqIp) {
  if (!['ADMIN', 'OFFICER'].includes(user.role)) {
    throw new WorkOrderServiceError('Access denied: Only Officers and Admins can generate work orders', 403);
  }

  const {
    complaintId,
    assetId,
    departmentId,
    assignedWorkerId,
    assignedOfficerId,
    slaDeadline,
    slaHours,
    beforeImage,
    beforeImageUrl,
  } = data;

  if (!complaintId) {
    throw new WorkOrderServiceError('Complaint ID is required to create a work order', 400);
  }

  // 1. Validate Complaint
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { asset: true, department: true },
  });

  if (!complaint) {
    throw new WorkOrderServiceError('Complaint record not found', 404);
  }

  // Check uniqueness constraint
  const existingOrder = await prisma.workOrder.findUnique({
    where: { complaintId },
  });

  if (existingOrder) {
    throw new WorkOrderServiceError('A work order already exists for this complaint', 409);
  }

  // 2. Resolve Department
  let targetDepartmentId = departmentId || complaint.departmentId;
  if (!targetDepartmentId) {
    throw new WorkOrderServiceError('Department ID is required', 400);
  }

  const department = await prisma.department.findUnique({
    where: { id: targetDepartmentId },
  });

  if (!department || !department.isActive) {
    throw new WorkOrderServiceError('Target department does not exist or is inactive', 400);
  }

  // 3. Resolve Asset
  let targetAssetId = assetId || complaint.assetId || null;
  if (targetAssetId) {
    const asset = await prisma.asset.findUnique({
      where: { id: targetAssetId },
    });
    if (!asset) {
      throw new WorkOrderServiceError('Linked asset does not exist', 400);
    }
  }

  // 4. Resolve Field Worker if provided
  let workerRecord = null;
  if (assignedWorkerId) {
    workerRecord = await prisma.user.findUnique({
      where: { id: assignedWorkerId },
    });

    if (!workerRecord) {
      throw new WorkOrderServiceError('Assigned field worker not found', 400);
    }

    if (workerRecord.role !== 'FIELD_WORKER') {
      throw new WorkOrderServiceError('Assigned user must possess the FIELD_WORKER role', 400);
    }

    if (workerRecord.status !== 'ACTIVE') {
      throw new WorkOrderServiceError('Cannot assign an inactive or suspended field worker', 400);
    }
  }

  // 5. Resolve Officer
  let targetOfficerId = assignedOfficerId || (user.role === 'OFFICER' ? user.id : null);
  if (targetOfficerId) {
    const officerRecord = await prisma.user.findUnique({
      where: { id: targetOfficerId },
    });
    if (!officerRecord || !['OFFICER', 'ADMIN'].includes(officerRecord.role)) {
      throw new WorkOrderServiceError('Assigned officer must be a valid Officer or Admin', 400);
    }
  }

  // 6. SLA and Initial Status
  const initialStatus = workerRecord ? 'ASSIGNED' : 'CREATED';
  const assignedAt = workerRecord ? new Date() : null;

  let parsedDeadline = null;
  if (slaDeadline) {
    parsedDeadline = new Date(slaDeadline);
    if (isNaN(parsedDeadline.getTime())) {
      throw new WorkOrderServiceError('Invalid SLA deadline date format', 400);
    }
  } else if (slaHours && parseInt(slaHours, 10) > 0) {
    parsedDeadline = new Date(Date.now() + parseInt(slaHours, 10) * 3600 * 1000);
  }

  // Resolve before image
  const resolvedBeforeImage = beforeImage || beforeImageUrl || complaint.imageUrl || null;

  // Generate unique code
  const workOrderCode = await generateWorkOrderCode();

  // Create Work Order
  const createdOrder = await prisma.workOrder.create({
    data: {
      workOrderCode,
      complaintId,
      assetId: targetAssetId,
      departmentId: targetDepartmentId,
      assignedOfficerId: targetOfficerId,
      assignedWorkerId: workerRecord ? workerRecord.id : null,
      status: initialStatus,
      slaHours: slaHours ? parseInt(slaHours, 10) : null,
      slaDeadline: parsedDeadline,
      slaBreached: false,
      beforeImage: resolvedBeforeImage,
      assignedAt,
    },
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  // Automatically sync Complaint status to ASSIGNED if previously SUBMITTED or UNDER_REVIEW
  if (['SUBMITTED', 'UNDER_REVIEW'].includes(complaint.status)) {
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'ASSIGNED' },
    });
  }

  // Audit Log
  await logAudit({
    userId: user.id,
    action: 'CREATE',
    entityType: 'WorkOrder',
    entityId: createdOrder.id,
    description: `Work Order ${createdOrder.workOrderCode} generated for Complaint ${complaint.complaintCode}`,
    newValue: createdOrder,
    ipAddress: reqIp,
  });

  return {
    ...createdOrder,
    beforeImageUrl: createdOrder.beforeImage,
    afterImageUrl: createdOrder.afterImage,
  };
}

/**
 * Assign or reassign a field worker to a work order
 */
async function assignWorker(id, { assignedWorkerId }, user, reqIp) {
  if (!['ADMIN', 'OFFICER'].includes(user.role)) {
    throw new WorkOrderServiceError('Access denied: Only Officers and Admins can assign field workers', 403);
  }

  if (!assignedWorkerId) {
    throw new WorkOrderServiceError('Assigned worker ID is required', 400);
  }

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
  });

  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  if (['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(workOrder.status)) {
    throw new WorkOrderServiceError(`Cannot reassign worker for work order with status ${workOrder.status}`, 400);
  }

  const worker = await prisma.user.findUnique({
    where: { id: assignedWorkerId },
  });

  if (!worker) {
    throw new WorkOrderServiceError('Worker user not found', 404);
  }

  if (worker.role !== 'FIELD_WORKER') {
    throw new WorkOrderServiceError('Assigned user must possess the FIELD_WORKER role', 400);
  }

  if (worker.status !== 'ACTIVE') {
    throw new WorkOrderServiceError('Worker account is not active', 400);
  }

  const newStatus = workOrder.status === 'CREATED' ? 'ASSIGNED' : workOrder.status;

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: {
      assignedWorkerId: worker.id,
      assignedAt: new Date(),
      status: newStatus,
    },
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  await logAudit({
    userId: user.id,
    action: 'ASSIGN',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Worker ${worker.firstName} ${worker.lastName} assigned to ${workOrder.workOrderCode}`,
    oldValue: { assignedWorkerId: workOrder.assignedWorkerId, status: workOrder.status },
    newValue: { assignedWorkerId: worker.id, status: newStatus },
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

/**
 * Assign or reassign an officer to a work order
 */
async function assignOfficer(id, { assignedOfficerId }, user, reqIp) {
  if (!['ADMIN', 'OFFICER'].includes(user.role)) {
    throw new WorkOrderServiceError('Access denied', 403);
  }

  if (!assignedOfficerId) {
    throw new WorkOrderServiceError('Officer ID is required', 400);
  }

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  const officer = await prisma.user.findUnique({
    where: { id: assignedOfficerId },
  });

  if (!officer || !['OFFICER', 'ADMIN'].includes(officer.role)) {
    throw new WorkOrderServiceError('Assigned user must be an active Officer or Admin', 400);
  }

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: { assignedOfficerId: officer.id },
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  await logAudit({
    userId: user.id,
    action: 'ASSIGN',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Officer ${officer.firstName} ${officer.lastName} assigned to ${workOrder.workOrderCode}`,
    oldValue: { assignedOfficerId: workOrder.assignedOfficerId },
    newValue: { assignedOfficerId: officer.id },
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

/**
 * Start work on an assigned work order
 */
async function startWork(id, user, reqIp) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  // Authorization: Only the assigned field worker or authorized officer/admin can start work
  if (user.role === 'FIELD_WORKER' && workOrder.assignedWorkerId !== user.id) {
    throw new WorkOrderServiceError('You can only start work orders assigned to you', 403);
  }

  if (user.role === 'CITIZEN') {
    throw new WorkOrderServiceError('Access denied', 403);
  }

  if (workOrder.status === 'IN_PROGRESS') {
    throw new WorkOrderServiceError('Work order is already in progress', 400);
  }

  if (['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(workOrder.status)) {
    throw new WorkOrderServiceError(`Cannot start a work order with status ${workOrder.status}`, 400);
  }

  const startedAt = workOrder.startedAt || new Date();

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      startedAt,
    },
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  // Sync linked complaint status to IN_PROGRESS
  if (workOrder.complaintId) {
    await prisma.complaint.update({
      where: { id: workOrder.complaintId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  await logAudit({
    userId: user.id,
    action: 'STATUS_CHANGE',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Work started on ${workOrder.workOrderCode}`,
    oldValue: { status: workOrder.status },
    newValue: { status: 'IN_PROGRESS', startedAt },
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

/**
 * Complete work on an in-progress work order
 */
async function completeWork(id, data = {}, user, reqIp) {
  const { repairNotes, afterImage, afterImageUrl } = data;

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  // Authorization: Assigned field worker or authorized officer/admin
  if (user.role === 'FIELD_WORKER' && workOrder.assignedWorkerId !== user.id) {
    throw new WorkOrderServiceError('You can only complete work orders assigned to you', 403);
  }

  if (user.role === 'CITIZEN') {
    throw new WorkOrderServiceError('Access denied', 403);
  }

  if (workOrder.status !== 'IN_PROGRESS') {
    throw new WorkOrderServiceError(
      `Cannot mark work completed from status ${workOrder.status}. Work must be IN_PROGRESS first.`,
      400
    );
  }

  if (!repairNotes || typeof repairNotes !== 'string' || !repairNotes.trim()) {
    throw new WorkOrderServiceError('Repair notes describing the completed work are required', 400);
  }

  const completedAt = new Date();
  const resolvedAfterImage = afterImage || afterImageUrl || workOrder.afterImage || null;

  // Check if SLA was breached before completion
  let finalSlaBreached = Boolean(workOrder.slaBreached);
  if (workOrder.slaDeadline && completedAt > new Date(workOrder.slaDeadline)) {
    finalSlaBreached = true;
  }

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt,
      repairNotes: repairNotes.trim(),
      afterImage: resolvedAfterImage,
      slaBreached: finalSlaBreached,
    },
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  // Sync complaint status to RESOLVED
  if (workOrder.complaintId) {
    await prisma.complaint.update({
      where: { id: workOrder.complaintId },
      data: {
        status: 'RESOLVED',
        resolvedAt: completedAt,
      },
    });
  }

  await logAudit({
    userId: user.id,
    action: 'STATUS_CHANGE',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Work Order ${workOrder.workOrderCode} marked as COMPLETED`,
    oldValue: { status: workOrder.status },
    newValue: { status: 'COMPLETED', completedAt, repairNotes: repairNotes.trim() },
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

/**
 * Controlled status update with strict transition validation
 */
async function updateWorkOrderStatus(id, newStatus, extraData = {}, user, reqIp) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new WorkOrderServiceError(`Invalid status: ${newStatus}. Allowed: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  const currentStatus = workOrder.status;

  // Role validation
  if (user.role === 'FIELD_WORKER') {
    if (workOrder.assignedWorkerId !== user.id) {
      throw new WorkOrderServiceError('Access denied: You are not assigned to this work order', 403);
    }
    // Worker can only transition ASSIGNED -> IN_PROGRESS or IN_PROGRESS -> COMPLETED
    if (currentStatus === 'ASSIGNED' && newStatus === 'IN_PROGRESS') {
      return startWork(id, user, reqIp);
    }
    if (currentStatus === 'IN_PROGRESS' && newStatus === 'COMPLETED') {
      return completeWork(id, extraData, user, reqIp);
    }
    throw new WorkOrderServiceError(
      `Field workers cannot change status from ${currentStatus} to ${newStatus}`,
      403
    );
  }

  if (user.role === 'CITIZEN') {
    throw new WorkOrderServiceError('Access denied', 403);
  }

  // Officer / Admin lifecycle transitions
  const allowedTransitions = {
    CREATED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: ['VERIFIED', 'IN_PROGRESS', 'CANCELLED'],
    VERIFIED: ['CLOSED', 'CANCELLED'],
    CLOSED: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new WorkOrderServiceError(
      `Invalid state transition from ${currentStatus} to ${newStatus}`,
      400
    );
  }

  const updateData = { status: newStatus };

  if (newStatus === 'IN_PROGRESS' && !workOrder.startedAt) {
    updateData.startedAt = new Date();
  } else if (newStatus === 'COMPLETED' && !workOrder.completedAt) {
    updateData.completedAt = new Date();
  } else if (newStatus === 'VERIFIED') {
    updateData.verifiedAt = new Date();
  } else if (newStatus === 'CLOSED') {
    updateData.closedAt = new Date();
  } else if (newStatus === 'CANCELLED') {
    if (extraData.rejectionReason || extraData.reason) {
      updateData.rejectionReason = extraData.rejectionReason || extraData.reason;
    }
  }

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: updateData,
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  // Sync complaint status where appropriate
  if (workOrder.complaintId) {
    if (newStatus === 'VERIFIED') {
      await prisma.complaint.update({
        where: { id: workOrder.complaintId },
        data: { status: 'VERIFIED' },
      });
    } else if (newStatus === 'CLOSED') {
      await prisma.complaint.update({
        where: { id: workOrder.complaintId },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
    }
  }

  await logAudit({
    userId: user.id,
    action: 'STATUS_CHANGE',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Status changed from ${currentStatus} to ${newStatus}`,
    oldValue: { status: currentStatus },
    newValue: { status: newStatus },
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

/**
 * Controlled cancellation of a work order
 */
async function cancelWorkOrder(id, { reason }, user, reqIp) {
  if (!['ADMIN', 'OFFICER'].includes(user.role)) {
    throw new WorkOrderServiceError('Access denied: Only Officers and Admins can cancel work orders', 403);
  }

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  if (['CLOSED', 'CANCELLED'].includes(workOrder.status)) {
    throw new WorkOrderServiceError(`Cannot cancel a work order with status ${workOrder.status}`, 400);
  }

  const rejectionReason = reason && typeof reason === 'string' && reason.trim()
    ? reason.trim()
    : 'Cancelled by municipal officer';

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      rejectionReason,
    },
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  await logAudit({
    userId: user.id,
    action: 'STATUS_CHANGE',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Work order ${workOrder.workOrderCode} cancelled. Reason: ${rejectionReason}`,
    oldValue: { status: workOrder.status },
    newValue: { status: 'CANCELLED', rejectionReason },
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

/**
 * General update for operational details (Admin / Officer)
 */
async function updateWorkOrder(id, data = {}, user, reqIp) {
  if (!['ADMIN', 'OFFICER'].includes(user.role)) {
    throw new WorkOrderServiceError('Access denied', 403);
  }

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) {
    throw new WorkOrderServiceError('Work order not found', 404);
  }

  const updateData = {};

  if (data.slaDeadline !== undefined) {
    if (data.slaDeadline === null) {
      updateData.slaDeadline = null;
    } else {
      const deadline = new Date(data.slaDeadline);
      if (isNaN(deadline.getTime())) {
        throw new WorkOrderServiceError('Invalid SLA deadline date format', 400);
      }
      updateData.slaDeadline = deadline;
    }
  }

  if (data.slaHours !== undefined) {
    updateData.slaHours = data.slaHours ? parseInt(data.slaHours, 10) : null;
  }

  if (data.repairNotes !== undefined) {
    updateData.repairNotes = data.repairNotes;
  }

  if (data.rejectionReason !== undefined) {
    updateData.rejectionReason = data.rejectionReason;
  }

  if (data.beforeImage !== undefined || data.beforeImageUrl !== undefined) {
    updateData.beforeImage = data.beforeImage || data.beforeImageUrl;
  }

  if (data.afterImage !== undefined || data.afterImageUrl !== undefined) {
    updateData.afterImage = data.afterImage || data.afterImageUrl;
  }

  if (data.departmentId !== undefined && data.departmentId !== workOrder.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!dept || !dept.isActive) {
      throw new WorkOrderServiceError('Invalid department', 400);
    }
    updateData.departmentId = data.departmentId;
  }

  if (data.assetId !== undefined && data.assetId !== workOrder.assetId) {
    if (data.assetId) {
      const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) {
        throw new WorkOrderServiceError('Asset not found', 400);
      }
      updateData.assetId = data.assetId;
    } else {
      updateData.assetId = null;
    }
  }

  const updatedOrder = await prisma.workOrder.update({
    where: { id },
    data: updateData,
    include: {
      complaint: true,
      asset: true,
      department: true,
      assignedOfficer: { select: USER_SELECT },
      assignedWorker: { select: USER_SELECT },
    },
  });

  await logAudit({
    userId: user.id,
    action: 'UPDATE',
    entityType: 'WorkOrder',
    entityId: id,
    description: `Work order ${workOrder.workOrderCode} updated`,
    oldValue: workOrder,
    newValue: updatedOrder,
    ipAddress: reqIp,
  });

  return {
    ...updatedOrder,
    beforeImageUrl: updatedOrder.beforeImage,
    afterImageUrl: updatedOrder.afterImage,
  };
}

module.exports = {
  getWorkOrders,
  getWorkOrderStats,
  getWorkOrderById,
  createWorkOrder,
  assignWorker,
  assignOfficer,
  startWork,
  completeWork,
  updateWorkOrderStatus,
  cancelWorkOrder,
  updateWorkOrder,
  WorkOrderServiceError,
};
