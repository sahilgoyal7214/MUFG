/**
 * Graph Insights Routes
 * Handles graph analysis API endpoints
 * 
 * @swagger
 * tags:
 *   - name: Graph Insights
 *     description: AI-powered graph analysis using LLaVa
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     GraphAnalysisRequest:
 *       type: object
 *       required:
 *         - base64Image
 *       properties:
 *         base64Image:
 *           type: string
 *           format: base64
 *           description: Base64 encoded image data
 *     
 *     GraphAnalysisResponse:
 *       type: object
 *       properties:
 *         analysis:
 *           type: string
 *           description: AI-generated analysis of the graph
 */

import express from 'express';
import { GraphInsightsController } from '../controllers/GraphInsightsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/roles.js';

const router = express.Router();

// Apply authentication to all graph insights routes
router.use(authenticate);

/**
 * @swagger
 * /api/graph-insights/analyze:
 *   post:
 *     summary: Analyze graph using LLaVa
 *     description: Process a graph image and get AI-powered insights using LLaVa model
 *     tags: [Graph Insights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [base64Image]
 *             properties:
 *               base64Image:
 *                 type: string
 *                 description: Base64 encoded image of the graph
 *     responses:
 *       200:
 *         description: Graph analysis completed successfully
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
 *                     analysis:
 *                       type: string
 *                       description: AI-generated analysis of the graph
 */
router.post('/analyze',
  authorize([PERMISSIONS.AI_INSIGHTS_PERSONAL]),
  GraphInsightsController.analyzeGraph
);

export default router;
