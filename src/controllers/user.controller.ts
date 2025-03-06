import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncErrorHandler } from '../middlewares/error-handling.middleware';

interface SupabaseAuthUser {
  id: string;
  email: string;
  record: {
    email: string;
    raw_user_meta_data: {
      role?: 'candidate' | 'interviewer';
    };
  };
}

/**
 * Create a new user from Supabase auth.users
 */
export const createUser = asyncErrorHandler(async (req: Request, res: Response) => {
  console.log('I am in the create user controller build for supabase');
  const authUser = req.body as SupabaseAuthUser;
  console.log('I am here for the authUser', authUser);
  // Validate webhook data
  if (!authUser?.record?.email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required in payload'
    });
  }
  const { email, record } = authUser;
  // Default to 'candidate' if role is not present in meta data
  const role = record?.raw_user_meta_data?.role || 'candidate';

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      status: 'error',
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const user = new User({
    email: email.toLowerCase(),
    role
  });

  await user.save();

  return res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Get user by email
 */
export const getUserByEmail = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email } = req.params;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  return res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }
  });
}); 