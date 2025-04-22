import { Router } from 'express';
import {
  getAllInterviews,
  createInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
} from '../controllers/Interview';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// GET /api/interview - Get all interviews
router.get('/', authMiddleware, getAllInterviews);

// POST /api/interview - Create a new interview
router.post('/', authMiddleware, createInterview);

// GET /api/interview/:id - Get an interview by ID
router.get('/:id', authMiddleware, getInterviewById);

// PUT /api/interview/:id - Update an interview by ID
router.put('/:id', authMiddleware, updateInterview);

// DELETE /api/interview/:id - Delete an interview by ID
router.delete('/:id', authMiddleware, deleteInterview);

export const interviewRoutes = router;
