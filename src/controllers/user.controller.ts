import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncErrorHandler } from '../middlewares/error-handling.middleware';

/**
 * Create a new user
 */
export const createUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email, role } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required'
    });
  }

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
    role: role || 'candidate' // Default role if not provided
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