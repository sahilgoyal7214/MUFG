import express from 'express';
import PortfolioOptimizationService from '../services/PortfolioOptimizationService.js';
import MemberSegmentationService from '../services/MemberSegmentationService.js';
import PersonalizedRiskAlertService from '../services/PersonalizedRiskAlertService.js';
import SmartContributionService from '../services/SmartContributionService.js';
import WhatIfSimulatorService from '../services/WhatIfSimulatorService.js';
import { authenticateTest as authenticate } from '../middleware/auth-test.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Apply authentication to all advisor routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Advisor
 *   description: Advanced advisor dashboard services for portfolio optimization, risk management, and member segmentation
 */

/**
 * Portfolio Optimization Routes
 */

/**
 * @swagger
 * /api/advisor/portfolio-optimization/{userId}:
 *   get:
 *     summary: Get portfolio optimization for a member
 *     description: Generate optimal portfolio allocation recommendations for a specific member based on their risk profile and financial goals
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     responses:
 *       200:
 *         description: Portfolio optimization recommendations
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     currentAllocation:
 *                       type: object
 *                     optimizedAllocation:
 *                       type: object
 *                     expectedReturn:
 *                       type: number
 *                     risk:
 *                       type: number
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get portfolio optimization for a member
router.get('/portfolio-optimization/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const optimization = await PortfolioOptimizationService.optimizePortfolio(userId);
    
    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Portfolio optimization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Portfolio optimization failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/portfolio-optimization/bulk:
 *   post:
 *     summary: Get bulk portfolio optimization
 *     description: Generate portfolio optimization recommendations for multiple members or filtered member groups
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of specific user IDs to optimize (optional)
 *               filters:
 *                 type: object
 *                 description: Filter criteria for member selection (optional)
 *                 properties:
 *                   riskTolerance:
 *                     type: string
 *                   ageRange:
 *                     type: object
 *                   portfolioValue:
 *                     type: object
 *     responses:
 *       200:
 *         description: Bulk portfolio optimization results
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
 *                       userId:
 *                         type: string
 *                         pattern: '^[a-zA-Z0-9]+$'
 *                         description: Alphanumeric user identifier
 *                       optimizedAllocation:
 *                         type: object
 *                       expectedReturn:
 *                         type: number
 *                       risk:
 *                         type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get bulk portfolio optimization
router.post('/portfolio-optimization/bulk', [
  body('userIds').optional().isArray().withMessage('User IDs must be an array'),
  body('userIds.*').isInt().withMessage('Each user ID must be an integer'),
  body('filters').optional().isObject().withMessage('Filters must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userIds, filters } = req.body;
    const optimizations = await PortfolioOptimizationService.getBulkOptimizations(userIds, filters);
    
    res.json({
      success: true,
      data: optimizations
    });
  } catch (error) {
    console.error('Bulk portfolio optimization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Bulk portfolio optimization failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/portfolio-rebalancing/{userId}:
 *   get:
 *     summary: Get portfolio rebalancing recommendations
 *     description: Generate specific rebalancing recommendations to align member's portfolio with optimal allocation
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     responses:
 *       200:
 *         description: Portfolio rebalancing recommendations
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     currentAllocation:
 *                       type: object
 *                     targetAllocation:
 *                       type: object
 *                     rebalancingActions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                           assetClass:
 *                             type: string
 *                           amount:
 *                             type: number
 *                     estimatedCost:
 *                       type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Rebalance portfolio recommendations
router.get('/portfolio-rebalancing/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const rebalancing = await PortfolioOptimizationService.generateRebalancingRecommendations(userId);
    
    res.json({
      success: true,
      data: rebalancing
    });
  } catch (error) {
    console.error('Portfolio rebalancing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Portfolio rebalancing failed'
    });
  }
});

/**
 * Member Segmentation Routes
 */

