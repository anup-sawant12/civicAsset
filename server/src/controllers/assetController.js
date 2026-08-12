import prisma from '../config/prisma.js';

export const createAsset = async (req, res) => {
  try {
    const { name, description, assetType, latitude, longitude, departmentId, estimatedValue, warrantyInfo } = req.body;

    if (!name || !assetType || latitude === undefined || longitude === undefined || !departmentId) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const assetId = `AST-${randomCode}`;

    const newAsset = await prisma.asset.create({
      data: {
        id: assetId,
        name,
        description,
        assetType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        installationDate: new Date(),
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        warrantyInfo,
        departmentId
      }
    });

    res.status(201).json({ success: true, message: 'Asset created successfully', asset: newAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getAssets = async (req, res) => {
  try {
    const { status, condition } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (condition) filters.condition = condition;

    const assets = await prisma.asset.findMany({
      where: filters,
      include: {
        department: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        complaints: true,
        workOrders: true,
        maintenanceRecords: true
      }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.latitude !== undefined) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude !== undefined) updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.estimatedValue !== undefined) updateData.estimatedValue = parseFloat(updateData.estimatedValue);

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, message: 'Asset updated successfully', asset: updatedAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.asset.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
