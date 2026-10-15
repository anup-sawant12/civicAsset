const prisma = require('../config/db');

const VALID_CATEGORIES = [
  'STREETLIGHT',
  'ROAD',
  'WATER',
  'DRAINAGE',
  'GARBAGE',
  'TRAFFIC_SIGNAL',
  'ELECTRICITY',
  'PUBLIC_TOILET',
  'PARK',
  'OTHER',
];

const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'VERIFIED',
  'CLOSED',
  'REJECTED',
];

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

class ComplaintServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Generate a unique municipal complaint code (e.g. CMP-10025)
 */
async function generateComplaintCode() {
  const count = await prisma.complaint.count();
  const nextNum = 10001 + count;
  let code = `CMP-${nextNum}`;
  let exists = await prisma.complaint.findUnique({ where: { complaintCode: code } });
  while (exists) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    code = `CMP-${nextNum}-${randomSuffix}`;
    exists = await prisma.complaint.findUnique({ where: { complaintCode: code } });
  }
  return code;
}

/**
 * Helper to determine default department by category if no asset is selected
 */
async function resolveDefaultDepartment(category) {
  const allDepts = await prisma.department.findMany({
    where: { isActive: true },
  });

  if (allDepts.length === 0) {
    throw new ComplaintServiceError('No active municipal department configured in the system', 500);
  }

  const categoryLower = (category || '').toLowerCase();

  // Try matching by sector keywords
  let matched = null;
  if (['water', 'drainage'].includes(categoryLower)) {
    matched = allDepts.find((d) => /water|drainage/i.test(d.name));
  } else if (['electricity', 'transformer', 'traffic_signal'].includes(categoryLower)) {
    matched = allDepts.find((d) => /electric|energy|signal/i.test(d.name));
  } else {
    // Road, Streetlight, Park, Public Toilet, Garbage, etc.
    matched = allDepts.find((d) => /works|road|public/i.test(d.name));
  }

  return matched || allDepts[0];
}

/**
 * Get complaints with pagination, search, filters, and role-based access control
 */
async function getComplaints({
  user,
  page = 1,
  limit = 10,
  search,
  status,
  category,
  severity,
  priority,
  departmentId,
  assetId,
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  const where = {};

  // STRICT ACCESS CONTROL: Citizens can ONLY view their own complaints
  if (user.role === 'CITIZEN') {
    where.citizenId = user.id;
  } else if (user.role === 'OFFICER' && !departmentId && user.departmentId) {
    // Optionally scope officer default view to their department if no explicit filter is given
    where.departmentId = user.departmentId;
  }

  // Filter by department if requested (and allowed)
  if (departmentId && user.role !== 'CITIZEN') {
    where.departmentId = departmentId;
  }

  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  if (category && typeof category === 'string' && category.trim()) {
    where.category = category.trim().toUpperCase();
  }

  if (severity && VALID_SEVERITIES.includes(severity)) {
    where.severity = severity;
  }

  if (priority && VALID_PRIORITIES.includes(priority)) {
    where.priority = priority;
  }

  if (assetId) {
    where.assetId = assetId;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    where.OR = [
      { complaintCode: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { submittedAt: 'desc' },
      include: {
        citizen: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
    }),
  ]);

  return {
    complaints,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

/**
 * Get complaint by ID with strict ownership/role verification
 */
async function getComplaintById(id, user) {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      citizen: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          description: true,
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
      workOrder: {
        select: {
          id: true,
          workOrderCode: true,
          status: true,
        },
      },
    },
  });

  if (!complaint) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  // Citizens can only view their own complaint
  if (user.role === 'CITIZEN' && complaint.citizenId !== user.id) {
    throw new ComplaintServiceError('Access denied. You can only view your own complaints.', 403);
  }

  return complaint;
}

/**
 * Create a new citizen complaint
 */
