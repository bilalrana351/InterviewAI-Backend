import { Request, Response } from 'express';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { asyncErrorHandler } from '../middlewares/error-handling.middleware';
import { Candidate } from '../models/Candidate';
import mongoose from 'mongoose';

interface SupabaseAuthUser {
  id: string;
  email: string;
  record: {
    email: string;
    raw_user_meta_data: {
      role?: 'candidate' | 'interviewer';
      name?: string;
    };
  };
}

/**
 * Create a new user from Supabase auth.users
 */
export const createUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const authUser = req.body as SupabaseAuthUser;
  
  console.log('Incoming user data: ', authUser);


  if (!authUser?.record?.email) {
    return res.status(400).json({
      message: 'Email is required in payload'
    });
  }
  
  const { record } = authUser;

  // Default to 'candidate' if role is not present in meta data
  const email = record.email

  // Get the name from the meta data
  const name = record?.raw_user_meta_data?.name || 'Unknown';

  const role = record?.raw_user_meta_data?.role || 'candidate';

  console.log("The user should have the role of: ", role);

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      console.log("Creating the user");
      // Create the user
      const user = await new User({
        email: email.toLowerCase(),
        name
      }).save({ session });

      console.log("Created the user");

      console.log("Now creating the admin or candidate, the current role is: ", role);

      if (role === 'interviewer') {
        await new Admin({
          user: user._id
        }).save({ session });
      } else if (role === 'candidate') {
        console.log("Creating the candidate");
        await new Candidate({
          user: user._id
        }).save({ session });
      } else {
        console.log("Invalid role");
        throw new Error('Invalid role');
      }
    });

    return res.status(201).json({
      message: 'User created successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating user' + error
    });
  }
});

/**
 * Get user by email
 */
export const getUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  return res.status(200).json({
    status: 'success',
  });
}); 