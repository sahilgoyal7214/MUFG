/**
 * Response Utilities
 * Provides consistent API response formats
 */

/**
 * Success response format
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200, meta = {}) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  // Add pagination metadata if provided
  if (meta.pagination) {
    response.pagination = meta.pagination;
  }

  // Add any additional metadata
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 */
export const createdResponse = (res, data, message = 'Created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 */
export const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Paginated response
 */
export const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return successResponse(res, data, message, 200, { pagination });
};

/**
 * Error response format
 */
export const errorResponse = (res, message, statusCode = 500, code = null, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  };

  if (code) {
    response.error.code = code;
  }

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 */
export const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return errorResponse(res, message, 400, 'VALIDATION_ERROR', errors);
};

/**
 * Not found response
 */
export const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Unauthorized response
 */
export const unauthorizedResponse = (res, message = 'Authentication required') => {
  return errorResponse(res, message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden response
 */
export const forbiddenResponse = (res, message = 'Access denied') => {
  return errorResponse(res, message, 403, 'FORBIDDEN');
};

/**
 * Conflict response
 */
export const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409, 'CONFLICT');
};

/**
 * Internal server error response
 */
export const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500, 'INTERNAL_ERROR');
};

/**
 * Service unavailable response
 */
export const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 503, 'SERVICE_UNAVAILABLE');
};

/**
 * Too many requests response
 */
export const tooManyRequestsResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429, 'TOO_MANY_REQUESTS');
};
