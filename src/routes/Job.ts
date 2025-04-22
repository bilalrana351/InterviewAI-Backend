import { Router } from 'express';
import {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/Job';

const router = Router();

// GET /api/job - Get all jobs
router.get('/', getAllJobs);

// POST /api/job - Create a new job
router.post('/', createJob);

// GET /api/job/:id - Get a job by ID
router.get('/:id', getJobById);

// PUT /api/job/:id - Update a job by ID
router.put('/:id', updateJob);

// DELETE /api/job/:id - Delete a job by ID
router.delete('/:id', deleteJob);

export const jobRoutes = router;
