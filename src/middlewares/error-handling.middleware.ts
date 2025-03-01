import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger } from '../utils/custom-logger';
import { RequestTracker } from '../utils/request-tracker';

// Create a logger instance for errors
const errorLogger = new CustomLogger('Error');
const requestTracker = RequestTracker.getInstance();

/**
 * Global error handling middleware
 * This should be registered after all routes
 */
export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Get the requestId from the request object or generate a new one
  const requestId = (req as any).requestId || uuidv4();
  
  // Get or create request tracking data
  let request = requestTracker.getRequest(requestId);
  if (!request) {
    requestTracker.trackRequest(requestId, {
      method: req.method,
      url: req.originalUrl,
      startTime: Date.now(),
      logs: [],
      completed: false
    });
    request = requestTracker.getRequest(requestId);
  }
  
  // Update request with error
  if (request) {
    request.error = err;
    request.statusCode = res.statusCode || 500;
  }
  
  // Log the error
  errorLogger.error({
    message: `Request Error`,
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode || 500,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });
  
  // Send error response to client
  res.status(res.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : {
      name: err.name,
      stack: err.stack
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

/**
 * Middleware to catch unhandled errors in async routes
 * Wraps an async route handler to properly catch and forward errors to the error middleware
 */
export const asyncErrorHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};