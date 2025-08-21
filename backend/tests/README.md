# Backend Testing Suite

This directory contains comprehensive testing suites for the MUFG Pension Insights Backend API.

## Directory Structure

```
tests/
├── integration/          # Integration tests for API endpoints
│   ├── test-suite.js     # Main comprehensive test suite (100% success rate)
│   └── enhanced-test-suite.js  # Edge case and advanced testing
├── performance/          # Performance and stress testing
│   └── stress-test-suite.js    # Load testing and performance metrics
├── unit/                 # Unit tests for individual components
│   ├── services/         # Service layer unit tests
│   │   ├── GraphInsightsService.test.js  # Graph analysis tests
│   │   ├── ChatbotService.test.js        # Chatbot service tests
│   │   └── AuditService.test.js          # Audit logging tests
│   ├── test-auth.js      # Authentication unit tests
│   └── test-db.js        # Database unit tests
└── scripts/              # Test automation scripts
    ├── comprehensive-api-test.sh
    ├── test-chatbot-llm.sh
    ├── test-pension-data-api.sh
    └── test-pension-data-simple.sh
```

## Running Tests

### Integration Tests
```bash
# Run main comprehensive test suite (recommended)
node tests/integration/test-suite.js

# Run enhanced edge case tests
node tests/integration/enhanced-test-suite.js
```

### Performance Tests
```bash
# Run stress testing
node tests/performance/stress-test-suite.js
```

### Unit Tests
```bash
# Run authentication tests
node tests/unit/test-auth.js

# Run database tests
node tests/unit/test-db.js

# Run service-specific tests
node tests/unit/services/GraphInsightsService.test.js
node tests/unit/services/ChatbotService.test.js
node tests/unit/services/AuditService.test.js
```

### Shell Scripts
```bash
# Run comprehensive API testing
chmod +x tests/scripts/comprehensive-api-test.sh
./tests/scripts/comprehensive-api-test.sh

# Test chatbot functionality
chmod +x tests/scripts/test-chatbot-llm.sh
./tests/scripts/test-chatbot-llm.sh
```

## Test Results Summary

### Latest Test Results
- **Functional Tests**: ✅ 100% (10/10 passed)
- **Enhanced Tests**: ⚠️ 72.7% (8/11 passed) 
- **Stress Tests**: ⚠️ 94.49% success rate (2,032 requests)

### Performance Metrics
- **Average Response Time**: 35.46ms
- **95th Percentile**: 107.54ms
- **99th Percentile**: 168.59ms

## Test Coverage

### Functional Coverage
- ✅ Authentication & Authorization
- ✅ CRUD Operations (Pension Data)
- ✅ AI Chatbot Integration
- ✅ Graph Insights with LLaVA Vision Model
- ✅ KPI Calculations
- ✅ Analytics Dashboard
- ✅ Audit Logging
- ✅ Member Data Management
- ✅ User Management
- ✅ Image Processing & Base64 Handling

### Edge Cases Tested
- ✅ Invalid authentication tokens
- ✅ Missing authentication headers
- ✅ Pagination boundary values
- ✅ Invalid data type validation
- ✅ Non-existent resource access
- ⚠️ Concurrent data modification (needs improvement)
- ✅ Large data input handling
- ✅ Chatbot edge cases

### Performance Testing
- ✅ Load testing with concurrent users
- ✅ Response time analysis
- ✅ Error rate monitoring
- ✅ Database performance under stress

## Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure backend server is running
   npm run dev  # or pnpm dev
   ```

2. **Authentication Token**
   - Tests use a fixed JWT token for authentication
   - Token is auto-generated in test suites
   - Manual token generation available in `../tools/`

3. **Database**
   - PostgreSQL or SQLite database must be accessible
   - Test data is created and cleaned up automatically

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend server is running on port 4000
   - Check database connectivity

2. **Authentication Failures**
   - Verify JWT token is valid and not expired
   - Check user permissions in test token

3. **Database Errors**
   - Ensure database schema is up to date
   - Check database connection string in `.env`

### Debug Mode
```bash
# Enable debug logging
DEBUG=* node tests/integration/test-suite.js
```

## Contributing

When adding new tests:

1. **Unit Tests**: Add to `unit/` directory for testing individual functions
2. **Integration Tests**: Add to `integration/` for testing API endpoints
3. **Performance Tests**: Add to `performance/` for load/stress testing
4. **Scripts**: Add automation scripts to `scripts/` directory

### Test Naming Convention
- `test-[component].js` for unit tests
- `[feature]-test-suite.js` for integration tests
- `[type]-test-suite.js` for performance tests

---

*Last Updated: August 19, 2025*  
*Backend Version: 1.0.0*
