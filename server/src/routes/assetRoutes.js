import express from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, getDepartments } from '../controllers/assetController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorize(['ADMIN', 'OFFICER']), createAsset);
router.get('/', authenticate, getAssets);
router.get('/departments', authenticate, getDepartments);
router.get('/:id', authenticate, getAssetById);
router.put('/:id', authenticate, authorize(['ADMIN', 'OFFICER']), updateAsset);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteAsset);

export default router;
