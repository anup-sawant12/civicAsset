import express from 'express';
import { 
  createComplaint, 
  getComplaints, 
  getComplaintById, 
  updateComplaint, 
  deleteComplaint 
} from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createComplaint);
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.put('/:id', authenticate, updateComplaint);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteComplaint);

export default router;
