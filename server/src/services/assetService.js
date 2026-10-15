const prisma = require('../config/db');

const VALID_ASSET_TYPES = [
  'STREETLIGHT',
  'WATER_PIPELINE',
  'TRANSFORMER',
  'ROAD',
  'DRAINAGE',
  'TRAFFIC_SIGNAL',
  'PUBLIC_TOILET',
  'PARK',
  'GARBAGE_BIN',
  'OTHER',
];

const VALID_ASSET_STATUSES = [
  'OPERATIONAL',
  'UNDER_MAINTENANCE',
  'DAMAGED',
  'INACTIVE',
  'RETIRED',
];

const VALID_ASSET_CONDITIONS = [
  'EXCELLENT',
  'GOOD',
  'FAIR',
  'POOR',
  'CRITICAL',
];

const VALID_RISK_LEVELS = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

class AssetServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Helper to parse and validate date strings
 */
function parseDateOrNull(val, fieldName) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    throw new AssetServiceError(`Invalid date format for ${fieldName}`, 400);
  }
  return d;
}

/**
 * Get assets with pagination, search, and filtering
 */
async function getAssets({
  page = 1,
  limit = 10,
  search,
  assetType,
  status,
  condition,
  riskLevel,
  departmentId,
} = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  const where = {};

  if (assetType && VALID_ASSET_TYPES.includes(assetType)) {
    where.assetType = assetType;
  }

  if (status && VALID_ASSET_STATUSES.includes(status)) {
    where.status = status;
  }

  if (condition && VALID_ASSET_CONDITIONS.includes(condition)) {
    where.condition = condition;
  }

  if (riskLevel && VALID_RISK_LEVELS.includes(riskLevel)) {
    where.riskLevel = riskLevel;
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const query = search.trim();
    where.OR = [
      { assetCode: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  const [total, assets] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            complaints: true,
            workOrders: true,
            maintenanceRecords: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    assets,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

/**
 * Get single asset with department and counts
 */
async function getAssetById(id) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          complaints: true,
          workOrders: true,
          maintenanceRecords: true,
        },
      },
    },
  });

  if (!asset) {
    throw new AssetServiceError('Asset not found', 404);
  }

  return asset;
}

/**
 * Create a new infrastructure asset
 */
