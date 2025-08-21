# MUFG Pension Insights Platform

A comprehensive backend API for pension data analysis, insights, AI-powered guidance, and visual graph analysis, built with Express.js and local LLM integration.

## 🚀 **Current Status: Production Ready**

✅ **Complete Backend API** with role-based access control  
✅ **Swagger/OpenAPI Documentation** at `/api-docs`  
✅ **Local LLM Integration** for AI-powered chatbot  
✅ **Graph Analysis Service** using LLaVA vision model  
✅ **JWT Authentication** with test tokens  
✅ **Financial Calculation Engine** with custom functions  
✅ **Audit Logging System** for compliance  
✅ **Comprehensive Testing Tools** for API validation  
✅ **Organized Project Structure** with proper separation of concerns

## 🏗️ Project Structure

```
mufg/
├── backend/                    # Node.js/Express backend server
│   ├── src/                   # Source code
│   ├── database/              # SQLite database and migrations
│   ├── tests/                 # Test suites (unit, integration, scripts)
│   ├── reference/             # Reference materials and Python logic
│   └── tools/                 # Development tools
├── documentation/             # Centralized documentation
├── testing/                   # Testing materials and TestSprite results
└── scripts/                   # Project maintenance scripts
│   │   ├── routes/                    # API Routes
│   │   │   ├── auth.js               # Authentication & JWT verification
│   │   │   ├── users.js              # User management (role-based)
│   │   │   ├── members.js            # Member pension data
│   │   │   ├── kpi.js                # Financial calculations
│   │   │   ├── chatbot.js            # AI chatbot with LLM
│   │   │   ├── analytics.js          # Business analytics
│   │   │   ├── graph-insights.js     # Graph analysis with LLaVA
│   │   │   └── logs.js               # Audit logging
│   │   ├── controllers/              # Business logic
│   │   │   ├── MemberDataController.js
│   │   │   ├── ChatbotController.js
│   │   │   └── GraphInsightsController.js  # Graph analysis
│   │   ├── services/                 # Core services
│   │   │   ├── ChatbotService.js     # LLM integration
│   │   │   ├── KpiService.js         # Financial calculations
│   │   │   ├── GraphInsightsService.js # Graph vision analysis
│   │   │   └── AuditService.js       # Logging & compliance
│   │   ├── middleware/               # Custom middleware
│   │   │   └── auth.js              # JWT & role-based auth
│   │   ├── config/                   # Configuration
│   │   │   ├── swagger.js           # OpenAPI 3.0 spec
│   │   │   ├── roles.js             # RBAC definitions
│   │   │   └── database.js          # DB configuration
│   │   ├── models/                   # Data models
│   │   ├── utils/                    # Utilities
│   │   └── validators/               # Input validation
│   ├── logs/                         # Audit log files
│   ├── tests/                        # Test suites
│   ├── app.js                        # Main server file
│   ├── generate-test-token.js        # JWT token generator
│   ├── test-chatbot-llm.sh          # LLM testing script
│   ├── package.json                  # Dependencies
│   ├── .env                          # Environment config
│   └── *.md                          # Documentation files
│
├── model_training/                    # ML Models & Training
│   ├── train.ipynb                   # Jupyter notebook
│   ├── data.xlsx                     # Training data
│   └── retirement_predictions.csv    # ML outputs
│
├── package.json                      # Root project config
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Optional: Local LLM server for enhanced chatbot

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilgoyal7214/MUFG.git
   cd MUFG
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Environment is already configured with:
   # - JWT secrets
   # - Database configuration  
   # - Local LLM URL
   # Check backend/.env for current settings
   ```

4. **Start the backend server**
   ```bash
   pnpm start
   # Backend starts on http://localhost:4000
   # API Documentation: http://localhost:4000/api-docs
   ```

5. **Get JWT tokens for testing**
   ```bash
   cd backend
   # Generate test token (regulator has full access)
   node generate-test-token.js regulator
   # Copy the token for use in Swagger UI
   ```

## 📋 Available Scripts

### Root Scripts
```bash
pnpm start                # Start backend production server
pnpm run dev              # Start backend development server
pnpm install              # Install all dependencies
pnpm run clean            # Clean node_modules
```

### Backend Scripts (from backend/ directory)
```bash
pnpm start                # Start production server
pnpm run dev              # Start development server with nodemon
node generate-test-token.js [regulator|advisor|member]  # Generate JWT tokens
./test-chatbot-llm.sh     # Test LLM integration
./tests/test-chatbot-llm.sh  # Comprehensive chatbot testing
```

## 🛠️ Tech Stack

**Backend Framework:**
- Express.js - Web framework
- Node.js - Runtime environment
- JWT - Authentication & authorization
- Swagger/OpenAPI 3.0 - API documentation

