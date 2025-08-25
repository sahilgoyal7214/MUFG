# MUFG Pension Insights Platform

A comprehensive full-stack application for pension data analysis, insights, and AI-powered guidance. Built with Next.js 15, NextAuth.js, Express.js backend, and local LLM integration.

## 🚀 **Current Status: Full-Stack Production Ready**

✅ **Complete Full-Stack Application** with modern UI/UX  
✅ **Next.js 15 Frontend** with App Router and Tailwind CSS  
✅ **NextAuth.js Authentication** with JWT session management  
✅ **Role-Based Dash## 📁 **Documentation Files**

### Frontend Documentation
- `frontend/README.md` - Frontend-specific setup and development guide
- `documentation/NEXTAUTH-SETUP-COMPLETE.md` - NextAuth integration details
- `documentation/ADVISOR-DASHBOARD-ENHANCED.md` - Dashboard implementation guide

### Backend Documentation
- `backend/README.md` - Backend-specific documentation
- `documentation/backend/SWAGGER-API-DOCUMENTATION.md` - Complete API reference
- `documentation/backend/LOCAL-LLM-INTEGRATION.md` - LLM integration guide
- `documentation/backend/API-TESTING-TOKENS.md` - JWT testing guide
- `documentation/backend/ROLES-DOCUMENTATION.md` - RBAC system details
- `documentation/backend/LOGGING-SYSTEM.md` - Audit logging documentation

### Project Documentation
- `documentation/PROJECT-SETUP-COMPLETE.md` - Complete setup guide
- `documentation/CHART-FIX-SUMMARY.md` - Charts and visualization guide
- `documentation/ENVIRONMENT-STATUS.md` - Environment configuration statustem** (Member, Advisor, Regulator)  

✅ **Interactive Charts & Analytics** with real-time data  
✅ **Comprehensive Backend API** with role-based access control  
✅ **Swagger/OpenAPI Documentation** at `/api-docs`  
✅ **Local LLM Integration** for AI-powered chatbot  
✅ **Graph Analysis Service** using LLaVA vision model  
✅ **Financial Calculation Engine** with custom functions  
✅ **Audit Logging System** for compliance  
✅ **Professional UI Components** with dark mode support  
✅ **Organized Project Structure** with proper separation of concerns

## 🏗️ Project Structure

```
MUFG/
├── frontend/                   # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/               # App Router (Next.js 15)
│   │   │   ├── (auth)/        # Authentication pages
│   │   │   │   ├── login/     # Login page with NextAuth
│   │   │   │   └── signup/    # Registration page
│   │   │   ├── api/           # API routes and proxy handlers
│   │   │   │   ├── auth/      # NextAuth configuration
│   │   │   │   └── proxy/     # Backend API proxy routes
│   │   │   ├── dashboard/     # Protected dashboard pages
│   │   │   ├── globals.css    # Global styles
│   │   │   ├── layout.js      # Root layout
│   │   │   └── page.js        # Home page
│   │   ├── components/        # Reusable UI components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── charts/        # Chart components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   ├── roles/         # Role-based components
│   │   │   │   ├── AdvisorContent.js    # Advisor dashboard
│   │   │   │   ├── MemberContent.js     # Member dashboard
│   │   │   │   └── RegulatorContent.js  # Regulator dashboard
│   │   │   └── ui/            # Base UI components
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useApi.js      # API data fetching hooks
│   │   ├── lib/               # Utility libraries
│   │   │   ├── apiService.js  # Frontend API service
│   │   │   └── utils.js       # Utility functions
│   │   └── styles/            # Component styles
│   ├── public/                # Static assets
│   ├── .env.local            # Environment variables
│   ├── next.config.js        # Next.js configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                    # Node.js/Express Backend Server
│   ├── src/                   # Source code
│   │   ├── routes/            # API Routes
│   │   │   ├── auth.js        # Authentication & JWT verification
│   │   │   ├── users.js       # User management (role-based)
│   │   │   ├── members.js     # Member pension data
│   │   │   ├── kpi.js         # Financial calculations
│   │   │   ├── chatbot.js     # AI chatbot with LLM
│   │   │   ├── analytics.js   # Business analytics
│   │   │   ├── graph-insights.js # Graph analysis with LLaVA
│   │   │   └── logs.js        # Audit logging
│   │   ├── controllers/       # Business logic
│   │   ├── services/          # Core services
│   │   ├── middleware/        # Custom middleware
│   │   ├── config/            # Configuration
│   │   ├── models/            # Data models
│   │   ├── utils/             # Utilities
│   │   └── validators/        # Input validation
│   ├── database/              # Database and migrations
│   ├── logs/                  # Audit log files
│   ├── tests/                 # Test suites
│   ├── tools/                 # Development tools
│   ├── app.js                 # Main server file
│   └── package.json           # Backend dependencies
│
├── documentation/             # Centralized documentation
│   ├── backend/              # Backend-specific docs
│   ├── NEXTAUTH-SETUP-COMPLETE.md
│   ├── ADVISOR-DASHBOARD-ENHANCED.md
│   └── PROJECT-SETUP-COMPLETE.md
│
├── testing/                   # Testing materials and results
├── scripts/                   # Project maintenance scripts
├── cleanup-backup/            # Backup of cleaned files
└── package.json              # Root project configuration
```
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
- Git
- Optional: Local LLM server for enhanced chatbot