async function createAsset(data) {
  const {
    assetCode,
    name,
    assetType,
    description,
    status = 'OPERATIONAL',
    condition = 'GOOD',
    latitude,
    longitude,
    address,
    installationDate,
    lastMaintenance,
    nextMaintenance,
    riskScore = 0,
    riskLevel = 'LOW',
    departmentId,
  } = data;

  // Validation
  if (!assetCode || typeof assetCode !== 'string' || !assetCode.trim()) {
    throw new AssetServiceError('Asset code is required', 400);
  }
  const trimmedCode = assetCode.trim().toUpperCase();

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AssetServiceError('Asset name is required', 400);
  }

  if (!assetType || !VALID_ASSET_TYPES.includes(assetType)) {
    throw new AssetServiceError(
      `Invalid asset type. Must be one of: ${VALID_ASSET_TYPES.join(', ')}`,
      400
    );
  }

  if (status && !VALID_ASSET_STATUSES.includes(status)) {
    throw new AssetServiceError(
      `Invalid asset status. Must be one of: ${VALID_ASSET_STATUSES.join(', ')}`,
      400
    );
  }

  if (condition && !VALID_ASSET_CONDITIONS.includes(condition)) {
    throw new AssetServiceError(
      `Invalid asset condition. Must be one of: ${VALID_ASSET_CONDITIONS.join(', ')}`,
      400
    );
  }

  if (riskLevel && !VALID_RISK_LEVELS.includes(riskLevel)) {
    throw new AssetServiceError(
      `Invalid risk level. Must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
      400
    );
  }

  const latNum = parseFloat(latitude);
  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    throw new AssetServiceError('Latitude must be a valid number between -90 and 90', 400);
  }

  const lngNum = parseFloat(longitude);
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    throw new AssetServiceError('Longitude must be a valid number between -180 and 180', 400);
  }

  const scoreNum = parseFloat(riskScore) || 0;
  if (scoreNum < 0 || scoreNum > 100) {
    throw new AssetServiceError('Risk score must be a number between 0 and 100', 400);
  }

  if (!departmentId) {
    throw new AssetServiceError('Department ID is required', 400);
  }

  // Verify department exists
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!department) {
    throw new AssetServiceError('Assigned department does not exist', 400);
  }

  // Check unique assetCode
  const existingAsset = await prisma.asset.findUnique({
    where: { assetCode: trimmedCode },
  });
  if (existingAsset) {
    throw new AssetServiceError(`Asset code "${trimmedCode}" is already in use`, 409);
  }

  // Parse dates
  const parsedInstall = parseDateOrNull(installationDate, 'installationDate');
  const parsedLastMaint = parseDateOrNull(lastMaintenance, 'lastMaintenance');
  const parsedNextMaint = parseDateOrNull(nextMaintenance, 'nextMaintenance');

  const newAsset = await prisma.asset.create({
    data: {
      assetCode: trimmedCode,
      name: name.trim(),
      assetType,
      description: description && description.trim() ? description.trim() : null,
      status,
      condition,
      latitude: latNum,
      longitude: lngNum,
      address: address && address.trim() ? address.trim() : null,
      installationDate: parsedInstall,
      lastMaintenance: parsedLastMaint,
      nextMaintenance: parsedNextMaint,
      riskScore: scoreNum,
      riskLevel,
      departmentId,
    },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  return newAsset;
}

/**
 * Update an existing asset
 */
async function updateAsset(id, data) {
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) {
    throw new AssetServiceError('Asset not found', 404);
  }

  const updatePayload = {};

  if (data.assetCode !== undefined) {
    if (!data.assetCode || !data.assetCode.trim()) {
      throw new AssetServiceError('Asset code cannot be empty', 400);
    }
    const trimmedCode = data.assetCode.trim().toUpperCase();
    if (trimmedCode !== existing.assetCode) {
      const duplicate = await prisma.asset.findUnique({
        where: { assetCode: trimmedCode },
      });
      if (duplicate) {
        throw new AssetServiceError(`Asset code "${trimmedCode}" is already in use`, 409);
      }
    }
    updatePayload.assetCode = trimmedCode;
  }

  if (data.name !== undefined) {
    if (!data.name || !data.name.trim()) {
      throw new AssetServiceError('Asset name cannot be empty', 400);
    }
    updatePayload.name = data.name.trim();
  }

  if (data.assetType !== undefined) {
    if (!VALID_ASSET_TYPES.includes(data.assetType)) {
      throw new AssetServiceError(`Invalid asset type: ${data.assetType}`, 400);
    }
    updatePayload.assetType = data.assetType;
  }

  if (data.description !== undefined) {
    updatePayload.description = data.description && data.description.trim() ? data.description.trim() : null;
  }

  if (data.status !== undefined) {
    if (!VALID_ASSET_STATUSES.includes(data.status)) {
      throw new AssetServiceError(`Invalid asset status: ${data.status}`, 400);
    }
    updatePayload.status = data.status;
  }

  if (data.condition !== undefined) {
    if (!VALID_ASSET_CONDITIONS.includes(data.condition)) {
      throw new AssetServiceError(`Invalid asset condition: ${data.condition}`, 400);
    }
    updatePayload.condition = data.condition;
  }

  if (data.latitude !== undefined) {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new AssetServiceError('Latitude must be between -90 and 90', 400);
    }
    updatePayload.latitude = lat;
  }

  if (data.longitude !== undefined) {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new AssetServiceError('Longitude must be between -180 and 180', 400);
    }
    updatePayload.longitude = lng;
  }

  if (data.address !== undefined) {
    updatePayload.address = data.address && data.address.trim() ? data.address.trim() : null;
  }

  if (data.installationDate !== undefined) {
    updatePayload.installationDate = parseDateOrNull(data.installationDate, 'installationDate');
  }

  if (data.lastMaintenance !== undefined) {
    updatePayload.lastMaintenance = parseDateOrNull(data.lastMaintenance, 'lastMaintenance');
  }

  if (data.nextMaintenance !== undefined) {
    updatePayload.nextMaintenance = parseDateOrNull(data.nextMaintenance, 'nextMaintenance');
  }

  if (data.riskScore !== undefined) {
    const score = parseFloat(data.riskScore);
    if (isNaN(score) || score < 0 || score > 100) {
      throw new AssetServiceError('Risk score must be between 0 and 100', 400);
    }
    updatePayload.riskScore = score;
  }

  if (data.riskLevel !== undefined) {
    if (!VALID_RISK_LEVELS.includes(data.riskLevel)) {
      throw new AssetServiceError(`Invalid risk level: ${data.riskLevel}`, 400);
    }
    updatePayload.riskLevel = data.riskLevel;
  }

  if (data.departmentId !== undefined) {
    if (!data.departmentId) {
      throw new AssetServiceError('Department ID cannot be empty', 400);
    }
    const dept = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!dept) {
      throw new AssetServiceError('Selected department does not exist', 400);
    }
    updatePayload.departmentId = data.departmentId;
  }

  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: updatePayload,
    include: {
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  return updatedAsset;
}

/**
 * Patch asset operational status
 */
async function updateAssetStatus(id, status) {
  if (!VALID_ASSET_STATUSES.includes(status)) {
    throw new AssetServiceError(
      `Invalid asset status. Must be one of: ${VALID_ASSET_STATUSES.join(', ')}`,
      400
    );
  }

  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) {
    throw new AssetServiceError('Asset not found', 404);
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: { status },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  return updated;
}

/**
 * Patch asset physical condition
 */
async function updateAssetCondition(id, condition) {
  if (!VALID_ASSET_CONDITIONS.includes(condition)) {
    throw new AssetServiceError(
      `Invalid asset condition. Must be one of: ${VALID_ASSET_CONDITIONS.join(', ')}`,
      400
    );
  }

  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) {
    throw new AssetServiceError('Asset not found', 404);
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: { condition },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  return updated;
}

/**
 * Controlled retire asset (preserves relational integrity)
 */
async function retireAsset(id) {
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) {
    throw new AssetServiceError('Asset not found', 404);
  }

  const retired = await prisma.asset.update({
    where: { id },
    data: {
      status: 'RETIRED',
    },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  return retired;
}

/**
 * Get assets formatted for GIS map view with statistics and filters
 */
async function getMapAssets({
  search,
  assetType,
  status,
  condition,
  riskLevel,
  departmentId,
} = {}) {
  const where = {};

  if (assetType && VALID_ASSET_TYPES.includes(assetType)) {
    where.assetType = assetType;
  }

  if (status && VALID_ASSET_STATUSES.includes(status)) {
    where.status = status;
  }

  if (condition && VALID_ASSET_CONDITIONS.includes(condition)) {
    where.condition = condition;
  }

  if (riskLevel && VALID_RISK_LEVELS.includes(riskLevel)) {
    where.riskLevel = riskLevel;
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const query = search.trim();
    where.OR = [
      { assetCode: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
    ];
  }

  const assets = await prisma.asset.findMany({
    where,
    select: {
      id: true,
      assetCode: true,
      name: true,
      assetType: true,
      description: true,
      status: true,
      condition: true,
      riskLevel: true,
      riskScore: true,
      latitude: true,
      longitude: true,
      address: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  let mappedCount = 0;
  let unmappedCount = 0;
  let criticalCount = 0;
  let maintenanceCount = 0;

  for (const a of assets) {
    const hasValidCoords =
      a.latitude !== null &&
      a.longitude !== null &&
      !isNaN(a.latitude) &&
      !isNaN(a.longitude) &&
      a.latitude >= -90 &&
      a.latitude <= 90 &&
      a.longitude >= -180 &&
      a.longitude <= 180;

    if (hasValidCoords) {
      mappedCount++;
    } else {
      unmappedCount++;
    }

    if (a.riskLevel === 'CRITICAL' || a.condition === 'CRITICAL') {
      criticalCount++;
    }
    if (a.status === 'UNDER_MAINTENANCE') {
      maintenanceCount++;
    }
  }

  return {
    assets,
    stats: {
      total: assets.length,
      mapped: mappedCount,
      unmapped: unmappedCount,
      critical: criticalCount,
      underMaintenance: maintenanceCount,
    },
  };
}

module.exports = {
  getAssets,
  getAssetById,
  getMapAssets,
  createAsset,
  updateAsset,
  updateAssetStatus,
  updateAssetCondition,
  retireAsset,
  VALID_ASSET_TYPES,
  VALID_ASSET_STATUSES,
  VALID_ASSET_CONDITIONS,
  VALID_RISK_LEVELS,
  AssetServiceError,
};
