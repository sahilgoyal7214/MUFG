# 📚 API Documentation with Swagger

Your MUFG Pension Insights backend now includes comprehensive **Swagger/OpenAPI 3.0 documentation**!

## 🚀 Access the Documentation

### **Interactive API Explorer**
Visit: **http://localhost:4000/api-docs**

- **Test endpoints directly** in your browser
- **Explore all API routes** with detailed descriptions
- **Try out requests** with authentication
- **View response schemas** and examples

### **API Overview**
Visit: **http://localhost:4000/api**

```json
{
  "api": "MUFG Pension Insights Backend",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users", 
    "members": "/api/members",
    "chatbot": "/api/chatbot",
    "analytics": "/api/analytics",
    "logs": "/api/logs",
    "kpi": "/api/kpi"
  },
  "documentation": {
    "swagger": "/api-docs",
    "openapi": "/api-docs.json"
  }
}
```

## 📖 Documentation Features

### **🔐 Authentication Documentation**
- JWT Bearer token authentication
- Role-based access control explanations
- Example login/verification flows

### **💰 KPI Calculations API**
Complete documentation for your financial calculation functions:

| Endpoint | Description | Your Function |
|----------|-------------|---------------|
| `POST /api/kpi/retirement-age` | Calculate when target corpus is achievable | `calculateRetirementAge()` |
| `POST /api/kpi/total-corpus` | Project total savings at retirement | `predictTotalCorpus()` |
| `POST /api/kpi/retirement-readiness` | Comprehensive readiness analysis | `calculateRetirementReadiness()` |

### **📊 Complete API Coverage**
- **Authentication**: Token verification, user sessions
- **Members**: Pension data management
- **Analytics**: Data insights and reporting  
- **Logs**: Audit trail management (Regulator only)
- **KPI**: Financial calculations and projections

### **🎯 Interactive Features**
- **Try It Out** buttons for testing endpoints
- **Request/Response examples** with real data
- **Schema validation** with parameter descriptions
- **Authentication testing** with JWT tokens
- **Error handling** documentation

## 🔧 Technical Implementation

### **Swagger Setup**
- **swagger-ui-express**: Interactive documentation UI
- **swagger-jsdoc**: JSDoc comment parsing
- **OpenAPI 3.0**: Modern API specification

### **Documentation Sources**
- Route files: `src/routes/*.js`
- Configuration: `src/config/swagger.js`
- Schemas: Defined in swagger config

### **Security Documentation**
- Bearer token authentication
- Role-based permissions (member/advisor/regulator)
- API endpoint authorization requirements

## 🎉 Benefits

### **For Developers**
- **Easy API testing** without external tools
- **Clear endpoint documentation** with examples
- **Schema validation** and error handling
- **Authentication flow** understanding

### **For Integration**
- **OpenAPI spec** available at `/api-docs.json`
- **Standard format** for code generation
- **Complete API reference** for frontend development
- **Professional documentation** for stakeholders

## 🚀 Usage Examples

### **Testing KPI Functions**
```bash
# Test retirement age calculation
curl -X POST http://localhost:4000/api/kpi/retirement-age \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAge": 30,
    "targetCorpus": 1000000,
    "annualInvestment": 12000,
    "annualReturn": 0.08,
    "currentCorpus": 50000
  }'
```

### **Interactive Testing**
1. Visit http://localhost:4000/api-docs
2. Click "Authorize" and enter your JWT token
3. Expand any endpoint section
4. Click "Try it out"
5. Fill in parameters and click "Execute"

Your backend now has **professional-grade API documentation** that makes it easy to understand, test, and integrate with all your pension management features! 🎊
