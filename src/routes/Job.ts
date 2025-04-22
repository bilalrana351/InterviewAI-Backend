import { Router } from 'express';
import {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/Job';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// GET /api/jobs - Get all jobs for the user
router.get('/', authMiddleware, getAllJobs);

// POST /api/jobs - Create a new job
router.post('/', authMiddleware, createJob);

// GET /api/jobs/:id - Get a job by ID
router.get('/:id', authMiddleware, getJobById);

// PUT /api/jobs/:id - Update a job by ID
router.put('/:id', authMiddleware, updateJob);

// DELETE /api/jobs/:id - Delete a job by ID
router.delete('/:id', authMiddleware, deleteJob);

export const jobRoutes = router;
