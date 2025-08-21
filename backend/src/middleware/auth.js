/**
 * Authentication Middleware
 * Handles NextAuth token verification and user authentication
 */

import { extractUserFromToken } from '../config/nextauth.js';
import { hasPermission } from '../config/roles.js';
import { AuditService } from '../services/AuditService.js';

/**
 * Authenticate user using NextAuth JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Log failed authentication attempt
      await AuditService.logAuth({
        userId: null,
        action: 'FAILED_AUTH_NO_TOKEN',
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        error: {
          message: 'Access token required',
          status: 401
        }
      });
    }

    const user = await extractUserFromToken(token);
    req.user = user;
    
    // Log successful authentication
    await AuditService.logAuth({
      userId: user.id,
      action: 'TOKEN_VERIFIED',
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    
    next();
  } catch (error) {
    // Log failed authentication attempt
    await AuditService.logAuth({
      userId: null,
      action: 'FAILED_AUTH_INVALID_TOKEN',
      success: false,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        status: 401
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

/**
 * Member data access control
 * Ensures users can only access their own data unless they have admin permissions
 */
export const memberDataAccess = (req, res, next) => {
  const { memberId } = req.params;
  const user = req.user;

  // Super admins and admins can access all member data
  if (hasPermission(user.role, 'member_data:read:all')) {
    return next();
  }

  // Members can only access their own data
  if (user.memberId !== memberId) {
    return res.status(403).json({
      error: {
        message: 'Access denied: Can only access your own data',
        status: 403
      }
    });
  }

  next();
};

/**
 * Rate limiting middleware for chatbot
 */
export const chatbotRateLimit = (req, res, next) => {
  // Implementation for rate limiting chatbot requests
  // This would typically use Redis or in-memory store
  next();
};
