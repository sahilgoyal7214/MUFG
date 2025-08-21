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
   * @returns {Promise<Object>} Analysis results
   */
  static async analyzeGraph(base64Image) {
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

      // Check environment configuration
      const llavaUrl = process.env.GRAPH_LLM_URL;
      const modelName = process.env.GRAPH_LLM_MODEL;

      console.log('📝 Using LLM configuration:', { llavaUrl, modelName });
      
      // Save base64 as temporary image file
      tempFilePath = await this.saveBase64AsImage(base64Image);
      console.log('� Created temp image file:', tempFilePath);
      
      // Read the image file and encode it as base64 for the request
      const imageBuffer = await fs.promises.readFile(tempFilePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      // Use Ollama's expected format
      const payload = {
        model: modelName,
        prompt: 'This is a pension fund analytics graph. Please analyze this image and focus on key financial metrics, trends, and insights that would be relevant for pension fund management. What are the main patterns and what do they suggest about fund performance or risk?',
        images: [imageBase64],
        stream: false
      };

      console.log('📦 Sending payload with image size:', imageBase64.length);

      // Function to handle timeout - 3 minutes to allow for thorough processing
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('LLM request timed out')), 180000);
      });

      console.log('🚀 Sending JSON payload to LLaVA...');

      // Send to LLaVa using fetch with JSON payload
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let responseText = await response.text();
      console.log('📥 Raw response text:', responseText);

      try {
        // Try to parse the response text
        const responseData = JSON.parse(responseText);
        console.log('📥 Parsed response:', responseData);

        // Simple validation
        if (!responseData) {
          throw new Error('Empty response from LLM');
        }

        return {
          success: true,
          data: responseData,
          status: 200,
          metadata: {
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          }
        };

      } catch (parseError) {
        // If it's not JSON, return the raw text as analysis
        console.log('Not JSON, treating as plain text response');
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

      return {
        success: true,
        data: responseData,
        status: 200,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          model: modelName
        }
      };

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
