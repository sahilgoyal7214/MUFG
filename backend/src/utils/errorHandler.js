/**
 * Error Handling Utilities
 * Provides consistent error responses and logging
 */

import { AuditService } from '../services/AuditService.js';

/**
 * Standard error response format
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

/**
 * Error response handler
 */
export const handleError = async (error, req, res, context = {}) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  // Log error for audit
  try {
    await AuditService.logSystemEvent({
      event: 'API_ERROR',
      description: message,
      severity: statusCode >= 500 ? 'ERROR' : 'WARNING',
      metadata: {
        requestId: req.requestId,
        url: req.originalUrl,
        method: req.method,
        statusCode,
        userId: req.user?.id,
        stack: error.stack,
        context
      }
    });
  } catch (auditError) {
    console.error('Failed to log error audit:', auditError);
  }

  // Send response
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      code: error.code,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Validation error handler
 */
export const handleValidationError = (errors, req, res) => {
  const error = new APIError('Validation failed', 400, 'VALIDATION_ERROR');
  error.details = errors;
  
  return handleError(error, req, res, { validationErrors: errors });
};

/**
 * Authorization error handler
 */
export const handleAuthError = (message = 'Authentication required', req, res) => {
  const error = new APIError(message, 401, 'AUTH_ERROR');
  return handleError(error, req, res);
};

/**
 * Permission error handler
 */
export const handlePermissionError = (required, req, res) => {
  const error = new APIError('Insufficient permissions', 403, 'PERMISSION_ERROR');
  return handleError(error, req, res, { requiredPermissions: required });
};

/**
 * Not found error handler
 */
export const handleNotFoundError = (resource, req, res) => {
  const error = new APIError(`${resource} not found`, 404, 'NOT_FOUND');
  return handleError(error, req, res, { resource });
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error, req, res) => {
  console.error('Database error:', error);
  
  let message = 'Database operation failed';
  let statusCode = 500;
  
  // Handle specific database errors
  if (error.code === '23505') { // PostgreSQL unique violation
    message = 'Record already exists';
    statusCode = 409;
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    message = 'Referenced record not found';
    statusCode = 400;
  } else if (error.code === 'ECONNREFUSED') {
    message = 'Database connection failed';
    statusCode = 503;
  }
  
  const apiError = new APIError(message, statusCode, 'DATABASE_ERROR');
  return handleError(apiError, req, res, { 
    originalError: error.code,
    constraint: error.constraint 
  });
};

/**
 * External service error handler
 */
export const handleServiceError = (serviceName, error, req, res) => {
  console.error(`${serviceName} service error:`, error);
  
  const apiError = new APIError(
    `${serviceName} service temporarily unavailable`, 
    503, 
    'SERVICE_ERROR'
  );
  
  return handleError(apiError, req, res, { 
    service: serviceName,
    originalError: error.message 
  });
};

/**
 * Async route wrapper to catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Rate limit error handler
 */
export const handleRateLimitError = (req, res) => {
  const error = new APIError('Too many requests', 429, 'RATE_LIMIT');
  return handleError(error, req, res);
};