/**
 * @swagger
 * /api/advisor/member-segmentation:
 *   post:
 *     summary: Perform member segmentation analysis
 *     description: Segment members into clusters based on demographics, risk profile, and investment behavior for targeted strategies
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               segmentationType:
 *                 type: string
 *                 enum: [demographic, risk-based, behavior-based, custom]
 *                 default: demographic
 *               filters:
 *                 type: object
 *                 description: Additional filtering criteria
 *               clusterCount:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 10
 *                 default: 5
 *     responses:
 *       200:
 *         description: Member segmentation results
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
 *                     segments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           clusterId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           memberCount:
 *                             type: integer
 *                           characteristics:
 *                             type: object
 *                           averageMetrics:
 *                             type: object
 *                     totalMembers:
 *                       type: integer
 *                     segmentationType:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Perform member segmentation
router.post('/member-segmentation', [
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('clusterCount').optional().isInt({ min: 2, max: 10 }).withMessage('Cluster count must be between 2 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { filters = {}, clusterCount = 4 } = req.body;
    const segmentation = await MemberSegmentationService.performMemberSegmentation(filters, clusterCount);
    
    res.json({
      success: true,
      data: segmentation
    });
  } catch (error) {
    console.error('Member segmentation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Member segmentation failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/member-segmentation/{clusterId}/members:
 *   get:
 *     summary: Get members in a specific cluster
 *     description: Retrieve detailed member information for a specific segmentation cluster
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clusterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cluster ID to retrieve members from
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of members per page
 *     responses:
 *       200:
 *         description: Members in the specified cluster
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
 *                     clusterId:
 *                       type: integer
 *                     clusterName:
 *                       type: string
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             pattern: '^[a-zA-Z0-9]+$'
 *                             description: Alphanumeric user identifier
 *                           name:
 *                             type: string
 *                           age:
 *                             type: integer
 *                           riskTolerance:
 *                             type: string
 *                           portfolioValue:
 *                             type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalMembers:
 *                           type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get members in a specific cluster
router.get('/member-segmentation/:clusterId/members', [
  param('clusterId').isInt().withMessage('Cluster ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clusterId } = req.params;
    
    // Note: This requires the segmentation data to be stored or re-calculated
    // For demonstration, we'll return an error asking for segmentation first
    res.status(400).json({
      success: false,
      message: 'Please run member segmentation first, then use the returned data to get cluster members'
    });
  } catch (error) {
    console.error('Cluster members error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cluster members'
    });
  }
});

/**
 * Risk Alert Routes
 */

/**
 * @swagger
 * /api/advisor/risk-alerts/{userId}:
 *   get:
 *     summary: Generate risk alerts for a member
 *     description: Generate personalized risk alerts and warnings based on member's portfolio and market conditions
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     responses:
 *       200:
 *         description: Risk alerts for the member
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           alertId:
 *                             type: string
 *                           severity:
 *                             type: string
 *                             enum: [low, medium, high, critical]
 *                           category:
 *                             type: string
 *                           message:
 *                             type: string
 *                           recommendations:
 *                             type: array
 *                             items:
 *                               type: string
 *                     riskScore:
 *                       type: number
 *                     lastAssessment:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Generate risk alerts for a member
router.get('/risk-alerts/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const alerts = await PersonalizedRiskAlertService.generateRiskAlerts(userId);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Risk alerts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Risk alert generation failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/risk-alerts/bulk:
 *   post:
 *     summary: Get bulk risk alerts
 *     description: Generate risk alerts for multiple members or filter by risk level
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of specific user IDs (optional)
 *               riskLevel:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *                 description: Filter alerts by minimum risk level
 *     responses:
 *       200:
 *         description: Bulk risk alerts
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
 *                       userId:
 *                         type: string
 *                         pattern: '^[a-zA-Z0-9]+$'
 *                         description: Alphanumeric user identifier
 *                       alerts:
 *                         type: array
 *                       riskScore:
 *                         type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get bulk risk alerts
router.post('/risk-alerts/bulk', [
  body('userIds').optional().isArray().withMessage('User IDs must be an array'),
  body('userIds.*').isInt().withMessage('Each user ID must be an integer'),
  body('riskLevel').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid risk level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userIds, riskLevel } = req.body;
    const bulkAlerts = await PersonalizedRiskAlertService.getBulkRiskAlerts(userIds, riskLevel);
    
    res.json({
      success: true,
      data: bulkAlerts
    });
  } catch (error) {
    console.error('Bulk risk alerts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Bulk risk alert generation failed'
    });
  }
});

/**
 * Smart Contribution Routes
 */

