# MUFG Pension Insights Platform - Architecture Overview

## Project Structure

```
mufg/
├── backend/                    # Node.js/Express backend server
│   ├── src/                   # Source code
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # Data models
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Input validation
│   ├── database/             # Database files and migrations
│   ├── logs/                 # Application logs
│   │   └── archive/          # Archived log files
│   ├── reference/            # Reference materials
│   │   └── python_logic/     # Original Python logic for reference
│   ├── scripts/              # Utility scripts
│   ├── tests/                # Test files
│   │   ├── unit/             # Unit tests
│   │   ├── integration/      # Integration tests
│   │   ├── performance/      # Performance tests
│   │   └── scripts/          # Test scripts
│   └── tools/                # Development tools
├── documentation/             # Project documentation
│   └── backend/              # Backend-specific documentation
├── testing/                  # Testing and analysis
│   ├── testsprite/           # TestSprite test results
│   └── model_training/       # ML model training notebooks
└── .github/                  # GitHub workflows and templates
```

## Key Components

### Backend Services
- **Express.js API Server** (Port 4000)
- **SQLite Database** with pension data
- **JWT Authentication** with role-based permissions
- **Swagger/OpenAPI Documentation** at `/api-docs`
- **Comprehensive Logging System**

### API Modules
- **Advisor Services**: Portfolio optimization, risk alerts, contribution recommendations
- **Analytics**: Dashboard data, reports, data export
- **Member Management**: CRUD operations for pension members
- **Authentication**: Login, token management
- **KPI Calculations**: Retirement planning metrics
- **Chatbot Integration**: LLM-powered pension guidance

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load and stress testing
- **TestSprite**: Automated test generation and execution

### Documentation
- **API Documentation**: Swagger/OpenAPI 3.0 specifications
- **Setup Guides**: Installation and configuration
- **Business Logic**: Service documentation
- **Architecture**: System design and patterns

## Development Workflow

1. **Local Development**: Use nodemon for hot reloading
2. **Testing**: Run comprehensive test suites
3. **Documentation**: Auto-generated API docs
4. **Logging**: Structured logging with log rotation
5. **Validation**: Input validation and error handling

## Deployment Considerations

- **Environment Variables**: Secure configuration management
- **Database**: SQLite for development, consider PostgreSQL for production
- **Authentication**: JWT tokens with configurable expiration
- **Monitoring**: Comprehensive logging and health checks
- **Security**: Helmet.js, CORS, input validation

## Recent Enhancements

- ✅ Complete Swagger/OpenAPI 3.0 documentation
- ✅ Enhanced what-if scenarios with retirement target analysis
- ✅ Alphanumeric user ID support across all endpoints
- ✅ Comprehensive advisor service suite (14 endpoints)
- ✅ Organized project structure with proper separation of concerns
