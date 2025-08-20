# MUFG Pension Insights Backend API

## � NextAuth Integration

**Important**: This backend integrates with NextAuth running on the frontend.

- **Authentication (login/register)** is handled by NextAuth on the frontend
- **Token verification** and **API authorization** is handled by this backend
- Frontend sends JWT tokens in `Authorization: Bearer <token>` headers
- Backend verifies tokens and provides role-based access control

## �📁 Professional Folder Structure

```
backend/
├── app.js                          # Main application entry point
├── package.json                    # Dependencies and scripts
├── .env                           # Environment variables
├── .env.example                   # Environment template
│
├── src/                           # Source code
│   ├── config/                    # Configuration files
│   │   ├── database.js           # Database configuration
│   │   ├── nextauth.js           # NextAuth integration
│   │   └── roles.js              # Role-based access control
│   │
│   ├── controllers/               # Request handlers
│   │   ├── ChatbotController.js  # Chatbot interactions
│   │   ├── MemberDataController.js # Member data operations
│   │   ├── UserController.js     # User management
│   │   └── AnalyticsController.js # Analytics & reporting
│   │
│   ├── middleware/                # Custom middleware
│   │   ├── auth.js               # Authentication & authorization
│   │   ├── validation.js         # Request validation
│   │   └── rateLimit.js          # Rate limiting
│   │
│   ├── models/                    # Data models
│   │   ├── User.js               # User entity
│   │   ├── MemberData.js         # Member pension data
│   │   └── AuditLog.js           # Audit logging
│   │
│   ├── routes/                    # API routes
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User management routes
│   │   ├── members.js            # Member data routes
│   │   ├── chatbot.js            # Chatbot API routes
│   │   └── analytics.js          # Analytics routes
│   │
│   ├── services/                  # Business logic
│   │   ├── ChatbotService.js     # AI chatbot service
│   │   ├── AuditService.js       # Audit logging service
│   │   ├── AnalyticsService.js   # Data analytics service
│   │   └── NotificationService.js # Notifications
│   │
│   ├── utils/                     # Utility functions
│   │   ├── encryption.js         # Data encryption
│   │   ├── validation.js         # Input validation
│   │   └── helpers.js            # General helpers
│   │
│   └── validators/                # Input validation schemas
│       ├── memberData.js         # Member data validation
│       ├── user.js               # User validation
│       └── chatbot.js            # Chatbot input validation
│
├── database/                      # Database files
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
│
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── fixtures/                 # Test data
│
└── logs/                         # Application logs
    ├── access.log               # Request logs
    ├── error.log                # Error logs
    └── audit.log                # Audit logs
```

## 🚀 Key Features

### 1. **Role-Based Access Control (RBAC)**
- Three-tier role system: Regulator, Advisor, Member
- Pension-specific permissions (data access, analytics, compliance)
- Middleware-based authorization

### 2. **NextAuth Integration**
- JWT token verification
- User session management
- Seamless frontend integration

### 3. **Chatbot API**
- Natural language processing with local LLM integration
- Context-aware responses with intelligent fallback
- Member data integration for personalized advice
- Conversation history and intent recognition
- Privacy-focused AI processing (local LLM support)

### 4. **Member Data Management**
- Secure data access
- Role-based data filtering
- Audit logging
- Analytics integration

### 5. **Security Features**
- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation
- File-based audit logging system

### 6. **Logging & Compliance**
- Comprehensive audit trails
- File-based log storage (`/logs` directory)
- Log management API for regulators
- Automatic log rotation and cleanup
- Export capabilities (JSON/CSV)

### 7. **AI Integration**
- Local LLM support for enhanced chatbot responses
- Privacy-focused AI processing (no external API calls)
- Intelligent fallback system for reliability
- Context-aware prompt generation
- Hybrid AI + structured responses

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Member Data
- `GET /api/members/:memberId` - Get member data
- `PUT /api/members/:memberId` - Update member data
- `GET /api/members/:memberId/contributions` - Get contributions
- `GET /api/members/:memberId/projections` - Get projections
- `GET /api/members/:memberId/dashboard` - Get dashboard data

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history` - Get conversation history
- `GET /api/chatbot/capabilities` - Get bot capabilities
- `DELETE /api/chatbot/history` - Clear conversation history

### Analytics
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/reports` - Generate reports
- `POST /api/analytics/export` - Export data

### Logs Management (Regulator Only)
- `GET /api/logs/files` - Get available log files
- `GET /api/logs/:type/:date` - Get logs for specific date/type
- `GET /api/logs/stats/:type/:date` - Get log statistics
- `GET /api/logs/export/:type/:date` - Export logs (JSON/CSV)
- `POST /api/logs/cleanup` - Clean up old log files

## 🔧 Configuration

### Environment Variables
```env
# Server
PORT=4000
NODE_ENV=development

# NextAuth
NEXTAUTH_SECRET=your-secret-key

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_NAME=pension_insights

# Frontend
FRONTEND_URL=http://localhost:3000

# Local LLM Integration (optional)
LOCAL_LLM_URL=http://localhost:5000/chat
```

## 🛡️ Security Implementation

### 1. **Authentication Middleware**
- JWT token verification
- User context injection
- Token expiration handling

### 2. **Authorization Middleware**
- Permission-based access control
- Role validation
- Resource-specific access

### 3. **Data Protection**
- Member data access control
- Audit logging
- Input sanitization

## 🤖 Chatbot Features

### 1. **Intent Recognition**
- Balance inquiries
- Contribution information
- Retirement projections
- Investment performance
- Risk profile management

### 2. **Context Awareness**
- User role consideration
- Member data integration
- Conversation history
- Personalized responses

### 3. **Response Generation**
- Natural language responses with local LLM integration
- AI-enhanced advice with intelligent fallback system
- Data-driven insights combined with contextual guidance
- Action suggestions and personalized recommendations
- Privacy-focused processing (no external AI APIs)
- Hybrid approach: structured data + AI insights

## 📈 Analytics & Reporting

### 1. **Member Analytics**
- Contribution tracking
- Performance metrics
- Projection calculations
- Risk assessment

### 2. **System Analytics**
- API usage metrics
- User activity tracking
- Error monitoring
- Performance monitoring

## 🔄 Development Workflow

1. **Setup**: Clone repository and install dependencies
2. **Environment**: Configure environment variables
3. **Database**: Run migrations and seeders
4. **Development**: Start development server
5. **Testing**: Run unit and integration tests
6. **Deployment**: Build and deploy to production

This professional folder structure provides a solid foundation for your ExpressJS backend with role-based access control, NextAuth integration, and chatbot functionality.
