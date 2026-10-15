const assetService = require('../services/assetService');

/**
 * GET /api/assets
 */
async function getAssets(req, res) {
  try {
    const {
      page,
      limit,
      search,
      assetType,
      status,
      condition,
      riskLevel,
      departmentId,
    } = req.query;

    const result = await assetService.getAssets({
      page,
      limit,
      search,
      assetType,
      status,
      condition,
      riskLevel,
      departmentId,
    });

    return res.status(200).json({
      success: true,
      data: result.assets,
      pagination: result.pagination,
      total: result.pagination.total,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch assets',
    });
  }
}

/**
 * GET /api/assets/:id
 */
async function getAssetById(req, res) {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    return res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch asset',
    });
  }
}

/**
 * POST /api/assets
 */
async function createAsset(req, res) {
  try {
    const asset = await assetService.createAsset(req.body);
    return res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create asset',
    });
  }
}

/**
 * PUT /api/assets/:id
 */
async function updateAsset(req, res) {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: asset,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update asset',
    });
  }
}

/**
 * PATCH /api/assets/:id/status
 */
async function updateAssetStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required in request body',
      });
    }

    const asset = await assetService.updateAssetStatus(req.params.id, status);
    return res.status(200).json({
      success: true,
      message: `Asset status updated to ${status}`,
      data: asset,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update asset status',
    });
  }
}

/**
 * PATCH /api/assets/:id/condition
 */
async function updateAssetCondition(req, res) {
  try {
    const { condition } = req.body;
    if (!condition) {
      return res.status(400).json({
        success: false,
        message: 'Condition is required in request body',
      });
    }

    const asset = await assetService.updateAssetCondition(req.params.id, condition);
    return res.status(200).json({
      success: true,
      message: `Asset condition updated to ${condition}`,
      data: asset,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update asset condition',
    });
  }
}

/**
 * DELETE /api/assets/:id (Controlled Retirement)
 */
async function deleteAsset(req, res) {
  try {
    const asset = await assetService.retireAsset(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Asset successfully retired and archived',
      data: asset,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retire asset',
    });
  }
}

/**
 * GET /api/assets/map (Lightweight GIS markers and stats)
 */
async function getMapAssets(req, res) {
  try {
    const {
      search,
      assetType,
      status,
      condition,
      riskLevel,
      departmentId,
    } = req.query;

    const result = await assetService.getMapAssets({
      search,
      assetType,
      status,
      condition,
      riskLevel,
      departmentId,
    });

    return res.status(200).json({
      success: true,
      data: result.assets,
      stats: result.stats,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch map assets',
    });
  }
}

module.exports = {
  getAssets,
  getAssetById,
  getMapAssets,
  createAsset,
  updateAsset,
  updateAssetStatus,
  updateAssetCondition,
  deleteAsset,
};
