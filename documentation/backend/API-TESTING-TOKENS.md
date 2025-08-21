# 🎫 JWT Tokens for MUFG API Testing

## 🚀 Quick Start Guide

Your MUFG backend server is running at: **http://localhost:4000**
Swagger UI available at: **http://localhost:4000/api-docs**

## 🔑 Test Tokens (Valid for 24 hours)

### 👤 MEMBER Token
**User:** Bob Member (member@mufg.com)  
**Permissions:** Personal data access, chatbot  
**Token:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNRU0wMDEiLCJlbWFpbCI6Im1lbWJlckBtdWZnLmNvbSIsInJvbGUiOiJNRU1CRVIiLCJuYW1lIjoiQm9iIE1lbWJlciIsInBlcm1pc3Npb25zIjpbIkFOQUxZVElDU19WSUVXX09XTiIsIk1FTUJFUl9EQVRBX1JFQURfT1dOIiwiQ0hBVEJPVF9BQ0NFU1MiXSwiaWF0IjoxNzU1NDYzMTkwLCJleHAiOjE3NTU1NDk1OTAsImlzcyI6Im11ZmctcGVuc2lvbi1pbnNpZ2h0cyIsImF1ZCI6Im11ZmctYXBpIn0.d9QLBgkYATLUT6KYowAeUVBFRy-z98UAee-HcJ_lllU
```

### 🏛️ REGULATOR Token (Recommended for testing)
**User:** John Regulator (regulator@mufg.com)  
**Permissions:** Full access to all endpoints  
**Token:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJSRUcwMDEiLCJlbWFpbCI6InJlZ3VsYXRvckBtdWZnLmNvbSIsInJvbGUiOiJSRUdVTEFUT1IiLCJuYW1lIjoiSm9obiBSZWd1bGF0b3IiLCJwZXJtaXNzaW9ucyI6WyJVU0VSX1JFQURfQUxMIiwiQU5BTFlUSUNTX1ZJRVdfQUxMIiwiQVVESVRfTE9HUyIsIk1FTUJFUl9EQVRBX1JFQURfQUxMIl0sImlhdCI6MTc1NTQ2MzIxMCwiZXhwIjoxNzU1NTQ5NjEwLCJpc3MiOiJtdWZnLXBlbnNpb24taW5zaWdodHMiLCJhdWQiOiJtdWZnLWFwaSJ9.2qKPbbXyjuS0HPAphDMhdJcpIEUGAVysZB4MhparZO0
```

## 📱 How to Use in Swagger UI

### Step 1: Open Swagger UI
Go to: **http://localhost:4000/api-docs**

### Step 2: Authorize
1. Click the **"Authorize"** button (🔓 lock icon at the top right)
2. In the popup, paste one of the tokens above (including "Bearer ")
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Test Endpoints
Now you can test any endpoint! The green lock icons 🔒 will show you're authenticated.

## 🧪 Recommended Testing Flow

### 1. Start with Authentication
- **GET** `/api/auth/me` - Verify your token works

### 2. Test Member Data
- **GET** `/api/members/MEM001` - Get member data
- **GET** `/api/members/MEM001/contributions` - View contributions
- **GET** `/api/members/MEM001/projections` - See retirement projections

### 3. Test KPI Calculations
- **GET** `/api/kpi/retirement-age?currentAge=30&targetCorpus=500000&monthlyIncome=5000`
- **GET** `/api/kpi/total-corpus?monthlyContribution=1000&years=30&interestRate=0.07`
- **GET** `/api/kpi/retirement-readiness?age=35&salary=50000&currentBalance=75000`

### 4. Test Chatbot (with LLM integration)
- **POST** `/api/chatbot/message`
  ```json
  {
    "message": "How should I plan for retirement?"
  }
  ```

### 5. Test Analytics (Regulator token required)
- **GET** `/api/analytics/dashboard`

### 6. Test Audit Logs (Regulator token required)
- **GET** `/api/logs/files`
- **GET** `/api/logs/AUTHENTICATION/2025-08-17`

## 🔧 Generate New Tokens

If tokens expire, generate new ones:

```bash
# For member access
node generate-test-token.js member

# For full access (recommended)
node generate-test-token.js regulator

# For advisor access
node generate-test-token.js advisor
```

## 💡 Quick cURL Tests

### Test Authentication
```bash
curl -H "Authorization: Bearer [TOKEN]" http://localhost:4000/api/auth/me
```

### Test Member Data
```bash
curl -H "Authorization: Bearer [TOKEN]" http://localhost:4000/api/members/MEM001
```

### Test Chatbot
```bash
curl -X POST -H "Authorization: Bearer [TOKEN]" \
     -H "Content-Type: application/json" \
     -d '{"message":"What is my pension balance?"}' \
     http://localhost:4000/api/chatbot/message
```

### Test KPI Calculation
```bash
curl -H "Authorization: Bearer [TOKEN]" \
     "http://localhost:4000/api/kpi/retirement-age?currentAge=30&targetCorpus=500000&monthlyIncome=5000"
```

## 🎯 What to Test

### ✅ Core Features
- [x] JWT Authentication working
- [x] Role-based access control
- [x] Member data retrieval
- [x] KPI calculations (your financial functions)
- [x] Chatbot with LLM integration
- [x] Analytics dashboard
- [x] Audit logging system

### 🤖 LLM Features to Test
- Try chatbot with general questions (uses LLM if available)
- Test retirement projection advice (hybrid data + AI)
- Check response sources in server logs
- Verify fallback when LLM unavailable

### 🔐 Security Features to Test
- Try endpoints without token (should get 401)
- Try member endpoints with member token (should work)
- Try admin endpoints with member token (should get 403)

## 🚨 Troubleshooting

### Token Issues
- Make sure to include "Bearer " before the token
- Check token hasn't expired (24-hour validity)
- Generate new token if needed

### Server Issues
- Verify server running: `lsof -ti:4000`
- Check server logs for errors
- Restart if needed: `pnpm start`

### LLM Issues
- LLM integration gracefully falls back if server unavailable
- Check LOCAL_LLM_URL in .env file
- Monitor server logs for LLM connection attempts

## 📊 Expected Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Errors return:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

Happy testing! 🎉
