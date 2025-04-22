import { Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest } from '../types/Requests';
import { User } from '../models/User';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Authentication middleware to verify bearer token
 */
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get user data from request body
    const userData = req.body?.email;
    
    if (!userData) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_USER_DATA',
        message: 'User data is required in request body'
      });
    }
    
    // Extract email from user data
    const email = userData;
    
    if (!email) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_EMAIL',
        message: 'Email is required in user data'
      });
    }
    
    console.log("User email:", email);
    
    // Check if user exists in the database
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'No user found with the provided email address'
      });
    }

    // Attach user data to request for use in controllers
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred during authentication'
    });
  }
};

// // Optional middleware for routes that can be accessed with or without authentication
// export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader) {
//       // Continue without authentication
//       return next();
//     }
    
//     const parts = authHeader.split(' ');
//     if (parts.length !== 2 || parts[0] !== 'Bearer') {
//       // Continue without authentication
//       return next();
//     }
    
//     const token = parts[1];
    
//     if (!token) {
//       // Continue without authentication
//       return next();
//     }
    
//     // Verify the JWT token
//     const { data: user, error } = await supabase.auth.getUser(token);
    
//     if (!error && user) {
//       // Attach user to request
//       req.user = user;
//     }
    
//     // Continue regardless of authentication result
//     next();
//   } catch (error) {
//     // Continue without authentication in case of error
//     console.error('Optional authentication error:', error);
//     next();
//   }
// };