**Security & Middleware:**
- Helmet - Security headers
- CORS - Cross-origin resource sharing
- Rate limiting - API protection
- Input validation - Data sanitization
- Role-based access control (RBAC)

**AI & Analytics:**
- Local LLM integration - Privacy-focused AI
- LLaVA vision model - Graph and chart analysis
- Custom financial calculation engine
- Pension projection algorithms
- Natural language processing
- Image processing and analysis

**Logging & Compliance:**
- File-based audit logging
- Structured log management
- Compliance monitoring
- Error tracking

## 🔧 Environment Variables

The `.env` file in `backend/` directory is pre-configured with:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database (Azure PostgreSQL ready)
DATABASE_URL=postgresql://Easyml:mlops@124@mufg.postgres.database.azure.com:5432/postgres

# Local LLM Integration (optional)
LOCAL_LLM_URL=http://localhost:5000/chat

# Graph Analysis with LLaVA
GRAPH_LLM_URL=http://localhost:11434/api/generate
GRAPH_LLM_MODEL=llava

# File Upload & Logging
MAX_FILE_SIZE=50MB
UPLOAD_DIR=./uploads
LOG_LEVEL=info
```

## 📡 API Endpoints

### 📚 **Interactive API Documentation**
**🚀 Swagger UI**: http://localhost:4000/api-docs
- Test all endpoints directly in your browser
- Complete OpenAPI 3.0 specification
- JWT authentication testing
- Real-time response examples

**📋 API Overview**: http://localhost:4000/api
- Endpoint listing with descriptions
- OpenAPI JSON specification download

### 🔐 **Authentication**
- `POST /api/auth/verify` - Verify JWT token from NextAuth
- `GET /api/auth/me` - Get current authenticated user info

### 👥 **Users** (Role-based access)
- `GET /api/users` - List users (Regulators: all, Advisors: assigned clients)
- `GET /api/users/{userId}` - Get specific user details

### 💼 **Members** (Pension data management)
- `GET /api/members/{memberId}` - Get comprehensive member data
- `PUT /api/members/{memberId}` - Update member information
- `GET /api/members/{memberId}/contributions` - Contribution history
- `GET /api/members/{memberId}/projections` - Retirement projections
- `GET /api/members/{memberId}/dashboard` - Dashboard summary

### 💰 **KPI Calculations** (Your Financial Functions)
- `GET /api/kpi/retirement-age` - Calculate optimal retirement age
- `GET /api/kpi/total-corpus` - Project total retirement corpus
- `GET /api/kpi/retirement-readiness` - Comprehensive readiness score

### 🤖 **Chatbot** (AI-powered pension guidance)
- `POST /api/chatbot/message` - Send message to AI chatbot
- Local LLM integration with intelligent fallback
- Context-aware responses with member data
- Natural language pension advice

### 📊 **Graph Insights** (AI-powered visual analysis)
- `POST /api/graph-insights/analyze` - Analyze graphs and charts with LLaVA
- Base64 image input for pension fund charts
- AI-powered visual data interpretation
- Financial metrics and trend analysis

### 📊 **Analytics** (Business intelligence)
- `GET /api/analytics/dashboard` - Role-based analytics dashboard
- System-wide metrics for regulators
- Client analytics for advisors
- Personal insights for members

### 📋 **Audit Logs** (Compliance & monitoring)
- `GET /api/logs/files` - List available log files
- `GET /api/logs/{type}/{date}` - Get specific logs
- Regulator-only access for compliance

## 🎫 **Testing with JWT Tokens**

### Generate Test Tokens
```bash
cd backend

# Full access (recommended for testing)
node generate-test-token.js regulator

# Limited member access
node generate-test-token.js member

# Advisor access
node generate-test-token.js advisor
```

### Use in Swagger UI
1. Go to `http://localhost:4000/api-docs`
2. Click "Authorize" button (🔓)
3. Enter: `Bearer [your-token]`
4. Test all endpoints with authentication!

### Quick cURL Test
```bash
# Test authentication
curl -H "Authorization: Bearer [TOKEN]" http://localhost:4000/api/auth/me

# Test chatbot
curl -X POST -H "Authorization: Bearer [TOKEN]" \
     -H "Content-Type: application/json" \
     -d '{"message":"How should I plan for retirement?"}' \
     http://localhost:4000/api/chatbot/message

# Test graph analysis
curl -X POST -H "Authorization: Bearer [TOKEN]" \
     -H "Content-Type: application/json" \
     -d '{"base64Image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...","context":{"type":"pension_fund"},"graphType":"performance"}' \
     http://localhost:4000/api/graph-insights/analyze
```

## 🤖 **Local LLM Integration**

