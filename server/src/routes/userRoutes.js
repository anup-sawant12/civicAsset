const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All user management routes require authentication
router.use(authenticate);

// Admins and Officers can retrieve users (needed for field worker assignment)
router.get('/', authorizeRoles('ADMIN', 'OFFICER'), userController.getUsers);
router.get('/:id', authorizeRoles('ADMIN', 'OFFICER'), userController.getUserById);

// Creation, modification, and status updates are restricted to ADMIN only
router.post('/', authorizeRoles('ADMIN'), userController.createUser);
router.put('/:id', authorizeRoles('ADMIN'), userController.updateUser);
router.put('/:id/status', authorizeRoles('ADMIN'), userController.updateUserStatus);

module.exports = router;
