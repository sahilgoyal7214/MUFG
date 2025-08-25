/**
 * Graph Insights Service
 * Handles visual analysis of pension data graphs using LLaVa
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

export class GraphInsightsService {
  /**
   * Convert base64 string to temporary image file
   * @param {string} base64String - Base64 encoded image data
   * @returns {Promise<string>} Path to the temporary image file
   */
  static async saveBase64AsImage(base64String) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      
      // Create unique filename
      const filename = `graph_${Date.now()}.png`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
      
      // Ensure temp directory exists
      await fs.promises.mkdir(uploadDir, { recursive: true });
      
      const filepath = path.join(uploadDir, filename);
      
      // Save the image
      await fs.promises.writeFile(filepath, base64Data, 'base64');
      console.log('📸 Saved image to:', filepath);
      
      return filepath;
    } catch (error) {
      console.error('Error saving base64 as image:', error);
      throw new Error('Failed to save image file: ' + error.message);
    }
  }

  /**
   * Clean up temporary image file
   * @param {string} filepath - Path to the file to delete
   */
  static async cleanupFile(filepath) {
    try {
      await fs.promises.unlink(filepath);
      console.log('🧹 Cleaned up file:', filepath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
  /**
   * Analyze graph using LLaVa
   */
  static async convertBase64ToImage(base64String) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      
      // Create a unique filename
      const filename = `graph_${Date.now()}.png`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
      
      // Ensure directory exists
      await fs.promises.mkdir(uploadDir, { recursive: true });
      
      const filepath = path.join(uploadDir, filename);

      // Write the file
      await fs.promises.writeFile(filepath, base64Data, 'base64');
      
      return filepath;
    } catch (error) {
      console.error('Error converting base64 to image:', error);
      throw error;
    }
  }

  static async cleanupTempFile(filepath) {
    try {
      await fs.promises.unlink(filepath);
      console.log('🧹 Cleaned up temp file:', filepath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }
  }

  /**
   * Analyze graph using LLaVa
   * @param {string} base64Image - Base64 encoded image data
   * @param {Object} context - Context information including user role
   * @returns {Promise<Object>} Analysis results
   */
  static async analyzeGraph(base64Image, context = {}) {
    // Input validation
    if (!base64Image) {
      return {
        success: false,
        error: 'No image provided',
        status: 400
      };
    }

    if (typeof base64Image !== 'string') {
      return {
        success: false,
        error: 'Invalid image format',
        status: 400
      };
    }

    let tempFilePath = null;
    
    try { 
      const startTime = Date.now();
      console.log('🚀 Starting graph analysis at:', new Date().toISOString());
      console.log('📋 Analysis context:', context);

      // Use LLaVa configuration
      const llavaUrl = process.env.GRAPH_LLM_URL || process.env.LOCAL_LLM_URL;
      const modelName = 'llava'; // Always use llava for image analysis

      console.log('📝 Using LLaVa configuration:', { llavaUrl, modelName });
      
      if (!llavaUrl) {
        throw new Error('No LLM URL configured');
      }

      // Save base64 as temporary image file
      tempFilePath = await this.saveBase64AsImage(base64Image);
      console.log('📁 Created temp image file:', tempFilePath);
      
      // For LLaVa model with image support
      const imageBuffer = await fs.promises.readFile(tempFilePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      // Create role-specific prompts
      let prompt = '';
      const userRole = context.userRole || context.role || 'member';
      
      if (userRole === 'advisor') {
        prompt = `You are an expert financial advisor analyzing a pension fund analytics chart. 

Please analyze this pension data visualization and provide exactly 4 key insights that would be most valuable for an advisor managing client portfolios. Focus on:

1. **Portfolio Performance Trends**: What patterns indicate strong or concerning performance?
2. **Risk Assessment**: Are there any risk indicators or diversification concerns?
3. **Client Segmentation**: What does the data reveal about different client groups or demographics?
4. **Actionable Recommendations**: What specific actions should an advisor take based on this data?

Format your response as exactly 4 distinct insights, each starting with a relevant emoji and a clear title. Keep each insight concise but actionable (2-3 sentences max). Focus on practical advisor guidance rather than generic observations.

Example format:
📈 **Performance Insight**: [specific observation and implication]
⚠️ **Risk Alert**: [risk factor and recommended action]
👥 **Client Segmentation**: [demographic or behavioral pattern]
🎯 **Advisory Action**: [specific recommendation for client management]`;
      } else {
        // Member-specific prompt focused on personal financial education and protection
        prompt = `You are a trusted personal financial advisor analyzing a pension data chart for an individual pension plan member. 

Please analyze this pension visualization and provide exactly 4 key insights that would help a pension member understand their financial situation and protect their interests. Focus on:

1. **Personal Financial Health**: What does this data tell them about their pension progress?
2. **Risk Awareness**: What potential risks should they be aware of and how to protect themselves?
3. **Optimization Opportunities**: How can they improve their pension outcomes?
4. **Next Steps**: What specific actions should they take to secure their financial future?

Write in a supportive, educational tone that empowers the member with knowledge. Avoid jargon and explain concepts clearly. Focus on their personal control and decision-making power.

Format your response as exactly 4 distinct insights, each starting with a relevant emoji and a clear title. Keep each insight encouraging and actionable (2-3 sentences max).

Example format:
💰 **Your Financial Progress**: [personal assessment and encouragement]
🛡️ **Protect Your Future**: [risk awareness and protection strategies]
📊 **Optimization Tip**: [specific improvement opportunity]
✅ **Action Plan**: [clear next steps they can take]`;
      }
      
      const payload = {
        model: modelName,
        prompt: prompt,
        images: [imageBase64],
        stream: false
      };
      
      console.log('📦 Using LLaVa with image analysis');
      console.log('🚀 Sending request to LLM...');

      // Send to LLM with 2-minute timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('LLM request timed out after 2 minutes')), 120000);
      });

      // Send to LLM with timeout protection
      const response = await Promise.race([
        fetch(llavaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }),
        timeoutPromise
      ]);

      console.log('📡 Received response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ LLM request failed:', errorText);
        throw new Error(`LLM request failed: HTTP ${response.status} - ${errorText}`);
      }

      let responseText = await response.text();
      console.log('📥 Raw response received, length:', responseText.length);

      try {
        // Try to parse as JSON first
        const responseData = JSON.parse(responseText);
        console.log('✅ Successfully parsed JSON response');

        // Extract the analysis text from the response
        let analysisText = '';
        if (responseData.response) {
          analysisText = responseData.response;
        } else if (responseData.message) {
          analysisText = responseData.message;
        } else if (typeof responseData === 'string') {
          analysisText = responseData;
        } else {
          analysisText = JSON.stringify(responseData);
        }

        return {
          success: true,
          data: {
            analysis: analysisText.trim()
          },
          status: 200,
          metadata: {
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            modelUsed: modelName,
            responseLength: analysisText.length
          }
        };

      } catch (parseError) {
        // If it's not JSON, treat as plain text response
        console.log('📄 Response is plain text, not JSON');
        return {
          success: true,
          data: {
            analysis: responseText.trim()
          },
          status: 200,
          metadata: {
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          }
        };
      }

    } catch (error) {
      console.error('Error analyzing graph:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        status: 500,
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
    } finally {
      // Cleanup temporary file
      if (tempFilePath) {
        await this.cleanupTempFile(tempFilePath);
      }
    }
  }
}
