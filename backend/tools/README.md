# Development Tools

This directory contains utility tools and debugging scripts for the MUFG Pension Insights Backend development, including authentication, testing, and API validation tools.

## Available Tools

### Authentication Tools

#### `generate-fixed-test-token.js`
Generates a fixed JWT token for testing purposes with predefined user permissions.

```bash
node tools/generate-fixed-test-token.js
```

**Features:**
- Fixed expiration date for consistent testing
- Regulator role with full permissions
- Compatible with all test suites
- Ready for Swagger UI authorization

#### `generate-test-token.js`
Generates dynamic JWT tokens for various testing scenarios and user roles.

```bash
# Generate tokens for different roles
node tools/generate-test-token.js regulator
node tools/generate-test-token.js advisor
node tools/generate-test-token.js member
```

**Features:**
- Support for all three user roles (regulator, advisor, member)
- Configurable user roles and permissions
- Custom expiration times
- Multiple user scenarios
- Role-specific permission sets

#### `debug-token.js`
Debugging utility for JWT token analysis and validation.

```bash
node tools/debug-token.js [token]
```

**Features:**
- Token payload inspection
- Expiration time validation
- Permission analysis
- Signature verification

### Testing Utilities

#### `quick-test.js`
Quick health check and basic functionality test for the API.

```bash
node tools/quick-test.js
```

**Features:**
- Fast API health check
- Basic endpoint validation
- Database connectivity test
- Authentication verification

#### `simple-auth-test.js`
Simplified authentication testing tool.

```bash
node tools/simple-auth-test.js
```

**Features:**
- Authentication flow testing
- Token validation
- Permission checking
- Role-based access testing

## Usage Examples

### Generate Test Token for Development
```bash
# Generate a fixed token for consistent testing
node tools/generate-fixed-test-token.js

# Copy the generated token for use in API testing tools
```

### Debug Authentication Issues
```bash
# Analyze a problematic token
node tools/debug-token.js "eyJhbGciOiJIUzI1NiIs..."

# Check token expiration and permissions
```

### Quick API Health Check
```bash
# Verify API is working correctly
node tools/quick-test.js

# Should return green checkmarks for all systems
```

### Test Authentication Flow
```bash
# Test complete authentication workflow
node tools/simple-auth-test.js

# Verify token generation and validation
```

## Tool Configuration

### Environment Variables
Most tools use the following environment variables:
- `JWT_SECRET`: Secret key for token signing
- `DATABASE_URL`: Database connection string
- `NODE_ENV`: Environment (development/test/production)

### Default Settings
```javascript
const DEFAULT_CONFIG = {
  expiresIn: '1y',        // Token expiration
  issuer: 'mufg-pension-insights',
  audience: 'mufg-api',
  algorithm: 'HS256'
};
```

## Development Workflow

### 1. API Development Cycle
```bash
# 1. Quick health check
node tools/quick-test.js

# 2. Generate test token
node tools/generate-fixed-test-token.js

# 3. Run comprehensive tests
node tests/integration/test-suite.js

# 4. Debug any issues
node tools/debug-token.js [problematic-token]
```

### 2. Authentication Debugging
```bash
# 1. Test basic auth flow
node tools/simple-auth-test.js

# 2. Generate fresh token
node tools/generate-test-token.js

# 3. Analyze token details
node tools/debug-token.js [new-token]
```

### 3. Performance Testing Preparation
```bash
# 1. Generate performance test tokens
node tools/generate-test-token.js --role=regulator --batch=10

# 2. Run quick validation
node tools/quick-test.js

# 3. Execute stress tests
node tests/performance/stress-test-suite.js
```

## Tool Dependencies

### Required Packages
- `jsonwebtoken`: JWT token operations
- `axios`: HTTP client for API testing
- `dotenv`: Environment variable management
- `bcryptjs`: Password hashing (if needed)

### Database Tools
Some tools require database connectivity:
- PostgreSQL client (`pg`)
- SQLite client (`better-sqlite3`)

## Troubleshooting

### Common Issues

#### "JWT Secret Not Found"
```bash
# Ensure .env file exists with JWT_SECRET
echo 'JWT_SECRET=your-secret-key' >> .env
```

#### "Database Connection Failed"
```bash
# Check DATABASE_URL in .env
echo 'DATABASE_URL=postgresql://user:pass@localhost:5432/db' >> .env
```

#### "Token Expired"
```bash
# Generate new token
node tools/generate-fixed-test-token.js
```

#### "Permission Denied"
```bash
# Check token permissions
node tools/debug-token.js [your-token]
```

### Debug Mode
Enable verbose logging:
```bash
DEBUG=* node tools/[tool-name].js
```

## Adding New Tools

### Tool Template
```javascript
#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

/**
 * [Tool Description]
 * Usage: node tools/my-tool.js [args]
 */

async function main() {
  try {
    console.log('🔧 [Tool Name] Starting...');
    
    // Tool logic here
    
    console.log('✅ [Tool Name] Completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
```

### Best Practices
1. **Error Handling**: Always include try-catch blocks
2. **Logging**: Use consistent emoji prefixes for output
3. **Documentation**: Include usage examples in comments
4. **Configuration**: Use environment variables for settings
5. **Testing**: Ensure tools work in different environments

---

*Last Updated: August 19, 2025*  
*Backend Version: 1.0.0*
