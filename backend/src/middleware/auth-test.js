/**
 * Test Authentication Middleware
 * Allows a fixed test token for comprehensive testing
 * TODO: Remove this after testing is complete
 */

import { extractUserFromToken } from '../config/nextauth.js';
import { hasPermission } from '../config/roles.js';
import { AuditService } from '../services/AuditService.js';

// FIXED TEST TOKEN - Remove after testing
const FIXED_TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJURVNUMDAxIiwiZW1haWwiOiJ0ZXN0QG11ZmcuY29tIiwicm9sZSI6InJlZ3VsYXRvciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJtZW1iZXJJZCI6IlRFU1QwMDEiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyOnJlYWQ6YWxsIiwiYW5hbHl0aWNzOnJlYWQiLCJhbmFseXRpY3M6dmlldzphbGwiLCJhbmFseXRpY3M6dmlldzpvd24iLCJhbmFseXRpY3M6dmlldzphc3NpZ25lZCIsImFuYWx5dGljczpleHBvcnQiLCJhdWRpdDpsb2dzIiwibWVtYmVyX2RhdGE6cmVhZDphbGwiLCJtZW1iZXJfZGF0YTpjcmVhdGUiLCJtZW1iZXJfZGF0YTp1cGRhdGUiLCJtZW1iZXJfZGF0YTpkZWxldGUiLCJjaGF0Ym90OmFjY2VzcyIsInJlZ3VsYXRvcnk6b3ZlcnNpZ2h0IiwiY29tcGxpYW5jZTptb25pdG9yaW5nIiwiY29tcGxpYW5jZTpyZXBvcnRzIl0sImlhdCI6MTc1NTUxMjUyMCwiZXhwIjoxNzg3MDQ4NTIwLCJpc3MiOiJtdWZnLXBlbnNpb24taW5zaWdodHMiLCJhdWQiOiJtdWZnLWFwaSJ9.b6WGVaUMETbPoaaDcFDEcCiwLWGcMGcsOO2OPbQHZD0";

const FIXED_TEST_USER = {
  id: 'TEST001',
  email: 'test@mufg.com',
  name: 'Test User',
  role: 'regulator', // Use lowercase as defined in ROLES constant
  memberId: 'TEST001',
  permissions: [
    'user:read:all',
    'analytics:read', 
    'analytics:view:all',
    'analytics:view:own',
    'analytics:view:assigned',
    'analytics:export',
    'audit:logs',
    'member_data:read:all',
    'member_data:create',
    'member_data:update', 
    'member_data:delete',
    'chatbot:access',
    'regulatory:oversight',
    'compliance:monitoring',
    'compliance:reports'
  ]
};

/**
 * Test-specific authenticate middleware that allows fixed test token
 */
export const authenticateTest = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ [TEST AUTH] No token provided');
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

    // Check if it's the fixed test token
    if (token === FIXED_TEST_TOKEN) {
      console.log('✅ [TEST AUTH] Fixed test token accepted');
      req.user = FIXED_TEST_USER;
      
      await AuditService.logAuth({
        userId: FIXED_TEST_USER.id,
        action: 'TEST_TOKEN_VERIFIED',
        success: true,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      
      return next();
    }

    // For other tokens, use normal verification
    console.log('🔍 [TEST AUTH] Verifying regular token...');
    const user = await extractUserFromToken(token);
    req.user = user;
    
    await AuditService.logAuth({
      userId: user.id,
      action: 'TOKEN_VERIFIED',
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    
    console.log('✅ [TEST AUTH] Regular token verified');
    next();
  } catch (error) {
    console.log('❌ [TEST AUTH] Authentication failed:', error.message);
    
    try {
      await AuditService.logAuth({
        userId: null,
        action: 'FAILED_AUTH_INVALID_TOKEN',
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    } catch (auditError) {
      console.log('❌ [TEST AUTH] Audit logging failed:', auditError.message);
    }
    
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

    console.log('🔍 [AUTH DEBUG] User role:', req.user.role);
    console.log('🔍 [AUTH DEBUG] Required permissions:', requiredPermissions);
    console.log('🔍 [AUTH DEBUG] User permissions:', req.user.permissions);

    const userRole = req.user.role;
    const userPermissions = req.user.permissions || [];
    
    const hasRequiredPermissions = requiredPermissions.every(permission => {
      // Check direct user permissions first (for test users)
      const hasDirectPermission = userPermissions.includes(permission);
      // Check role-based permissions as fallback
      const hasRolePermission = hasPermission(userRole, permission);
      const hasIt = hasDirectPermission || hasRolePermission;
      
      console.log(`🔍 [AUTH DEBUG] Checking permission "${permission}": direct=${hasDirectPermission}, role=${hasRolePermission}, result=${hasIt}`);
      return hasIt;
    });

    console.log('🔍 [AUTH DEBUG] Has all required permissions:', hasRequiredPermissions);

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
