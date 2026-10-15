const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All department routes require authentication
router.use(authenticate);

// Read endpoints: accessible by all authenticated roles (needed for reporting, triage, and assignment)
router.get('/', authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER', 'CITIZEN'), departmentController.getDepartments);
router.get('/:id', authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER', 'CITIZEN'), departmentController.getDepartmentById);

// Creation, update, status toggle, and deletion are restricted to ADMIN only
router.post('/', authorizeRoles('ADMIN'), departmentController.createDepartment);
router.put('/:id', authorizeRoles('ADMIN'), departmentController.updateDepartment);
router.put('/:id/status', authorizeRoles('ADMIN'), departmentController.updateDepartmentStatus);
router.delete('/:id', authorizeRoles('ADMIN'), departmentController.deleteDepartment);

module.exports = router;
