/**
 * Member Data Routes
 * Handles member pension data API endpoints
 * 
 * @swagger
 * tags:
 *   - name: Members
 *     description: Member pension data management and KPI calculations
 */

import express from 'express';
import { MemberDataController } from '../controllers/MemberDataController.js';
import { authenticateTest as authenticate, authorize, memberDataAccess } from '../middleware/auth-test.js';
import { PERMISSIONS } from '../config/roles.js';

const router = express.Router();

// Apply authentication to all member data routes
router.use(authenticate);

/**
 * @swagger
 * /api/members/{memberId}:
 *   get:
 *     summary: Get member data by ID
 *     description: Retrieve comprehensive pension data for a specific member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Unique member identifier
 *         schema:
 *           type: string
 *           example: "M001"
 *     responses:
 *       200:
 *         description: Member data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PensionData'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied to member data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update member data
 *     description: Update pension data for a specific member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Unique member identifier
 *         schema:
 *           type: string
 *           example: "M001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PensionData'
 *     responses:
 *       200:
 *         description: Member data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PensionData'
 */
router.get('/:memberId', 
  memberDataAccess,
  MemberDataController.getMemberData
);

/**
 * PUT /api/members/:memberId
 * Update member data
 */
router.put('/:memberId', 
  authorize([PERMISSIONS.MEMBER_DATA_UPDATE]),
  MemberDataController.updateMemberData
);

/**
 * @swagger
 * /api/members/{memberId}/contributions:
 *   get:
 *     summary: Get member contribution history
 *     description: Retrieve detailed contribution history for a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Unique member identifier
 *         schema:
 *           type: string
 *           example: "M001"
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Contribution history retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                         enum: [EMPLOYEE, EMPLOYER, VOLUNTARY]
 */
router.get('/:memberId/contributions', 
  memberDataAccess,
  MemberDataController.getContributionHistory
);

/**
 * @swagger
 * /api/members/{memberId}/projections:
 *   get:
 *     summary: Get member retirement projections
 *     description: Calculate and retrieve retirement projections for a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Unique member identifier
 *         schema:
 *           type: string
 *           example: "M001"
 *       - in: query
 *         name: scenario
 *         description: Projection scenario
 *         schema:
 *           type: string
 *           enum: [conservative, moderate, aggressive]
 *           default: moderate
 *     responses:
 *       200:
 *         description: Retirement projections calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentBalance:
 *                       type: number
 *                     projectedBalance:
 *                       type: number
 *                     monthlyIncome:
 *                       type: number
 *                     yearlyGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                           balance:
 *                             type: number
 */
router.get('/:memberId/projections', 
  memberDataAccess,
  MemberDataController.getProjections
);

/**
 * @swagger
 * /api/members/{memberId}/dashboard:
 *   get:
 *     summary: Get member dashboard data
 *     description: Retrieve comprehensive dashboard data for a member including KPIs and summaries
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Unique member identifier
 *         schema:
 *           type: string
 *           example: "M001"
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     memberInfo:
 *                       $ref: '#/components/schemas/PensionData'
 *                     kpis:
 *                       $ref: '#/components/schemas/KpiCalculation'
 *                     recentContributions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     projections:
 *                       type: object
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:memberId/dashboard', 
  memberDataAccess,
  MemberDataController.getDashboardData
);

export default router;