async function createComplaint(data, user) {
  const {
    category,
    description,
    severity = 'MEDIUM',
    latitude,
    longitude,
    address,
    assetId,
    imageUrl,
  } = data;

  if (!category || typeof category !== 'string' || !category.trim()) {
    throw new ComplaintServiceError('Complaint category is required', 400);
  }
  const normalizedCategory = category.trim().toUpperCase();

  if (!description || typeof description !== 'string' || !description.trim()) {
    throw new ComplaintServiceError('Complaint description is required', 400);
  }

  if (severity && !VALID_SEVERITIES.includes(severity)) {
    throw new ComplaintServiceError(`Invalid severity. Allowed: ${VALID_SEVERITIES.join(', ')}`, 400);
  }

  // Validate coordinates
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    throw new ComplaintServiceError('Latitude must be a valid number between -90 and 90', 400);
  }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    throw new ComplaintServiceError('Longitude must be a valid number between -180 and 180', 400);
  }

  let targetDepartmentId = null;

  // If asset selected, verify it exists and route to its department
  if (assetId) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, departmentId: true },
    });
    if (!asset) {
      throw new ComplaintServiceError('Selected asset does not exist', 404);
    }
    targetDepartmentId = asset.departmentId;
  } else {
    // Resolve department by category
    const defaultDept = await resolveDefaultDepartment(normalizedCategory);
    targetDepartmentId = defaultDept.id;
  }

  const complaintCode = await generateComplaintCode();

  const newComplaint = await prisma.complaint.create({
    data: {
      complaintCode,
      category: normalizedCategory,
      description: description.trim(),
      severity: severity || 'MEDIUM',
      priority: 'MEDIUM',
      status: 'SUBMITTED',
      latitude: latNum,
      longitude: lngNum,
      address: address ? address.trim() : null,
      imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : null,
      citizenId: user.id, // Strictly from authenticated token
      assetId: assetId || null,
      departmentId: targetDepartmentId,
    },
    include: {
      citizen: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      asset: {
        select: {
          id: true,
          assetCode: true,
          name: true,
        },
      },
    },
  });

  return newComplaint;
}

/**
 * Update complaint details
 */
