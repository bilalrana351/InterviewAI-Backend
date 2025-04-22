import { Router } from 'express';
import {
  getAllCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../controllers/Company';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// GET /api/company - Get all companies
router.get('/', authMiddleware, getAllCompanies);

// POST /api/company - Create a new company
router.post('/', authMiddleware, createCompany);

// GET /api/company/:id - Get a company by ID
router.get('/:id', authMiddleware, getCompanyById);

// PUT /api/company/:id - Update a company by ID
router.put('/:id', authMiddleware, updateCompany);

// DELETE /api/company/:id - Delete a company by ID
router.delete('/:id', authMiddleware, deleteCompany);

export const companyRoutes = router;
