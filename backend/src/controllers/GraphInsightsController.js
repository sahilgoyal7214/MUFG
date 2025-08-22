/**
 * Graph Insights Controller
 * Handles requests for graph analysis using LLaVa
 */

import { GraphInsightsService } from '../services/GraphInsightsService.js';
import { AuditService } from '../services/AuditService.js';

export class GraphInsightsController {
  /**
   * Analyze graph and return insights
   */
  static async analyzeGraph(req, res) {
    console.log('🎯 GraphInsightsController.analyzeGraph called');
    console.log('📝 Request body keys:', Object.keys(req.body));
    console.log('👤 User:', req.user?.id, req.user?.role);
    
    try {
      const { base64Image, context, graphType } = req.body;
      const user = req.user;

      console.log('🖼️ Base64 image length:', base64Image?.length || 0);
      console.log('📊 Graph type:', graphType);
      console.log('🔍 Context:', context);

      // Validate input
      if (!base64Image) {
        console.log('❌ No base64Image provided');
        return res.status(400).json({
          error: {
            message: 'Graph image is required',
            status: 400
          }
        });
      }

      // Remove data URL prefix if present
      const cleanBase64Image = base64Image.replace(/^data:image\/\w+;base64,/, '');

      // Add user context to the analysis request
      const analysisContext = {
        ...context,
        type: graphType || 'general',
        userRole: user.role,
        permissions: user.permissions
      };

      // Get analysis from LLaVa
      const analysis = await GraphInsightsService.analyzeGraph(cleanBase64Image);

      // If there was an error in analysis
      if (!analysis.success) {
        return res.status(analysis.status || 500).json({
          success: false,
          error: analysis.error,
          details: analysis.details,
          metadata: analysis.metadata
        });
      }

      // Log the analysis for audit purposes
      await AuditService.logGraphAnalysis({
        userId: user.id,
        graphType: graphType || 'general',
        analysisType: context?.type || 'standard',
        timestamp: new Date(),
        insights: analysis.insights || []
      });

      // Return successful response
      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

