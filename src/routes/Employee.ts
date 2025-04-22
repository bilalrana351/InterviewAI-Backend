import { Router } from 'express';
import {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/Employee';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// GET /api/employees - Get all employees
router.get('/', authMiddleware, getAllEmployees);

// POST /api/employees - Create a new employee
router.post('/', authMiddleware, createEmployee);

// GET /api/employees/:id - Get an employee by ID
router.get('/:id', authMiddleware, getEmployeeById);

// PUT /api/employees/:id - Update an employee by ID
router.put('/:id', authMiddleware, updateEmployee);

// DELETE /api/employees/:id - Delete an employee by ID
router.delete('/:id', authMiddleware, deleteEmployee);

export const employeeRoutes = router;
