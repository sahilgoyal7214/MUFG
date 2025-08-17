/**
 * Chatbot Routes
 * Handles chatbot API endpoints
 * 
 * @swagger
 * tags:
 *   - name: Chatbot
 *     description: AI-powered chatbot for pension guidance and insights
 */

import express from 'express';
import { ChatbotController } from '../controllers/ChatbotController.js';
import { authenticate, authorize, chatbotRateLimit } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/roles.js';

const router = express.Router();

// Apply authentication and rate limiting to all chatbot routes
router.use(authenticate);
router.use(chatbotRateLimit);

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Send message to chatbot
 *     description: Process user message and get AI-powered response for pension guidance. Uses local LLM for enhanced responses when available, with intelligent fallback for structured queries.
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's question or message
 *                 example: "How much should I contribute to my pension?"
 *               context:
 *                 type: object
 *                 description: Optional conversation context
 *     responses:
 *       200:
 *         description: Chatbot response generated successfully
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
 *                     response:
 *                       type: string
 *                       example: "Based on your current salary, I recommend contributing 15-20% to your pension..."
 *                     intent:
 *                       type: string
 *                       example: "contribution_info"
 *                     source:
 *                       type: string
 *                       enum: [local_llm, llm_enhanced, standard, fallback]
 *                       description: Response generation source
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Check balance", "View projections"]
 *                     messageId:
 *                       type: string
 *                       example: "msg_123456"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/message', 
  authorize([PERMISSIONS.CHATBOT_ACCESS]),
  ChatbotController.processMessage
);

/**
 * GET /api/chatbot/history
 * Get conversation history
 */
router.get('/history', 
  authorize([PERMISSIONS.CHATBOT_ACCESS]),
  ChatbotController.getConversationHistory
);

/**
 * GET /api/chatbot/capabilities
 * Get chatbot capabilities
 */
router.get('/capabilities', 
  authorize([PERMISSIONS.CHATBOT_ACCESS]),
  ChatbotController.getCapabilities
);

/**
 * DELETE /api/chatbot/history
 * Clear conversation history
 */
router.delete('/history', 
  authorize([PERMISSIONS.CHATBOT_ACCESS]),
  ChatbotController.clearHistory
);

export default router;
