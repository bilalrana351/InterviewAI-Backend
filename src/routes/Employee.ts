import { Router } from 'express';
import {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/Employee';

const router = Router();

// GET /api/employee - Get all employees
router.get('/', getAllEmployees);

// POST /api/employee - Create a new employee
router.post('/', createEmployee);

// GET /api/employee/:id - Get an employee by ID
router.get('/:id', getEmployeeById);

// PUT /api/employee/:id - Update an employee by ID
router.put('/:id', updateEmployee);

// DELETE /api/employee/:id - Delete an employee by ID
router.delete('/:id', deleteEmployee);

export const employeeRoutes = router;
