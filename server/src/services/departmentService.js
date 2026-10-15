const prisma = require('../config/db');

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Get all departments with user and asset counts
 */
async function getDepartments({ search, isActive } = {}) {
  const where = {};

  if (isActive !== undefined && isActive !== null && isActive !== '') {
    where.isActive = String(isActive) === 'true';
  }

  if (search && typeof search === 'string' && search.trim()) {
    const query = search.trim();
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  const departments = await prisma.department.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          assets: true,
          complaints: true,
          workOrders: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return departments;
}

/**
 * Get single department by ID with associated staff members
 */
async function getDepartmentById(id) {
  const department = await prisma.department.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          firstName: 'asc',
        },
      },
      _count: {
        select: {
          users: true,
          assets: true,
          complaints: true,
          workOrders: true,
        },
      },
    },
  });

  if (!department) {
    throw new ServiceError('Department not found', 404);
  }

  return department;
}

/**
 * Create a new department
 */
async function createDepartment({ name, description }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ServiceError('Department name is required', 400);
  }

  const trimmedName = name.trim();

  // Check unique department name
  const existingDept = await prisma.department.findFirst({
    where: {
      name: {
        equals: trimmedName,
        mode: 'insensitive',
      },
    },
  });

  if (existingDept) {
    throw new ServiceError('A department with this name already exists', 409);
  }

  const newDepartment = await prisma.department.create({
    data: {
      name: trimmedName,
      description: description && typeof description === 'string' && description.trim() ? description.trim() : null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          assets: true,
        },
      },
    },
  });

  return newDepartment;
}

/**
 * Update an existing department
 */
async function updateDepartment(id, { name, description }) {
  const department = await prisma.department.findUnique({
    where: { id },
  });

  if (!department) {
    throw new ServiceError('Department not found', 404);
  }

  const dataToUpdate = {};

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ServiceError('Department name cannot be empty', 400);
    }
    const trimmedName = name.trim();
    // Check uniqueness if name changed
    if (trimmedName.toLowerCase() !== department.name.toLowerCase()) {
      const duplicate = await prisma.department.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: trimmedName,
            mode: 'insensitive',
          },
        },
      });
      if (duplicate) {
        throw new ServiceError('A department with this name already exists', 409);
      }
    }
    dataToUpdate.name = trimmedName;
  }

  if (description !== undefined) {
    dataToUpdate.description = description && typeof description === 'string' && description.trim() ? description.trim() : null;
  }

  const updatedDept = await prisma.department.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          assets: true,
        },
      },
    },
  });

  return updatedDept;
}

/**
 * Activate or deactivate a department
 */
async function updateDepartmentStatus(id, isActive) {
  if (typeof isActive !== 'boolean') {
    throw new ServiceError('isActive must be a boolean', 400);
  }

  const department = await prisma.department.findUnique({
    where: { id },
  });

  if (!department) {
    throw new ServiceError('Department not found', 404);
  }

  const updatedDept = await prisma.department.update({
    where: { id },
    data: {
      isActive,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          assets: true,
        },
      },
    },
  });

  return updatedDept;
}

/**
 * Safe delete department (blocks deletion if linked records exist)
 */
async function deleteDepartment(id) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          assets: true,
          complaints: true,
          workOrders: true,
        },
      },
    },
  });

  if (!department) {
    throw new ServiceError('Department not found', 404);
  }

  const { users, assets, complaints, workOrders } = department._count;
  if (users > 0 || assets > 0 || complaints > 0 || workOrders > 0) {
    throw new ServiceError(
      `Cannot delete department with active data (${users} users, ${assets} assets, ${complaints} complaints, ${workOrders} work orders). Deactivate the department instead.`,
      400
    );
  }

  await prisma.department.delete({
    where: { id },
  });

  return { success: true, message: 'Department deleted successfully' };
}

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
  ServiceError,
};
