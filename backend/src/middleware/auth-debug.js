/**
 * Authentication Middleware - DEBUG VERSION
 * Handles NextAuth token verification and user authentication
 */

import { extractUserFromToken } from '../config/nextauth.js';
import { hasPermission } from '../config/roles.js';

/**
 * Authenticate user using NextAuth JWT token - DEBUG VERSION
 */
export const authenticateDebug = async (req, res, next) => {
  try {
    console.log('🔍 [DEBUG] Auth middleware called');
    console.log('🔍 [DEBUG] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('🔍 [DEBUG] No token provided');
      return res.status(401).json({
        error: {
          message: 'Access token required',
          status: 401
        }
      });
    }

    console.log('🔍 [DEBUG] Token extracted, length:', token.length);
    console.log('🔍 [DEBUG] Token preview:', token.substring(0, 50) + '...');
    
    console.log('🔍 [DEBUG] Calling extractUserFromToken...');
    const user = await extractUserFromToken(token);
    console.log('🔍 [DEBUG] User extracted successfully:', user.email);
    
    req.user = user;
    
    console.log('🔍 [DEBUG] Authentication successful, calling next()');
    next();
  } catch (error) {
    console.log('🔍 [DEBUG] Authentication failed:', error.message);
    console.log('🔍 [DEBUG] Full error:', error);
    
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        status: 401,
        debug: error.message
      }
    });
  }
};

/**
 * Authorize user based on required permissions
 */
export const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          status: 401
        }
      });
    }

    const userRole = req.user.role;
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasRequiredPermissions) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          status: 403,
          required: requiredPermissions
        }
      });
    }

    next();
  };
};