### Setup (Optional)
```bash
# Option 1: Ollama with LLaVA for graph analysis
ollama serve --host 0.0.0.0:11434
ollama pull llava

# Option 2: Ollama for chatbot
ollama serve --host 0.0.0.0:5000

# Option 3: LocalAI
docker run -p 5000:8080 localai/localai

# Your LLM server should accept POST requests at /chat
```

### Features
- **Privacy-focused**: All AI processing stays local
- **Intelligent fallback**: Works without LLM server
- **Context-aware**: Uses member data for personalized advice
- **Graph analysis**: Visual interpretation of charts and graphs
- **Response tracking**: Monitor AI vs structured responses

## 🔐 **Role-Based Access Control**

### User Roles
- **REGULATOR**: Full system access, compliance monitoring
- **ADVISOR**: Assigned client data, limited analytics
- **MEMBER**: Personal data only, chatbot access

### Permissions
- Granular permissions for each endpoint
- Data filtering based on user role
- Audit logging for all actions

## 📊 **Key Features**

### ✅ **Production Ready**
- Comprehensive API documentation
- JWT authentication with role-based access
- Input validation and error handling
- Security middleware (Helmet, CORS, rate limiting)
- Audit logging for compliance

### ✅ **Financial Calculations**
- Custom retirement planning algorithms
- Pension projection models
- KPI calculation engine
- Risk assessment tools

### ✅ **AI Integration**
- Local LLM for enhanced chatbot responses
- LLaVA vision model for graph analysis
- Natural language pension guidance
- Context-aware advice generation
- Privacy-focused processing
- Image processing and visual data interpretation

### ✅ **Monitoring & Compliance**
- Structured audit logging
- File-based log storage
- Log management API
- Export capabilities (JSON/CSV)

## � **Documentation Files**

- `backend/README.md` - Backend-specific documentation
- `backend/SWAGGER-API-DOCUMENTATION.md` - Complete API reference
- `backend/LOCAL-LLM-INTEGRATION.md` - LLM integration guide
- `backend/LLM-INTEGRATION-COMPLETE.md` - Integration completion summary
- `backend/API-TESTING-TOKENS.md` - JWT testing guide
- `backend/ROLES-DOCUMENTATION.md` - RBAC system details
- `backend/LOGGING-SYSTEM.md` - Audit logging documentation

## 🚀 **Getting Started Checklist**

### ✅ **Immediate Setup (5 minutes)**
1. Clone repository: `git clone https://github.com/sahilgoyal7214/MUFG.git`
2. Install dependencies: `pnpm install`
3. Start server: `pnpm start`
4. Generate test token: `node backend/generate-test-token.js regulator`
5. Test API: Open `http://localhost:4000/api-docs`

### ✅ **Full Feature Testing**
1. **Authentication**: Test JWT tokens in Swagger UI
2. **Member Data**: Test pension data retrieval and updates
3. **KPI Calculations**: Test your financial calculation functions
4. **Chatbot**: Test AI-powered pension guidance
5. **Graph Insights**: Test visual analysis of pension fund charts
6. **Analytics**: Test role-based dashboard data
7. **Audit Logs**: Test compliance monitoring (regulator access)

### ✅ **Optional: LLM Enhancement**
1. Set up local LLM server at `localhost:5000/chat` for chatbot
2. Set up LLaVA model at `localhost:11434/api/generate` for graph analysis  
3. Test enhanced chatbot responses
4. Test graph analysis capabilities
5. Monitor response sources in server logs

## 🐳 **Docker Support**

```bash
# Build and run with Docker
docker build -t mufg-backend ./backend
docker run -p 4000:4000 mufg-backend
```

## 🔧 **Development**

### Adding New Endpoints
1. Create route in `backend/src/routes/`
2. Add Swagger documentation with `@swagger` comments
3. Update OpenAPI schemas in `backend/src/config/swagger.js`
4. Test in Swagger UI

### Database Integration
- Azure PostgreSQL configuration ready in `.env`
- Models available in `backend/src/models/`
- Migrations folder: `backend/database/migrations/`

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@mufg.com or create an issue on GitHub.

## 📝 License

This project is licensed under the MIT License.

## 🏆 **Project Status**

**✅ COMPLETE**: Production-ready MUFG Pension Insights Backend API

### **What's Working:**
- 🔐 **JWT Authentication** with role-based access control
- 📊 **Complete API Documentation** with interactive Swagger UI
- 🤖 **AI-Enhanced Chatbot** with local LLM integration
- 💰 **Financial Calculation Engine** with your custom functions
- 📋 **Audit Logging System** for compliance monitoring
- 🛡️ **Security Features** (Helmet, CORS, rate limiting, validation)
- 🧪 **Testing Tools** with JWT token generation

### **Ready For:**
- Frontend integration with NextAuth
- Database connection (Azure PostgreSQL configured)
- Production deployment
- API testing and validation
- LLM server integration

**🚀 Start testing immediately at: http://localhost:4000/api-docs**
