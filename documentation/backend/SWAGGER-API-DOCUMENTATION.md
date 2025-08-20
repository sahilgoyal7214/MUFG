# MUFG Pension Insights - Complete API Documentation

## 🚀 Overview

The MUFG Pension Insights backend API now features comprehensive Swagger/OpenAPI 3.0 documentation for all endpoints. This provides interactive API documentation accessible at `http://localhost:4000/api-docs`.

## 📋 Documentation Features

### 🔧 Technical Implementation
- **OpenAPI 3.0 Specification**: Modern API documentation standard
- **Interactive Swagger UI**: Test endpoints directly from the browser
- **Automatic Documentation Generation**: Generated from JSDoc comments in route files
- **Comprehensive Schema Definitions**: All request/response models documented

### 🛡️ Security Documentation
- **Bearer Token Authentication**: JWT-based security scheme
- **Role-Based Access Control**: Documented permissions for each endpoint
- **Rate Limiting**: API usage limitations documented where applicable

## 📊 Documented Endpoint Categories

### 1. Authentication (`/api/auth`)
- **POST** `/api/auth/login` - User authentication with credentials
- **POST** `/api/auth/refresh` - JWT token refresh
- **POST** `/api/auth/logout` - User logout and token invalidation

### 2. Users Management (`/api/users`)
- **GET** `/api/users` - List users (role-based access)
- **GET** `/api/users/{userId}` - Get specific user details

### 3. KPI Calculations (`/api/kpi`)
- **GET** `/api/kpi/retirement-age` - Calculate optimal retirement age
- **GET** `/api/kpi/total-corpus` - Calculate total retirement corpus
- **GET** `/api/kpi/retirement-readiness` - Calculate retirement readiness score

### 4. Member Data (`/api/members`)
- **GET** `/api/members/{memberId}` - Get member pension data
- **PUT** `/api/members/{memberId}` - Update member data
- **GET** `/api/members/{memberId}/contributions` - Contribution history
- **GET** `/api/members/{memberId}/projections` - Retirement projections
- **GET** `/api/members/{memberId}/dashboard` - Dashboard data

### 5. Analytics (`/api/analytics`)
- **GET** `/api/analytics/dashboard` - Role-based analytics dashboard

### 6. Chatbot (`/api/chatbot`)
- **POST** `/api/chatbot/message` - Process chatbot interactions

### 7. Audit Logs (`/api/logs`)
- **GET** `/api/logs/files` - List available log files
- **GET** `/api/logs/{type}/{date}` - Get logs by type and date

## 🏗️ Schema Definitions

### Core Data Models
- **User**: User account information and role data
- **PensionData**: Comprehensive member pension information
- **KpiCalculation**: Retirement calculation results
- **ChatbotMessage**: Chatbot interaction data
- **AnalyticsDashboard**: Analytics and KPI metrics
- **AuditLog**: System audit log entries
- **Pagination**: Standardized pagination information
- **Error**: Standardized error response format

## 🎯 Key Features

### Financial Calculations
All your custom financial functions are documented:
- **Retirement Age Calculation**: Based on corpus and income requirements
- **Total Corpus Calculation**: Future value with compound interest
- **Retirement Readiness**: Comprehensive score with recommendations

### Role-Based Access
Documentation includes role-specific access patterns:
- **Regulators**: System-wide access to all data and analytics
- **Advisors**: Access to assigned client data
- **Members**: Personal data access only

### Comprehensive Examples
Each endpoint includes:
- Detailed parameter descriptions
- Request/response examples
- HTTP status code documentation
- Error response formats

## 🔍 API Testing

### Interactive Documentation
Access the Swagger UI at `http://localhost:4000/api-docs` to:
- Browse all available endpoints
- View detailed request/response schemas
- Test endpoints directly in the browser
- Authenticate with Bearer tokens

### OpenAPI JSON
Raw OpenAPI specification available at:
`http://localhost:4000/api-docs.json`

## 📁 File Structure

```
backend/src/
├── config/
│   └── swagger.js           # Complete OpenAPI 3.0 configuration
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── users.js            # User management endpoints
│   ├── kpi.js              # Financial calculation endpoints
│   ├── members.js          # Member data endpoints
│   ├── analytics.js        # Analytics endpoints
│   ├── chatbot.js          # Chatbot endpoints
│   └── logs.js             # Audit log endpoints
└── app.js                  # Main application with Swagger integration
```

## 🚀 Usage Examples

### Authentication
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### KPI Calculation
```bash
curl -X GET "http://localhost:4000/api/kpi/retirement-age?currentAge=30&targetCorpus=500000&monthlyIncome=5000" \
  -H "Authorization: Bearer your-jwt-token"
```

### Member Data
```bash
curl -X GET http://localhost:4000/api/members/M001 \
  -H "Authorization: Bearer your-jwt-token"
```

## 🛠️ Development Notes

### Adding New Endpoints
When adding new endpoints:
1. Add JSDoc `@swagger` comments above the route handler
2. Define request/response schemas in `/src/config/swagger.js`
3. Include proper authentication and authorization documentation
4. Test the documentation in Swagger UI

### Schema Updates
Update schemas in `/src/config/swagger.js` when:
- Adding new data models
- Changing existing response formats
- Adding new error types

## 🔧 Maintenance

### Regular Updates
- Keep documentation synchronized with code changes
- Update examples when API behavior changes
- Review and update schema definitions for accuracy

### Version Control
The API documentation follows semantic versioning:
- Current version: `1.0.0`
- Update version in swagger.js when making breaking changes

## ✅ Completion Status

All MUFG Pension Insights API endpoints are now fully documented with:
- ✅ Complete OpenAPI 3.0 specification
- ✅ Interactive Swagger UI interface
- ✅ Comprehensive schema definitions
- ✅ Authentication and authorization documentation
- ✅ Role-based access control documentation
- ✅ Financial calculation endpoint documentation
- ✅ Error handling and response format documentation
- ✅ Real-world examples and testing capabilities

The API documentation is production-ready and provides a comprehensive reference for all system endpoints.