/**
 * @swagger
 * /api/advisor/contribution-recommendations/{userId}:
 *   get:
 *     summary: Generate contribution recommendations for a member
 *     description: Generate personalized contribution recommendations based on member's financial goals and current status
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     responses:
 *       200:
 *         description: Contribution recommendations
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           contributionType:
 *                             type: string
 *                           recommendedAmount:
 *                             type: number
 *                           frequency:
 *                             type: string
 *                           reasoning:
 *                             type: string
 *                     projectedBenefits:
 *                       type: object
 *                     currentContributions:
 *                       type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Generate contribution recommendations for a member
router.get('/contribution-recommendations/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const recommendations = await SmartContributionService.generateContributionRecommendations(userId);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Contribution recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Contribution recommendation generation failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/contribution-recommendations/{userId}/what-if:
 *   post:
 *     summary: Calculate what-if scenarios for contributions
 *     description: Simulate different contribution scenarios to project future retirement outcomes with target achievement analysis
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Member user ID for what-if analysis (alphanumeric)
 *         example: "U1001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contributionChanges:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name for this scenario
 *                       example: "Aggressive Savings"
 *                     newAnnualContribution:
 *                       type: number
 *                       description: New annual contribution amount
 *                       example: 10000
 *                     retirementAgeChange:
 *                       type: integer
 *                       description: Change in retirement age (+ or -)
 *                       example: -2
 *             example:
 *               contributionChanges:
 *                 - name: "Aggressive Savings"
 *                   newAnnualContribution: 10000
 *                 - name: "Early Retirement"
 *                   retirementAgeChange: -2
 *     responses:
 *       200:
 *         description: What-if scenario results with target achievement analysis
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
 *                     userId:
 *                       type: string
 *                       example: "U1001"
 *                     baselineScenario:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Status Quo"
 *                         projectedValue:
 *                           type: number
 *                           example: 1111824
 *                         targetAchievement:
 *                           type: object
 *                           properties:
 *                             targetAmount:
 *                               type: number
 *                               example: 177640
 *                             targetAmountAchievement:
 *                               type: integer
 *                               example: 626
 *                             status:
 *                               type: string
 *                               example: "Exceeds Target"
 *                             gapAnalysis:
 *                               type: object
 *                               properties:
 *                                 amountGap:
 *                                   type: number
 *                                   example: 0
 *                                 payoutGap:
 *                                   type: number
 *                                   example: 5346
 *                     whatIfScenarios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Aggressive Savings"
 *                           results:
 *                             type: object
 *                             properties:
 *                               projectedValue:
 *                                 type: number
 *                                 example: 1344606
 *                               targetAchievement:
 *                                 type: object
 *                                 properties:
 *                                   targetAmountAchievement:
 *                                     type: integer
 *                                     example: 757
 *                                   status:
 *                                     type: string
 *                                     example: "Exceeds Target"
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-20T12:31:09.354Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Calculate what-if scenarios for contributions
router.post('/contribution-recommendations/:userId/what-if', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric'),
  body('contributionChanges').isArray().withMessage('Contribution changes must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { contributionChanges } = req.body;
    
    const whatIfScenarios = await SmartContributionService.calculateWhatIfScenarios(userId, contributionChanges);
    
    res.json({
      success: true,
      data: whatIfScenarios
    });
  } catch (error) {
    console.error('Contribution what-if error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'What-if calculation failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/contribution-recommendations/bulk:
 *   post:
 *     summary: Get bulk contribution recommendations
 *     description: Generate contribution recommendations for multiple members based on filtering criteria
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 description: Filter criteria for member selection
 *                 properties:
 *                   ageRange:
 *                     type: object
 *                   salaryRange:
 *                     type: object
 *                   contributionGap:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Bulk contribution recommendations
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
 *                       userId:
 *                         type: string
 *                         pattern: '^[a-zA-Z0-9]+$'
 *                         description: Alphanumeric user identifier
 *                       recommendations:
 *                         type: array
 *                       projectedBenefits:
 *                         type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get bulk contribution recommendations
router.post('/contribution-recommendations/bulk', [
  body('filters').optional().isObject().withMessage('Filters must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { filters = {} } = req.body;
    const bulkRecommendations = await SmartContributionService.getBulkRecommendations(filters);
    
    res.json({
      success: true,
      data: bulkRecommendations
    });
  } catch (error) {
    console.error('Bulk contribution recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Bulk recommendation generation failed'
    });
  }
});

/**
 * What-If Simulator Routes
 */

