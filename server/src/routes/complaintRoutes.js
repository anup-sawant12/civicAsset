const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All complaint endpoints require authentication
router.use(authenticate);

// Statistics summary
router.get('/stats', authorizeRoles('ADMIN', 'OFFICER', 'CITIZEN'), complaintController.getComplaintStats);

// List & Single details
router.get('/', authorizeRoles('ADMIN', 'OFFICER', 'CITIZEN'), complaintController.getComplaints);
router.get('/:id', authorizeRoles('ADMIN', 'OFFICER', 'CITIZEN'), complaintController.getComplaintById);

// Creation
router.post('/', authorizeRoles('CITIZEN', 'ADMIN', 'OFFICER'), complaintController.createComplaint);

// Full update
router.put('/:id', authorizeRoles('CITIZEN', 'ADMIN', 'OFFICER'), complaintController.updateComplaint);

// Granular municipal patches (Officers & Admins only)
router.patch('/:id/status', authorizeRoles('ADMIN', 'OFFICER'), complaintController.updateComplaintStatus);
router.patch('/:id/priority', authorizeRoles('ADMIN', 'OFFICER'), complaintController.updateComplaintPriority);
router.patch('/:id/severity', authorizeRoles('ADMIN', 'OFFICER'), complaintController.updateComplaintSeverity);
router.patch('/:id/department', authorizeRoles('ADMIN', 'OFFICER'), complaintController.updateComplaintDepartment);

// Controlled cancellation
router.delete('/:id', authorizeRoles('CITIZEN', 'ADMIN', 'OFFICER'), complaintController.deleteComplaint);

module.exports = router;
