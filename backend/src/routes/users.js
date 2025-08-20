/**
 * User Management Routes
 * Handles user management endpoints
 * 
 * @swagger
 * tags:
 *   - name: Users
 *     description: User account management and profile operations
 */

import express from 'express';
import { authenticateTest as authenticate, authorize } from '../middleware/auth-test.js';
import { PERMISSIONS } from '../config/roles.js';
import { User } from '../models/User.js';
import { AuditService } from '../services/AuditService.js';

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users list
 *     description: Retrieve users based on role permissions - Regulators see all users, Advisors see assigned clients
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', 
  authorize([PERMISSIONS.USER_READ_ALL, PERMISSIONS.USER_READ_ASSIGNED]),
  async (req, res) => {
    try {
      const user = req.user;
      let users = [];

      // Regulators can see all users
      if (user.permissions?.includes(PERMISSIONS.USER_READ_ALL)) {
        users = await User.findAll();
      } 
      // Advisors can see assigned clients (TODO: implement assignment logic)
      else if (user.permissions?.includes(PERMISSIONS.USER_READ_ASSIGNED)) {
        users = await User.findByAdvisor(user.id);
      }
      // Members can only see themselves
      else {
        users = [await User.findById(user.id)].filter(Boolean);
      }

      // Log the access for audit
      await AuditService.logDataAccess({
        userId: user.id,
        action: 'VIEW_USERS_LIST',
        targetUserId: null,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: users.map(u => u.toPublicJSON()),
        total: users.length,
        message: 'Users retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch users',
          status: 500
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve specific user information by user ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID to retrieve
 *         schema:
 *           type: string
 *           example: "USR001"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:userId', 
  authorize([PERMISSIONS.USER_READ]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUser = req.user;

      // Check if user can access this user's data
      if (requestingUser.id !== userId && 
          !requestingUser.permissions?.includes(PERMISSIONS.USER_READ_ALL)) {
        return res.status(403).json({
          error: {
            message: 'Access denied: Can only access your own profile',
            status: 403
          }
        });
      }

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            status: 404
          }
        });
      }

      // Log the access for audit
      await AuditService.logDataAccess({
        userId: requestingUser.id,
        action: 'VIEW_USER_DETAILS',
        targetUserId: userId,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: user.toPublicJSON(),
        message: 'User details retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch user details',
          status: 500
        }
      });
    }
  }
);

/**
 * PUT /api/users/:userId
 * Update user
 */
router.put('/:userId', 
  authorize([PERMISSIONS.USER_UPDATE]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const requestingUser = req.user;

      // Check if user can update this user's data
      if (requestingUser.id !== userId && 
          !requestingUser.permissions?.includes(PERMISSIONS.USER_UPDATE_ALL)) {
        return res.status(403).json({
          error: {
            message: 'Access denied: Can only update your own profile',
            status: 403
          }
        });
      }

      // Validate user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            status: 404
          }
        });
      }

      // Update user data
      const updatedUser = await User.update(userId, updateData);

      // Log the update for audit
      await AuditService.logDataAccess({
        userId: requestingUser.id,
        action: 'UPDATE_USER',
        targetUserId: userId,
        metadata: { updatedFields: Object.keys(updateData) },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: updatedUser.toPublicJSON(),
        message: 'User updated successfully'
      });

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: {
          message: 'Failed to update user',
          status: 500
        }
      });
    }
  }
);

export default router;
