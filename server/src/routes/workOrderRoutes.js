const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All work order operations require authentication
router.use(authenticate);

// Statistics summary for dashboards
router.get(
  '/stats',
  authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER'),
  workOrderController.getWorkOrderStats
);

// List work orders (Role-scoped within service: Field Worker gets only assigned, Officer gets department, Admin gets all)
router.get(
  '/',
  authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER'),
  workOrderController.getWorkOrders
);

// Get single work order details
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER'),
  workOrderController.getWorkOrderById
);

// Create work order from complaint (Officers & Admins)
router.post(
  '/',
  authorizeRoles('ADMIN', 'OFFICER'),
  workOrderController.createWorkOrder
);

// Full update for work order operational data (Officers & Admins)
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'OFFICER'),
  workOrderController.updateWorkOrder
);

// Assign / reassign field worker (Officers & Admins)
router.patch(
  '/:id/assign',
  authorizeRoles('ADMIN', 'OFFICER'),
  workOrderController.assignWorker
);

// Assign / reassign officer (Admins & Officers)
router.patch(
  '/:id/assign-officer',
  authorizeRoles('ADMIN', 'OFFICER'),
  workOrderController.assignOfficer
);

// Start work (Assigned Field Worker, Officer, Admin)
router.patch(
  '/:id/start',
  authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER'),
  workOrderController.startWork
);

// Complete work with notes and evidence photo (Assigned Field Worker, Officer, Admin)
router.patch(
  '/:id/complete',
  authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER'),
  workOrderController.completeWork
);

// Controlled status update / verification lifecycle transitions
router.patch(
  '/:id/status',
  authorizeRoles('ADMIN', 'OFFICER', 'FIELD_WORKER'),
  workOrderController.updateWorkOrderStatus
);

// Controlled cancellation (Soft delete with status = CANCELLED)
router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'OFFICER'),
  workOrderController.deleteWorkOrder
);

module.exports = router;
