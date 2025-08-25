/**
 * Chatbot Service
 * Handles AI-powered chatbot interactions and natural language processing
 */

export class ChatbotService {
  /**
   * Format numerical statistics for advisor view
   */
  static formatAggregatedStats(data, field) {
    const values = data.map(item => parseFloat(item[field])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length
    };
  }

  /**
   * Prepare data context for LLM based on user role
   */
  static prepareDataContext(data, isAdvisor) {
    if (!isAdvisor || !Array.isArray(data)) {
      return data; // Return full data for members
    }

    // For advisors, aggregate numerical fields and summarize categorical fields
    const numericalFields = ['Age', 'Annual_Income', 'Current_Savings', 'Retirement_Age_Goal', 
      'Contribution_Amount', 'Total_Annual_Contribution', 'Years_Contributed', 'Annual_Return_Rate',
      'Volatility', 'Fees_Percentage', 'Projected_Pension_Amount', 'Expected_Annual_Payout'];
    
    const aggregatedData = {};
    
    // Aggregate numerical fields
    numericalFields.forEach(field => {
      aggregatedData[field] = this.formatAggregatedStats(data, field);
    });

    // Get distribution of categorical fields
    const categoricalFields = ['Gender', 'Country', 'Employment_Status', 'Risk_Tolerance',
      'Investment_Type', 'Education_Level', 'Health_Status'];
    
    categoricalFields.forEach(field => {
      const distribution = {};
      data.forEach(item => {
        if (item[field]) {
          distribution[item[field]] = (distribution[item[field]] || 0) + 1;
        }
      });
      aggregatedData[field + '_distribution'] = distribution;
    });

    // Add total count
    aggregatedData.total_members = data.length;

    return aggregatedData;
  }

  /**
   * Call local LLM for advanced responses
   */
  static validateLLMResponse(response) {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid LLM response format');
    }

    const requiredFields = ['message', 'intent'];
    for (const field of requiredFields) {
      if (!response[field]) {
        throw new Error(`Missing required field in LLM response: ${field}`);
      }
    }

