const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All audit log endpoints require authentication and ADMIN role
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/stats', auditController.getAuditStats);
router.get('/', auditController.getAuditLogs);
router.get('/:id', auditController.getAuditLogById);

module.exports = router;
