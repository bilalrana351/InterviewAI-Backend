import { Router } from 'express';
import { createUser, getUserByEmail } from '../controllers/user.controller';

const router = Router();
router.post('/', createUser);
router.get('/:email', getUserByEmail);

export const userRoutes = router; 