async function updateComplaint(id, data, user) {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  // Citizens can only edit their own complaint if it is still SUBMITTED
  if (user.role === 'CITIZEN') {
    if (existing.citizenId !== user.id) {
      throw new ComplaintServiceError('You are not authorized to edit this complaint', 403);
    }
    if (existing.status !== 'SUBMITTED') {
      throw new ComplaintServiceError('Complaint has already been reviewed and cannot be modified', 400);
    }

    const updateData = {};
    if (data.description && data.description.trim()) {
      updateData.description = data.description.trim();
    }
    if (data.category && typeof data.category === 'string') {
      updateData.category = data.category.trim().toUpperCase();
    }
    if (data.address !== undefined) {
      updateData.address = data.address ? data.address.trim() : null;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl ? data.imageUrl.trim() : null;
    }

    return await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        citizen: { select: { id: true, firstName: true, lastName: true } },
        department: { select: { id: true, name: true } },
        asset: { select: { id: true, assetCode: true, name: true } },
      },
    });
  }

  // ADMIN / OFFICER updates
  const updateData = {};
  if (data.description) updateData.description = data.description.trim();
  if (data.category) updateData.category = data.category.trim().toUpperCase();
  if (data.address !== undefined) updateData.address = data.address ? data.address.trim() : null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ? data.imageUrl.trim() : null;
  if (data.severity && VALID_SEVERITIES.includes(data.severity)) updateData.severity = data.severity;
  if (data.priority && VALID_PRIORITIES.includes(data.priority)) updateData.priority = data.priority;
  if (data.status && VALID_STATUSES.includes(data.status)) updateData.status = data.status;

  if (data.assetId !== undefined) {
    if (data.assetId) {
      const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new ComplaintServiceError('Selected asset does not exist', 404);
      updateData.assetId = asset.id;
    } else {
      updateData.assetId = null;
    }
  }

  if (data.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!dept) throw new ComplaintServiceError('Department not found', 404);
    updateData.departmentId = dept.id;
  }

  return await prisma.complaint.update({
    where: { id },
    data: updateData,
    include: {
      citizen: { select: { id: true, firstName: true, lastName: true, email: true } },
      department: { select: { id: true, name: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

/**
 * Patch complaint status with lifecycle validation
 */
async function updateComplaintStatus(id, newStatus, user) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new ComplaintServiceError(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  // Role validation
  if (user.role === 'CITIZEN') {
    throw new ComplaintServiceError('Citizens are not authorized to modify complaint processing status', 403);
  }

  // Prevent invalid transitions
  if (existing.status === 'CLOSED' && newStatus !== 'CLOSED' && user.role !== 'ADMIN') {
    throw new ComplaintServiceError('Closed complaints cannot be reopened except by an Administrator', 400);
  }

  const data = { status: newStatus };
  if (newStatus === 'RESOLVED') {
    data.resolvedAt = new Date();
  } else if (newStatus === 'CLOSED' || newStatus === 'REJECTED') {
    data.closedAt = new Date();
  }

  return await prisma.complaint.update({
    where: { id },
    data,
    include: {
      citizen: { select: { id: true, firstName: true, lastName: true, email: true } },
      department: { select: { id: true, name: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

/**
 * Patch complaint priority
 */
async function updateComplaintPriority(id, priority, user) {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ComplaintServiceError(`Invalid priority. Allowed: ${VALID_PRIORITIES.join(', ')}`, 400);
  }

  if (user.role === 'CITIZEN') {
    throw new ComplaintServiceError('Citizens cannot modify municipal priority levels', 403);
  }

  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  return await prisma.complaint.update({
    where: { id },
    data: { priority },
    include: {
      department: { select: { id: true, name: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

/**
 * Patch complaint severity
 */
async function updateComplaintSeverity(id, severity, user) {
  if (!VALID_SEVERITIES.includes(severity)) {
    throw new ComplaintServiceError(`Invalid severity. Allowed: ${VALID_SEVERITIES.join(', ')}`, 400);
  }

  if (user.role === 'CITIZEN') {
    throw new ComplaintServiceError('Citizens cannot modify operational severity', 403);
  }

  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  return await prisma.complaint.update({
    where: { id },
    data: { severity },
    include: {
      department: { select: { id: true, name: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

/**
 * Reassign or route complaint to a department
 */
async function updateComplaintDepartment(id, departmentId, user) {
  if (!departmentId) {
    throw new ComplaintServiceError('Department ID is required', 400);
  }

  if (user.role === 'CITIZEN') {
    throw new ComplaintServiceError('Citizens cannot reassign departments', 403);
  }

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) {
    throw new ComplaintServiceError('Department not found', 404);
  }

  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  return await prisma.complaint.update({
    where: { id },
    data: { departmentId: department.id },
    include: {
      department: { select: { id: true, name: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

/**
 * Cancel complaint (soft cancellation to preserve municipal records)
 */
async function cancelComplaint(id, user) {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ComplaintServiceError('Complaint not found', 404);
  }

  if (user.role === 'CITIZEN') {
    if (existing.citizenId !== user.id) {
      throw new ComplaintServiceError('You cannot cancel another citizen’s complaint', 403);
    }
    if (existing.status !== 'SUBMITTED' && existing.status !== 'UNDER_REVIEW') {
      throw new ComplaintServiceError('Cannot cancel complaint once active work has been dispatched', 400);
    }
  }

  return await prisma.complaint.update({
    where: { id },
    data: {
      status: 'REJECTED',
      closedAt: new Date(),
    },
    include: {
      department: { select: { id: true, name: true } },
    },
  });
}

/**
 * Get summary statistics for admin / officer dashboards
 */
async function getComplaintStats(user) {
  const where = {};
  if (user.role === 'CITIZEN') {
    where.citizenId = user.id;
  } else if (user.role === 'OFFICER' && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const [total, submitted, inProgress, resolved, closed, critical] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.count({ where: { ...where, status: 'SUBMITTED' } }),
    prisma.complaint.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.complaint.count({ where: { ...where, status: 'RESOLVED' } }),
    prisma.complaint.count({ where: { ...where, status: 'CLOSED' } }),
    prisma.complaint.count({ where: { ...where, severity: 'CRITICAL' } }),
  ]);

  return {
    total,
    submitted,
    inProgress,
    resolved,
    closed,
    critical,
  };
}

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  updateComplaintSeverity,
  updateComplaintDepartment,
  cancelComplaint,
  getComplaintStats,
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_SEVERITIES,
  VALID_PRIORITIES,
  ComplaintServiceError,
};
