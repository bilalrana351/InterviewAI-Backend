import { Request, Response, NextFunction } from 'express';
import { logWarning } from '../utils/logger.util';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logWarning(`Route not found: ${req.method} ${req.originalUrl}`, 'NotFound');
  
  res.status(404).json({
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'Not Found'
  });
}; 