### Full-Stack Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilgoyal7214/MUFG.git
   cd MUFG
   ```

2. **Install all dependencies**
   ```bash
   # Install root dependencies
   pnpm install
   
   # Install frontend dependencies
   cd frontend && pnpm install && cd ..
   
   # Install backend dependencies
   cd backend && pnpm install && cd ..
   ```

3. **Environment Setup**
   ```bash
   # Frontend environment (.env.local is pre-configured)
   cd frontend
   # Check .env.local for NextAuth configuration
   
   # Backend environment (.env is pre-configured)
   cd ../backend
   # Check .env for database and API configuration
   ```

4. **Start the full application**
   ```bash
   # Start backend (from root directory)
   cd backend && pnpm start &
   
   # Start frontend (from root directory)
   cd frontend && pnpm dev
   ```

5. **Access the application**
   ```bash
   # Frontend Application: http://localhost:3000
   # Backend API Documentation: http://localhost:4000/api-docs
   ```

6. **Test with default credentials**
   ```bash
   # Login at http://localhost:3000/login with:
   # Username: advisor1
   # Password: password123
   # 
   # Or create new account at signup page
   ```

## 📋 Available Scripts

### Root Scripts
```bash
pnpm install              # Install all dependencies
pnpm run clean            # Clean all node_modules
```

### Frontend Scripts (from frontend/ directory)
```bash
pnpm dev                  # Start development server (localhost:3000)
pnpm build                # Build for production
pnpm start                # Start production server
pnpm lint                 # Run ESLint
```

### Backend Scripts (from backend/ directory)
```bash
pnpm start                # Start production server (localhost:4000)
pnpm run dev              # Start development server with nodemon
node generate-test-token.js [regulator|advisor|member]  # Generate JWT tokens
./test-chatbot-llm.sh     # Test LLM integration
```

### Development Scripts
```bash
# Start both frontend and backend in development
npm run dev               # Starts both servers concurrently

# Clean and rebuild everything
npm run clean && npm install && cd frontend && npm install && cd ../backend && npm install
```

## 🛠️ Tech Stack

**Frontend Framework:**
- Next.js 15 - React framework with App Router
- React 19 - Latest React with concurrent features
- NextAuth.js - Authentication and session management
- Tailwind CSS - Utility-first CSS framework
- Recharts - Composable charting library
- Heroicons - Beautiful hand-crafted SVG icons

**Backend Framework:**
- Express.js - Web framework
- Node.js - Runtime environment
- JWT - Authentication & authorization
- Swagger/OpenAPI 3.0 - API documentation

**Database & Storage:**
- PostgreSQL - Production database (Azure ready)
- SQLite - Development and testing
- File-based logging - Audit trail storage

**Authentication & Security:**
- NextAuth.js - Frontend authentication
- JWT tokens - Secure session management
- Role-based access control (RBAC)
- Helmet - Security headers
- CORS - Cross-origin resource sharing
- Rate limiting - API protection
- Input validation - Data sanitization

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

### Frontend Environment (.env.local)
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production

# Backend API URL
BACKEND_URL=http://localhost:4000
```

