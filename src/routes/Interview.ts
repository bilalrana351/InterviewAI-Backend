import { Router } from 'express';
import {
  getAllInterviews,
  createInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
} from '../controllers/Interview';

const router = Router();

// GET /api/interview - Get all interviews
router.get('/', getAllInterviews);

// POST /api/interview - Create a new interview
router.post('/',  createInterview);

// GET /api/interview/:id - Get an interview by ID
router.get('/:id',  getInterviewById);

// PUT /api/interview/:id - Update an interview by ID
router.put('/:id',  updateInterview);

router.delete('/:id',  deleteInterview);
// DELETE /api/interview/:id - Delete an interview by ID

export const interviewRoutes = router;
