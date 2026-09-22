import express from 'express';
import {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  getAvailableWorkers
} from '../controllers/workOrderController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of available field workers for dispatch (Officer & Admin only)
router.get('/workers', authenticate, authorize(['ADMIN', 'OFFICER']), getAvailableWorkers);

// Get work orders list (Role-filtered)
router.get('/', authenticate, getWorkOrders);

// Get specific work order by ID
router.get('/:id', authenticate, getWorkOrderById);

// Create / dispatch work order from complaint (Officer & Admin only)
router.post('/', authenticate, authorize(['ADMIN', 'OFFICER']), createWorkOrder);

// Update work order (Worker updates status/adds completion image; Officer verifies)
router.put('/:id', authenticate, updateWorkOrder);

export default router;