    return response;
  }

  static async callLocalLLM(message, context = {}) {
    try {
      const localLlmUrl = process.env.LOCAL_LLM_URL;
      const modelName = process.env.LLM_MODEL_NAME || 'mistral';  // default to mistral if not specified
      const modelVersion = process.env.LLM_MODEL_VERSION || '1.0';
      
      if (!localLlmUrl) {
        console.warn('LOCAL_LLM_URL not configured, using fallback response');
        return null;
      }

      // Prepare data context based on user role
      const preparedContext = {
        ...context,
        pensionData: this.prepareDataContext(context.memberData, context.isAdvisor),
        modelContext: {
          role: context.isAdvisor ? 'advisor' : 'member',
          capabilities: ['pension_analysis', 'financial_advice', 'retirement_planning'],
          dataAccess: context.isAdvisor ? 'aggregated' : 'individual'
        }
      };
      
      const prompt = this.buildContextualPrompt(message, preparedContext);
      
      console.log('🤖 Sending request to Ollama:', {
        url: localLlmUrl,
        model: modelName,
        prompt: prompt
      });

      const response = await fetch(localLlmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Model-Version': process.env.LLM_MODEL_VERSION || '1.0',
        },
        body: JSON.stringify({
          model: modelName,
          metadata: {
            model_name: modelName,
            model_version: process.env.LLM_MODEL_VERSION || '1.0',
            user_role: context.isAdvisor ? 'advisor' : 'member',
            request_timestamp: new Date().toISOString()
          },
          prompt: prompt,
          stream: false,
          parameters: {
            temperature: context.isAdvisor ? 0.3 : 0.5, // Lower temperature for advisor responses
            max_tokens: 500,  // Limiting max tokens for concise response
            top_p: 0.9,
            frequency_penalty: 0.5  // Discourage repetition
          }
        })
      });

      if (!response.ok) {
        console.error('LLM Error Response:', await response.text());
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 LLM Response:', data);
      
      // Ollama response format is different, it includes a 'response' field
      return data.response || '';
    } catch (error) {
      console.error('Error calling local LLM:', error);
      return null;
    }
  }

  /**
   * Build contextual prompt for LLM
   */
  static buildContextualPrompt(message, context) {
    const { modelContext, pensionData } = context;
    
    let prompt = `You are a helpful pension advisor assistant for MUFG Pension Insights. `;
    
    if (modelContext?.role) {
      if (modelContext.role === 'advisor') {
        prompt += `You are responding to a pension advisor. `;
        prompt += `You have access to aggregated statistics of all pension members. `;
        
        if (pensionData) {
          prompt += `\nHere is the aggregated pension data context:\n`;
          prompt += `${JSON.stringify(pensionData, null, 2)}\n\n`;
        }
        
        prompt += `Please provide a comprehensive analysis of the pension data with the following structure:\n`;
        prompt += `1. Overall Performance Metrics (returns, growth trends)\n`;
        prompt += `2. Member Demographics and Segmentation\n`;
        prompt += `3. Investment Patterns and Risk Analysis\n`;
        prompt += `4. Contribution Behaviors and Trends\n`;
        prompt += `5. Retirement Readiness Indicators\n`;
        prompt += `6. Key Areas of Concern\n`;
        prompt += `7. Recommendations\n\n`;
        prompt += `Include specific numbers, percentages, and comparative analysis. Break down the data by different member segments where relevant.\n\n`;
        
      } else {
        // Member role - individual data only
        prompt += `You are responding to an individual pension plan member. `;
        prompt += `You have access to their personal pension data only. `;
        prompt += `IMPORTANT: Only analyze and discuss the individual member's personal data. `;
        prompt += `Do NOT mention other members, aggregated statistics, or comparative analysis with other members. `;
        prompt += `Focus solely on their personal retirement planning.\n\n`;
        
        if (pensionData) {
          prompt += `Here is the member's personal pension data:\n`;
          prompt += `${JSON.stringify(pensionData, null, 2)}\n\n`;
        }
        
        prompt += `Please provide a personalized analysis focusing ONLY on this member's data:\n`;
        prompt += `1. Current Financial Position (balance, contributions)\n`;
        prompt += `2. Investment Performance (personal returns only)\n`;
        prompt += `3. Retirement Timeline & Goals\n`;
        prompt += `4. Personal Risk Assessment\n`;
        prompt += `5. Personalized Recommendations\n\n`;
        prompt += `Keep the response personal and confidential. Use "your" language and focus only on this individual's pension situation.\n\n`;
      }
    }
    
    prompt += `User question: ${message}\n\n`;
    prompt += `Response: `;
    
    return prompt;
  }

  /**
   * Process incoming chatbot message
   */
  static async processMessage({ message, context, user, memberData }) {
    try {
      // Always try LLM first
      const llmResponse = await this.callLocalLLM(message, {
        memberData,
        isAdvisor: user.permissions.includes('advisor'),
        user
      });
      
      // Only if LLM fails, fallback to basic response
      if (!llmResponse) {
        console.warn('LLM failed, falling back to basic response');
        const intent = await this.analyzeIntent(message);
        return await this.generateResponse({
          intent,
          message,
          context,
          user,
          memberData
        });
      }
      
      return {
        message: llmResponse,
        intent: 'llm_response',
        source: 'local_llm',
        suggestions: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      return {
        message: "I'm sorry, I encountered an error processing your request. Please try again.",
        intent: 'error',
        suggestions: ['Try rephrasing your question', 'Contact support if the issue persists']
      };
    }
  }

  /**
   * Analyze message intent using NLP
   */
  static async analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Intent patterns (in a real implementation, you'd use ML/NLP libraries)
    const intents = {
      'balance_inquiry': [
        'balance', 'how much', 'current balance', 'account balance', 'pension balance'
      ],
      'contribution_info': [
        'contribution', 'monthly contribution', 'how much contribute', 'payment'
      ],
      'retirement_projection': [
        'retirement', 'when retire', 'projection', 'forecast', 'future'
      ],
      'investment_performance': [
        'performance', 'returns', 'investment', 'growth', 'fund performance'
      ],
      'general_help': [
        'help', 'support', 'how to', 'what can you do', 'assistance'
      ],
      'risk_profile': [
        'risk', 'risk profile', 'risk tolerance', 'investment risk'
      ]
    };

    // Simple keyword matching (replace with proper NLP in production)
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }

    return 'general_inquiry';
  }

  /**
   * Generate response based on intent and context
   */
  static async generateResponse({ intent, message, context, user, memberData }) {
    switch (intent) {
      case 'balance_inquiry':
        return this.handleBalanceInquiry(memberData, user);
      
      case 'contribution_info':
        return this.handleContributionInfo(memberData, user);
      
      case 'retirement_projection':
        return this.handleRetirementProjection(memberData, user);
      
      case 'investment_performance':
        return this.handleInvestmentPerformance(memberData, user);
      
      case 'risk_profile':
        return this.handleRiskProfile(memberData, user);
      
      case 'general_help':
        return this.handleGeneralHelp(user);
      
      default:
        return this.handleGeneralInquiry(message, user, memberData);
    }
  }

  /**
   * Handle balance inquiry
   */
  static async handleBalanceInquiry(memberData, user) {
    if (!memberData) {
      return {
        message: "I'd be happy to help you with your balance inquiry! However, I need access to your member data. Please make sure you're logged in and have the necessary permissions.",
        intent: 'balance_inquiry',
        suggestions: ['Log in to view your balance', 'Contact support for assistance']
      };
    }

    const balance = memberData.pensionDetails.currentBalance || 0;
    const readinessScore = memberData.calculateReadinessScore();

    return {
      message: `Your current pension balance is £${balance.toLocaleString()}. Your retirement readiness score is ${readinessScore.toFixed(1)}%.`,
      intent: 'balance_inquiry',
      data: {
        balance,
        readinessScore,
        currency: 'GBP'
      },
      suggestions: [
        'View contribution history',
        'See retirement projections',
        'Get investment advice'
      ]
    };
  }

  /**
   * Handle contribution information
   */
  static async handleContributionInfo(memberData, user) {
    if (!memberData) {
      return {
        message: "I can help you with contribution information once I have access to your member data.",
        intent: 'contribution_info',
        suggestions: ['Log in to view contributions', 'Contact HR for contribution details']
      };
    }

    const monthlyContribution = memberData.pensionDetails.monthlyContribution || 0;
    const employerMatch = memberData.pensionDetails.employerMatch || 0;

    return {
      message: `Your monthly contribution is £${monthlyContribution.toLocaleString()}, and your employer contributes £${employerMatch.toLocaleString()}.`,
      intent: 'contribution_info',
      data: {
        monthlyContribution,
        employerMatch,
        totalMonthly: monthlyContribution + employerMatch
      },
      suggestions: [
        'Increase my contributions',
        'View contribution history',
        'Calculate optimal contribution'
      ]
    };
  }

  /**
   * Handle retirement projection
   */
  static async handleRetirementProjection(memberData, user) {
    if (!memberData) {
      return {
        message: "I can provide retirement projections once I have access to your member data.",
        intent: 'retirement_projection',
        suggestions: ['Log in to view projections', 'Schedule consultation']
      };
    }

    const currentAge = memberData.personalInfo.age || 30;
    const retirementAge = memberData.pensionDetails.retirementAge || 65;
    const yearsToRetirement = retirementAge - currentAge;
    const readinessScore = memberData.calculateReadinessScore();
    
    // Try to get enhanced LLM response
    const enhancedAdvice = await this.getEnhancedResponse(
      'retirement_projection', 
      'Can you provide detailed retirement planning advice?',
      { user, memberData }
    );
    
    const baseMessage = `Based on your current contributions, you have ${yearsToRetirement} years until retirement. Your retirement readiness score is ${readinessScore.toFixed(1)}%.`;
    
    const finalMessage = enhancedAdvice 
      ? `${baseMessage}\n\n${enhancedAdvice}`
      : baseMessage;

    return {
      message: finalMessage,
      intent: 'retirement_projection',
      source: enhancedAdvice ? 'llm_enhanced' : 'standard',
      data: {
        yearsToRetirement,
        retirementAge,
        readinessScore
      },
      suggestions: [
        'View detailed projections',
        'Explore scenarios',
        'Get retirement planning advice'
      ]
    };
  }

  /**
   * Handle investment performance
   */
  static async handleInvestmentPerformance(memberData, user) {
    return {
      message: "I can provide information about your investment performance. Your funds have shown steady growth over the past year.",
      intent: 'investment_performance',
      suggestions: [
        'View detailed performance',
        'Compare fund options',
        'Review investment strategy'
      ]
    };
  }

  /**
   * Handle risk profile
   */
  static async handleRiskProfile(memberData, user) {
    if (!memberData) {
      return {
        message: "I can help you understand your risk profile once I have access to your data.",
        intent: 'risk_profile',
        suggestions: ['Complete risk assessment', 'View risk recommendations']
      };
    }

    const riskLevel = memberData.riskProfile.level || 'moderate';

    return {
      message: `Your current risk profile is set to '${riskLevel}'. This affects how your pension funds are invested.`,
      intent: 'risk_profile',
      data: {
        riskLevel,
        riskProfile: memberData.riskProfile
      },
      suggestions: [
        'Review risk assessment',
        'Update risk profile',
        'Learn about risk levels'
      ]
    };
  }

  /**
   * Handle general help
   */
  static async handleGeneralHelp(user) {
    return {
      message: `Hello ${user.name}! I'm your pension insights assistant. I can help you with:

• Balance inquiries
• Contribution information  
• Retirement projections
• Investment performance
• Risk profile management

What would you like to know about your pension?`,
      intent: 'general_help',
      suggestions: [
        'Check my balance',
        'View contributions',
        'See retirement projections',
        'Investment performance'
      ]
    };
  }

  /**
   * Enhanced response using LLM for complex queries
   */
  static async getEnhancedResponse(intent, message, context) {
    const { user, memberData } = context;
    
    // Build enhanced prompt with context
    let enhancedPrompt = `You are a pension advisor for MUFG Pension Insights. `;
    enhancedPrompt += `The user is asking about: ${intent}. `;
    
    if (memberData) {
      enhancedPrompt += `User's pension details: `;
      enhancedPrompt += `Current balance: £${memberData.pensionDetails?.currentBalance || 0}, `;
      enhancedPrompt += `Monthly contribution: £${memberData.pensionDetails?.monthlyContribution || 0}, `;
      enhancedPrompt += `Age: ${memberData.personalInfo?.age || 'unknown'}, `;
      enhancedPrompt += `Risk profile: ${memberData.riskProfile?.level || 'unknown'}. `;
    }
    
    enhancedPrompt += `Please provide detailed, personalized advice.\n\n`;
    enhancedPrompt += `User question: ${message}\n\nResponse:`;
    
    try {
      const llmResponse = await this.callLocalLLM(enhancedPrompt, context);
      return llmResponse;
    } catch (error) {
      console.error('Error getting enhanced response:', error);
      return null;
    }
  }

  /**
   * Handle general inquiries
   */
  static async handleGeneralInquiry(message, user, memberData = null) {
    // Try to get response from local LLM first
    const llmResponse = await this.callLocalLLM(message, { user, memberData });
    
    if (llmResponse) {
      return {
        message: llmResponse,
        intent: 'general_inquiry',
        source: 'local_llm',
        suggestions: [
          'Check balance',
          'View contributions',
          'Retirement planning',
          'Get help'
        ]
      };
    }
    
    // Fallback to predefined response
    return {
      message: "I understand you have a question about your pension. Could you be more specific? I can help with balance inquiries, contributions, projections, and more.",
      intent: 'general_inquiry',
      source: 'fallback',
      suggestions: [
        'Check balance',
        'View contributions',
        'Retirement planning',
        'Get help'
      ]
    };
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory({ userId, memberId, limit, offset }) {
    // Implementation would fetch from database
    // Placeholder for database query
    return {
      conversations: [],
      total: 0,
      limit,
      offset
    };
  }

  /**
   * Clear conversation history
   */
  static async clearConversationHistory({ userId, memberId }) {
    // Implementation would clear from database
    return true;
  }

  /**
   * Get chatbot capabilities
   */
  static async getCapabilities() {
    return {
      intents: [
        'balance_inquiry',
        'contribution_info',
        'retirement_projection',
        'investment_performance',
        'risk_profile',
        'general_help'
      ],
      features: [
        'Natural language understanding',
        'Personalized responses',
        'Member data integration',
        'Role-based access control',
        'Conversation history'
      ]
    };
  }
}