### Backend Environment (.env)
```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production

# Database (Azure PostgreSQL ready)
DATABASE_URL=postgresql://username:password@host:5432/database

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

## 🌟 **Key Features**

### ✅ **Full-Stack Application**
- Modern Next.js 15 frontend with App Router
- Responsive design with Tailwind CSS
- Role-based dashboard system
- Real-time interactive charts and analytics
- Professional UI components with dark mode support

### ✅ **Authentication & Security**
- NextAuth.js integration with JWT sessions
- Role-based access control (Member, Advisor, Regulator)
- Secure API proxy routes with token management
- Session-aware frontend components
- Protected routes and middleware

### ✅ **Production Ready Backend**
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
- Interactive financial dashboards

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
- Real-time system monitoring

## � **Documentation Files**

- `backend/README.md` - Backend-specific documentation
- `backend/SWAGGER-API-DOCUMENTATION.md` - Complete API reference
- `backend/LOCAL-LLM-INTEGRATION.md` - LLM integration guide
- `backend/LLM-INTEGRATION-COMPLETE.md` - Integration completion summary
- `backend/API-TESTING-TOKENS.md` - JWT testing guide
- `backend/ROLES-DOCUMENTATION.md` - RBAC system details
- `backend/LOGGING-SYSTEM.md` - Audit logging documentation

## 🚀 **Getting Started Checklist**

### ✅ **Frontend Setup (5 minutes)**
1. Clone repository: `git clone https://github.com/sahilgoyal7214/MUFG.git`
2. Install dependencies: `cd MUFG && pnpm install && cd frontend && pnpm install`
3. Start frontend: `pnpm dev`
4. Open application: `http://localhost:3000`
5. Login with test credentials: `advisor1 / password123`

### ✅ **Backend API Setup (5 minutes)**
1. Install backend dependencies: `cd backend && pnpm install`
2. Start backend server: `pnpm start`
3. Generate test token: `node generate-test-token.js regulator`
4. Test API: Open `http://localhost:4000/api-docs`
5. Test authentication in Swagger UI

### ✅ **Full Feature Testing**
1. **Frontend Authentication**: Test login/logout flow with NextAuth
2. **Role-Based Dashboards**: Test Member, Advisor, and Regulator views
3. **Interactive Charts**: Test pension data visualization
4. **Backend API**: Test all endpoints in Swagger UI
5. **Member Data**: Test pension data retrieval and updates
6. **KPI Calculations**: Test financial calculation functions
7. **Chatbot**: Test AI-powered pension guidance
8. **Graph Insights**: Test visual analysis of pension fund charts
9. **Analytics**: Test role-based dashboard data
10. **Audit Logs**: Test compliance monitoring (regulator access)

### ✅ **Optional: Enhanced Features**
1. Set up local LLM server at `localhost:5000/chat` for chatbot
2. Set up LLaVA model at `localhost:11434/api/generate` for graph analysis  
3. Test enhanced chatbot responses in frontend
4. Test graph analysis capabilities
5. Monitor response sources in server logs

### ✅ **Production Deployment**
1. Update environment variables for production
2. Build frontend: `cd frontend && pnpm build`
3. Configure production database
4. Deploy backend API server
5. Deploy frontend application
6. Test full application flow

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

**✅ COMPLETE**: Production-ready MUFG Pension Insights Full-Stack Application

### **What's Working:**
- 🌐 **Complete Full-Stack Application** with modern UI/UX
- 🔐 **NextAuth.js Authentication** with secure session management
- 📊 **Role-Based Dashboard System** with interactive charts
- 💼 **Professional UI Components** with dark mode support
- 🔗 **Frontend-Backend Integration** with secure API proxy routes
- 🔐 **JWT Authentication** with role-based access control
- 📊 **Complete API Documentation** with interactive Swagger UI
- 🤖 **AI-Enhanced Chatbot** with local LLM integration
- 💰 **Financial Calculation Engine** with custom functions
- 📋 **Audit Logging System** for compliance monitoring
- 🛡️ **Security Features** (Helmet, CORS, rate limiting, validation)
- 🧪 **Testing Tools** with JWT token generation

### **Technology Stack:**
- **Frontend**: Next.js 15, React 19, NextAuth.js, Tailwind CSS, Recharts
- **Backend**: Express.js, Node.js, JWT, Swagger/OpenAPI 3.0
- **Database**: PostgreSQL (production), SQLite (development)
- **AI/ML**: Local LLM integration, LLaVA vision model
- **Security**: Role-based access control, JWT sessions, input validation

### **Ready For:**
- Production deployment with scalable architecture
- Enterprise-level security and compliance
- Multi-tenant pension fund management
- AI-powered financial advisory services
- Real-time analytics and reporting
- Mobile-responsive pension planning tools

**🚀 Access the complete application:**
- **Frontend**: http://localhost:3000 (Login: advisor1/password123)
- **Backend API**: http://localhost:4000/api-docs (Interactive documentation)

### **Next Steps:**
- Deploy to production environment
- Configure production database
- Set up CI/CD pipeline
- Implement additional AI features
- Add mobile applications
- Scale for enterprise deployment
