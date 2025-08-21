/**
 * Authentication Routes for NextAuth Integration
 * 
 * Important: This backend does NOT handle login/registration.
 * All authentication is handled by NextAuth on the frontend.
 * 
 * These routes are for:
 * - Token verification
 * - User session management  
 * - Auth status checking
 * 
 * Frontend should:
 * - Use NextAuth for login/register/logout
 * - Send JWT token in Authorization header: "Bearer <token>"
 * - Call /api/auth/verify to validate tokens
 * - Call /api/auth/me to get user data
 * 
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: JWT token verification and user session management
 */

import express from 'express';
import { authenticateTest as authenticate } from '../middleware/auth-test.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     description: Validates the JWT token provided by NextAuth and returns user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Token is valid'
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns detailed user information based on the authenticated JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

/**
 * POST /api/auth/refresh
 * Endpoint for frontend to check auth status
 * Can be used to refresh user data without generating new tokens
 */
router.post('/refresh', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Session refreshed'
  });
});

export default router;
