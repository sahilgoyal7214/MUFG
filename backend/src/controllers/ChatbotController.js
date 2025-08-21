/**
 * Chatbot Controller
 * Handles chatbot interactions and AI-powered responses for pension insights
 */

import { MemberData } from '../models/MemberData.js';
import { ChatbotService } from '../services/ChatbotService.js';
import { AuditService } from '../services/AuditService.js';

export class ChatbotController {
  /**
   * Process chatbot message
   */
  static async processMessage(req, res) {
    try {
      const { message, context, memberId } = req.body;
      const user = req.user;

      // Validate input
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: {
            message: 'Message is required',
            status: 400
          }
        });
      }

      // Get member data if memberId is provided and user has access
      let memberData = null;
      if (memberId) {
        // Check if user can access this member's data
        if (user.memberId !== memberId && !user.permissions.includes('member_data:read:all')) {
          return res.status(403).json({
            error: {
              message: 'Access denied to member data',
              status: 403
            }
          });
        }
        
        memberData = await MemberData.findByMemberId(memberId);
      }

      // Get the appropriate data context based on user role
      let dataContext;
      if (user.permissions.includes('advisor')) {
        // For advisors, get aggregated data for all members
        dataContext = await MemberData.getAggregatedData();
      } else {
        // For regular members, get their full individual data
        dataContext = memberData;
      }

      // Process the message through the chatbot service
      const response = await ChatbotService.processMessage({
        message,
        context,
        user,
        memberData: dataContext,
        isAdvisor: user.permissions.includes('advisor')
      });

      // Log the interaction for audit purposes
      await AuditService.logChatbotInteraction({
        userId: user.id,
        memberId,
        message,
        response: response.message,
        intent: response.intent,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          message: response.message,
          intent: response.intent,
          suggestions: response.suggestions || [],
          data: response.data,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Chatbot processing error:', error);
      res.status(500).json({
        error: {
          message: 'Failed to process chatbot message',
          status: 500
        }
      });
    }
  }

  /**
   * Get chatbot conversation history
   */
  static async getConversationHistory(req, res) {
    try {
      const { memberId, limit = 50, offset = 0 } = req.query;
      const user = req.user;

      const history = await ChatbotService.getConversationHistory({
        userId: user.id,
        memberId,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('Error fetching conversation history:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch conversation history',
          status: 500
        }
      });
    }
  }

  /**
   * Get available chatbot intents and capabilities
   */
  static async getCapabilities(req, res) {
    try {
      const capabilities = await ChatbotService.getCapabilities();
      
      res.json({
        success: true,
        data: capabilities
      });

    } catch (error) {
      console.error('Error fetching chatbot capabilities:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch capabilities',
          status: 500
        }
      });
    }
  }

  /**
   * Clear conversation history
   */
  static async clearHistory(req, res) {
    try {
      const { memberId } = req.body;
      const user = req.user;

      await ChatbotService.clearConversationHistory({
        userId: user.id,
        memberId
      });

      res.json({
        success: true,
        message: 'Conversation history cleared'
      });

    } catch (error) {
      console.error('Error clearing conversation history:', error);
      res.status(500).json({
        error: {
          message: 'Failed to clear conversation history',
          status: 500
        }
      });
    }
  }
}
