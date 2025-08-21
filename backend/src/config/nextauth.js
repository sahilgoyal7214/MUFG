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
    return jwt.verify(token, nextAuthConfig.secret);
  } catch (error) {
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
  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    memberId: decoded.memberId,
    permissions: decoded.permissions || []
  };
};
