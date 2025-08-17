/**
 * Chatbot Service
 * Handles AI-powered chatbot interactions and natural language processing
 */

export class ChatbotService {
  /**
   * Call local LLM for advanced responses
   */
  static async callLocalLLM(message, context = {}) {
    try {
      const localLlmUrl = process.env.LOCAL_LLM_URL;
      
      if (!localLlmUrl) {
        console.warn('LOCAL_LLM_URL not configured, using fallback response');
        return null;
      }

      const prompt = this.buildContextualPrompt(message, context);
      
      const response = await fetch(localLlmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.message || null;
    } catch (error) {
      console.error('Error calling local LLM:', error);
      return null;
    }
  }

  /**
   * Build contextual prompt for LLM
   */
  static buildContextualPrompt(message, context) {
    const { user, memberData } = context;
    
    let prompt = `You are a helpful pension advisor assistant for MUFG Pension Insights. `;
    
    if (user && user.role) {
      prompt += `The user is a ${user.role.toLowerCase()}. `;
    }
    
    if (memberData) {
      prompt += `They have access to pension data. `;
    }
    
    prompt += `Please provide helpful, accurate information about pensions, retirement planning, and financial advice. `;
    prompt += `Keep responses professional, concise, and relevant to pension management.\n\n`;
    prompt += `User question: ${message}\n\n`;
    prompt += `Response:`;
    
    return prompt;
  }

  /**
   * Process incoming chatbot message
   */
  static async processMessage({ message, context, user, memberData }) {
    try {
      // Analyze message intent
      const intent = await this.analyzeIntent(message);
      
      // Generate response based on intent and user context
      const response = await this.generateResponse({
        intent,
        message,
        context,
        user,
        memberData
      });

      return response;
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