/**
 * @swagger
 * /api/advisor/what-if-simulation/{userId}:
 *   post:
 *     summary: Run comprehensive what-if simulation
 *     description: Execute comprehensive retirement planning simulations with customizable parameters
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenarioParameters:
 *                 type: object
 *                 description: Simulation parameters
 *                 properties:
 *                   retirementAge:
 *                     type: integer
 *                   lifeExpectancy:
 *                     type: integer
 *                   expectedReturn:
 *                     type: number
 *                   inflationRate:
 *                     type: number
 *                   salaryGrowth:
 *                     type: number
 *     responses:
 *       200:
 *         description: Simulation results
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     simulationResults:
 *                       type: object
 *                     scenarios:
 *                       type: array
 *                     confidenceIntervals:
 *                       type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Run comprehensive what-if simulation
router.post('/what-if-simulation/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric'),
  body('scenarioParameters').optional().isObject().withMessage('Scenario parameters must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { scenarioParameters = {} } = req.body;
    
    const simulation = await WhatIfSimulatorService.runSimulation(userId, scenarioParameters);
    
    res.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    console.error('What-if simulation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'What-if simulation failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/monte-carlo-simulation/{userId}:
 *   post:
 *     summary: Run Monte Carlo simulation
 *     description: Execute Monte Carlo simulations for retirement planning with statistical analysis
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               simulations:
 *                 type: integer
 *                 minimum: 100
 *                 maximum: 10000
 *                 default: 1000
 *                 description: Number of simulation runs
 *               parameters:
 *                 type: object
 *                 description: Simulation parameters
 *     responses:
 *       200:
 *         description: Monte Carlo simulation results
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     simulationCount:
 *                       type: integer
 *                     results:
 *                       type: object
 *                       properties:
 *                         probabilityOfSuccess:
 *                           type: number
 *                         medianOutcome:
 *                           type: number
 *                         percentiles:
 *                           type: object
 *                         worstCase:
 *                           type: number
 *                         bestCase:
 *                           type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Run Monte Carlo simulation
router.post('/monte-carlo-simulation/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric'),
  body('simulations').optional().isInt({ min: 100, max: 10000 }).withMessage('Simulations must be between 100 and 10000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { simulations = 1000 } = req.body;
    
    const monteCarloResults = await WhatIfSimulatorService.runMonteCarloSimulation(userId, simulations);
    
    res.json({
      success: true,
      data: monteCarloResults
    });
  } catch (error) {
    console.error('Monte Carlo simulation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Monte Carlo simulation failed'
    });
  }
});

/**
 * Comprehensive Dashboard Data
 */

/**
 * @swagger
 * /api/advisor/dashboard/{userId}:
 *   get:
 *     summary: Get comprehensive advisor dashboard data
 *     description: Retrieve complete advisor dashboard with portfolio optimization, risk alerts, and recommendations
 *     tags: [Advisor]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         description: Alphanumeric member user identifier
 *     responses:
 *       200:
 *         description: Complete advisor dashboard data
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
 *                     userId:
 *                       type: string
 *                       pattern: '^[a-zA-Z0-9]+$'
 *                       description: Alphanumeric user identifier
 *                     portfolioOptimization:
 *                       type: object
 *                       description: Portfolio optimization recommendations
 *                     riskAlerts:
 *                       type: object
 *                       description: Current risk alerts and warnings
 *                     contributionRecommendations:
 *                       type: object
 *                       description: Contribution optimization suggestions
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAlerts:
 *                           type: integer
 *                         riskScore:
 *                           type: number
 *                         optimizationPotential:
 *                           type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get all advisor dashboard data for a member
router.get('/dashboard/:userId', [
  param('userId').matches(/^[a-zA-Z0-9]+$/).withMessage('User ID must be alphanumeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    
    // Parallel execution for better performance
    const [
      portfolioOptimization,
      riskAlerts,
      contributionRecommendations
    ] = await Promise.all([
      PortfolioOptimizationService.optimizePortfolio(userId).catch(error => ({ error: error.message })),
      PersonalizedRiskAlertService.generateRiskAlerts(userId).catch(error => ({ error: error.message })),
      SmartContributionService.generateContributionRecommendations(userId).catch(error => ({ error: error.message }))
    ]);
    
    res.json({
      success: true,
      data: {
        userId,
        portfolioOptimization,
        riskAlerts,
        contributionRecommendations,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Dashboard data generation failed'
    });
  }
});

/**
 * @swagger
 * /api/advisor/health:
 *   get:
 *     summary: Advisor service health check
 *     description: Check the health and availability of all advisor services
 *     tags: [Advisor]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Advisor services are running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   description: Individual service status (when detailed)
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Advisor services are running',
    timestamp: new Date().toISOString()
  });
});

export default router;
