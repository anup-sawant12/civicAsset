const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_CREATABLE_ROLES = ['OFFICER', 'FIELD_WORKER', 'CITIZEN'];
const VALID_ROLES = ['ADMIN', 'OFFICER', 'FIELD_WORKER', 'CITIZEN'];
const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Get users with optional filtering and search
 */
async function getUsers({ role, status, departmentId, search } = {}) {
  const where = {};

  if (role && VALID_ROLES.includes(role)) {
    where.role = role;
  }

  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const query = search.trim();
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

/**
 * Get single user by ID with department info
 */
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  return user;
}

/**
 * Create a new user (Officer, Field Worker, or Citizen) by Admin
 */
async function createUser({ firstName, lastName, email, phone, password, role, departmentId }) {
  // Validate basic fields
  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    throw new ServiceError('First name is required', 400);
  }
  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    throw new ServiceError('Last name is required', 400);
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new ServiceError('Email is required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new ServiceError('Please provide a valid email address', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ServiceError('Password must be at least 8 characters long', 400);
  }

  // Validate role
  if (!role || !ALLOWED_CREATABLE_ROLES.includes(role)) {
    throw new ServiceError(
      `Role must be one of: ${ALLOWED_CREATABLE_ROLES.join(', ')}`,
      400
    );
  }

  // Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new ServiceError('Email is already registered', 409);
  }

  // Validate department requirements
  let finalDepartmentId = null;
  if (role === 'OFFICER' || role === 'FIELD_WORKER') {
    if (!departmentId) {
      throw new ServiceError(`Department is required for role ${role}`, 400);
    }
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new ServiceError('Assigned department does not exist', 400);
    }
    if (!department.isActive) {
      throw new ServiceError('Cannot assign user to an inactive department', 400);
    }
    finalDepartmentId = department.id;
  } else if (role === 'CITIZEN' && departmentId) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (department) {
      finalDepartmentId = department.id;
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      role,
      status: 'ACTIVE',
      departmentId: finalDepartmentId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
}

/**
 * Update an existing user
 */
async function updateUser(id, updateData, currentUserId) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  const dataToUpdate = {};

  if (updateData.firstName !== undefined) {
    if (!updateData.firstName || !updateData.firstName.trim()) {
      throw new ServiceError('First name cannot be empty', 400);
    }
    dataToUpdate.firstName = updateData.firstName.trim();
  }

  if (updateData.lastName !== undefined) {
    if (!updateData.lastName || !updateData.lastName.trim()) {
      throw new ServiceError('Last name cannot be empty', 400);
    }
    dataToUpdate.lastName = updateData.lastName.trim();
  }

  if (updateData.phone !== undefined) {
    dataToUpdate.phone = updateData.phone && updateData.phone.trim() ? updateData.phone.trim() : null;
  }

  // Role update handling
  let newRole = user.role;
  if (updateData.role !== undefined) {
    if (!VALID_ROLES.includes(updateData.role)) {
      throw new ServiceError(`Invalid role: ${updateData.role}`, 400);
    }
    // Cannot escalate normal user to ADMIN through this endpoint
    if (updateData.role === 'ADMIN' && user.role !== 'ADMIN') {
      throw new ServiceError('Cannot escalate user to ADMIN role', 403);
    }
    newRole = updateData.role;
    dataToUpdate.role = newRole;
  }

  // Department handling
  if (updateData.departmentId !== undefined) {
    if (updateData.departmentId === null || updateData.departmentId === '') {
      if (newRole === 'OFFICER' || newRole === 'FIELD_WORKER') {
        throw new ServiceError(`Department is required for role ${newRole}`, 400);
      }
      dataToUpdate.departmentId = null;
    } else {
      const department = await prisma.department.findUnique({
        where: { id: updateData.departmentId },
      });
      if (!department) {
        throw new ServiceError('Selected department does not exist', 400);
      }
      if (!department.isActive) {
        throw new ServiceError('Cannot assign user to an inactive department', 400);
      }
      dataToUpdate.departmentId = department.id;
    }
  } else if ((newRole === 'OFFICER' || newRole === 'FIELD_WORKER') && !user.departmentId) {
    throw new ServiceError(`Department is required for role ${newRole}`, 400);
  }

  // Status update & Self-lockout prevention
  if (updateData.status !== undefined) {
    if (!VALID_STATUSES.includes(updateData.status)) {
      throw new ServiceError(`Invalid status: ${updateData.status}`, 400);
    }
    if (currentUserId === id && (updateData.status === 'INACTIVE' || updateData.status === 'SUSPENDED')) {
      throw new ServiceError('You cannot deactivate your own account', 400);
    }
    dataToUpdate.status = updateData.status;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

/**
 * Update user status with self-lockout protection
 */
async function updateUserStatus(id, status, currentUserId) {
  if (!VALID_STATUSES.includes(status)) {
    throw new ServiceError(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  if (currentUserId === id && (status === 'INACTIVE' || status === 'SUSPENDED')) {
    throw new ServiceError('You cannot deactivate your own account', 400);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  ServiceError,
};
