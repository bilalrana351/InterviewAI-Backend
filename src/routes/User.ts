import { Router } from 'express';
import { createUser, deleteUser, getUser, updateUser } from '../controllers/User';

const router = Router();

router.post('/', createUser);

router.get('/:id', getUser);

router.post('/update', updateUser);

router.delete('/delete', deleteUser);

export const userRoutes = router;