const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All asset routes require authentication
router.use(authenticate);

// Read endpoints: accessible by all authenticated roles (Citizens link assets to complaints and view public map)
router.get('/map', authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER', 'CITIZEN'), assetController.getMapAssets);
router.get('/', authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER', 'CITIZEN'), assetController.getAssets);
router.get('/:id', authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER', 'CITIZEN'), assetController.getAssetById);

// Create and Update endpoints: ADMIN, OFFICER
router.post('/', authorizeRoles('ADMIN', 'OFFICER'), assetController.createAsset);
router.put('/:id', authorizeRoles('ADMIN', 'OFFICER'), assetController.updateAsset);
router.patch('/:id/status', authorizeRoles('ADMIN', 'OFFICER'), assetController.updateAssetStatus);
router.patch('/:id/condition', authorizeRoles('ADMIN', 'OFFICER'), assetController.updateAssetCondition);

// Controlled retirement: ADMIN, OFFICER
router.delete('/:id', authorizeRoles('ADMIN', 'OFFICER'), assetController.deleteAsset);

module.exports = router;
