# Local LLM Integration for MUFG Chatbot

## 🚀 Overview

The MUFG Pension Insights chatbot now supports integration with a local Large Language Model (LLM) for enhanced, AI-powered responses. This provides more natural, context-aware conversations while maintaining data privacy and control.

## 🔧 Configuration

### Environment Setup
Add the following to your `.env` file:
```env
LOCAL_LLM_URL=http://localhost:5000/chat
```

### LLM Server Requirements
Your local LLM server should accept POST requests with this format:
```json
{
  "message": "Your contextual prompt here",
  "max_tokens": 500,
  "temperature": 0.7
}
```

And respond with:
```json
{
  "response": "AI-generated response text"
}
```

## 🧠 How It Works

### 1. **Intelligent Fallback System**
- **Primary**: Attempts to use local LLM for general inquiries
- **Fallback**: Uses structured, rule-based responses if LLM unavailable
- **Hybrid**: Combines LLM insights with structured data for specific intents

### 2. **Context-Aware Prompting**
The system builds rich prompts including:
- User role (Regulator, Advisor, Member)
- Member pension data (when available)
- Current conversation context
- Specific intent detection

### 3. **Enhanced Response Types**

#### Standard Responses
- Balance inquiries with exact figures
- Contribution details from user data
- KPI calculations using your financial functions

#### LLM-Enhanced Responses
- General pension advice and guidance
- Retirement planning recommendations
- Personalized suggestions based on user data
- Complex financial explanations

## 📊 Integration Points

### New ChatbotService Methods

#### `callLocalLLM(message, context)`
```javascript
// Calls your local LLM with contextual prompt
const response = await ChatbotService.callLocalLLM(
  "How should I plan for retirement?",
  { user, memberData }
);
```

#### `getEnhancedResponse(intent, message, context)`
```javascript
// Gets LLM-powered advice for specific intents
const advice = await ChatbotService.getEnhancedResponse(
  'retirement_projection',
  'Provide detailed retirement planning advice',
  { user, memberData }
);
```

#### `buildContextualPrompt(message, context)`
```javascript
// Builds rich prompts with user and pension data context
const prompt = ChatbotService.buildContextualPrompt(
  "Should I increase contributions?",
  { user, memberData }
);
```

### Enhanced Intent Handlers

#### General Inquiries
- **Before**: Generic template responses
- **Now**: AI-powered, contextual advice with intelligent fallback

#### Retirement Projections
- **Before**: Basic data display
- **Now**: Combines exact calculations with personalized LLM guidance

## 🎯 Response Sources

Responses now include a `source` field indicating generation method:

- **`local_llm`**: Generated entirely by local LLM
- **`llm_enhanced`**: Structured data enhanced with LLM advice
- **`standard`**: Traditional rule-based response
- **`fallback`**: Used when LLM unavailable

## 📝 Example Usage

### General Inquiry with LLM
```javascript
// User: "I'm 45 and worried about retirement savings"
// Response includes:
{
  "message": "At 45, you have approximately 20 years until traditional retirement age. Based on current trends, I'd recommend...",
  "intent": "general_inquiry",
  "source": "local_llm",
  "suggestions": ["Check balance", "View projections", "Get advice"]
}
```

### Enhanced Retirement Projection
```javascript
// User: "What's my retirement outlook?"
// Response combines exact data with LLM advice:
{
  "message": "Based on your current contributions, you have 15 years until retirement. Your retirement readiness score is 78.5%.\n\nGiven your current trajectory, you're in a relatively strong position. However, consider increasing your contributions by 2-3% to account for inflation...",
  "intent": "retirement_projection",
  "source": "llm_enhanced",
  "data": {
    "yearsToRetirement": 15,
    "readinessScore": 78.5
  }
}
```

## 🛡️ Security & Privacy

### Data Protection
- **Local Processing**: All LLM processing happens on your infrastructure
- **No External Calls**: No data sent to third-party AI services
- **Context Control**: Only relevant data included in prompts

### Error Handling
- **Graceful Degradation**: Falls back to structured responses if LLM fails
- **Timeout Protection**: Prevents hanging requests
- **Error Logging**: Logs LLM errors for debugging

## 🔧 Setup Instructions

### 1. Local LLM Server
Set up your preferred local LLM (e.g., Ollama, LocalAI, or custom solution):
```bash
# Example with Ollama
ollama serve --host 0.0.0.0:5000

# Or with LocalAI
docker run -p 5000:8080 localai/localai
```

### 2. Environment Configuration
```env
# Add to .env file
LOCAL_LLM_URL=http://localhost:5000/chat
```

### 3. Test the Integration
```bash
# Test chatbot endpoint
curl -X POST http://localhost:4000/api/chatbot/message \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "How should I plan for retirement?"}'
```

## 🚀 Benefits

### For Users
- **Natural Conversations**: More human-like, contextual responses
- **Personalized Advice**: Recommendations based on individual data
- **Comprehensive Guidance**: Detailed explanations and planning advice

### For System
- **Privacy Control**: All AI processing stays local
- **Reliability**: Intelligent fallback ensures system always responds
- **Flexibility**: Easy to swap or upgrade LLM backends

### For Developers
- **Modular Design**: Clean separation between LLM and core logic
- **Easy Testing**: Can disable LLM for testing structured responses
- **Monitoring**: Clear source tracking for response analysis

## 🔍 Monitoring & Debugging

### Response Source Tracking
Monitor which responses come from which source:
```javascript
// Check response source in logs
console.log(`Response generated via: ${response.source}`);
```

### LLM Health Checking
```javascript
// Test LLM availability
const isAvailable = await ChatbotService.callLocalLLM("test", {});
console.log(`LLM Status: ${isAvailable ? 'Available' : 'Offline'}`);
```

## 🔄 Future Enhancements

### Planned Features
- **Conversation Memory**: Multi-turn conversation context
- **Fine-tuning**: Pension-specific model training
- **A/B Testing**: Compare LLM vs structured responses
- **Analytics**: User satisfaction and response quality metrics

### Integration Ideas
- **Document RAG**: Include pension documentation in context
- **Real-time Data**: Live market data in responses
- **Multi-language**: Support for different languages

## ✅ Testing Checklist

- [ ] LLM server running and accessible
- [ ] Environment variable configured
- [ ] Fallback responses work when LLM offline
- [ ] Enhanced responses include both data and advice
- [ ] Error handling graceful and logged
- [ ] Response sources correctly identified
- [ ] Context properly included in prompts

The local LLM integration enhances the chatbot with AI-powered insights while maintaining the reliability and accuracy of your existing pension calculation system!
