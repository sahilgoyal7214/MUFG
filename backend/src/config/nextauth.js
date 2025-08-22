/**
 * NextAuth Integration Configuration
 * 
 * This backend service integrates with NextAuth running on the frontend.
 * Authentication (login/register) is handled by NextAuth on the frontend.
 * This backend only verifies JWT tokens issued by NextAuth.
 * 
 * Frontend NextAuth should be configured with:
 * - JWT strategy enabled
 * - Same NEXTAUTH_SECRET environment variable
 * - Token sent in Authorization header as "Bearer <token>"
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getRolePermissions } from './roles.js';

// Load environment variables
dotenv.config();

export const nextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

/**
 * Verify NextAuth JWT token
 * @param {string} token - JWT token from NextAuth
 * @returns {object} Decoded token payload
 */
export const verifyNextAuthToken = async (token) => {
  try {
    console.log('🔍 DEBUG: Verifying token with secret:', nextAuthConfig.secret?.substring(0, 20) + '...');
    console.log('🔍 DEBUG: Secret length:', nextAuthConfig.secret?.length);
    console.log('🔍 DEBUG: Token to verify:', token?.substring(0, 50) + '...');
    console.log('🔍 DEBUG: Token length:', token?.length);
    console.log('🔍 DEBUG: Token parts:', token?.split('.').length);
    
    const decoded = jwt.verify(token, nextAuthConfig.secret);
    console.log('🔍 DEBUG: Token verified successfully:', JSON.stringify(decoded, null, 2));
    return decoded;
  } catch (error) {
    console.log('🔍 DEBUG: Token verification failed:', error.message);
    console.log('🔍 DEBUG: Full error:', error);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Extract user info from NextAuth token
 * @param {string} token - JWT token
 * @returns {object} User information
 */
export const extractUserFromToken = async (token) => {
  const decoded = await verifyNextAuthToken(token);
  
  // Normalize role to lowercase to match ROLES constants
  const userRole = (decoded.role || 'member').toLowerCase();
  
  // Get permissions from backend role config or from token
  const userPermissions = decoded.permissions || getRolePermissions(userRole);
  
  // Map frontend user IDs to backend pension data user IDs for testing
  // This allows frontend login users to access existing pension data
  const pensionDataUserIdMap = {
    'M001': 'U1499',     // Member 1 maps to pension data user U1499
    'MEM001': 'U1499',   // Alternative member ID
    'member1': 'U1499',  // Username-based mapping
    'ADV001': 'ADV001',  // Advisor keeps same ID
    'REG001': 'REG001',  // Regulator keeps same ID
  };
  
  // Use mapped user ID for pension data access, fallback to original ID
  const mappedUserId = pensionDataUserIdMap[decoded.sub] || decoded.sub;
  
  return {
    id: mappedUserId,  // Use mapped ID for backend data access
    originalId: decoded.sub,  // Keep original ID for reference
    email: decoded.email,
    name: decoded.name,
    username: decoded.username,
    role: userRole,
    roleData: decoded.roleData,
    memberId: decoded.memberId || mappedUserId,
    permissions: userPermissions
  };
};
