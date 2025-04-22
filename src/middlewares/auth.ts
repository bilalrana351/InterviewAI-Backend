import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest } from '../types/Requests';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Authentication middleware to verify bearer token
 */
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }
    
    // Check if it's a bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Authorization header must be in format: Bearer token' });
    }
    
    const token = parts[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }
    
    // Verify the JWT token with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Attach the user to the request
    req.user = user;
    
    // Continue to the route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Optional middleware for routes that can be accessed with or without authentication
export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Continue without authentication
      return next();
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Continue without authentication
      return next();
    }
    
    const token = parts[1];
    
    if (!token) {
      // Continue without authentication
      return next();
    }
    
    // Verify the JWT token
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      // Attach user to request
      req.user = user;
    }
    
    // Continue regardless of authentication result
    next();
  } catch (error) {
    // Continue without authentication in case of error
    console.error('Optional authentication error:', error);
    next();
  }
};
