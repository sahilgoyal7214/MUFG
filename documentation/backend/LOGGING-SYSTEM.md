# MUFG Backend - File-Based Logging System

## Overview

The MUFG Pension Insights backend now uses a comprehensive file-based logging system that writes audit logs, authentication events, chatbot interactions, and system events to separate log files in the `/logs` directory.

## Log Types

### 1. **Data Access Logs** (`data_access-YYYY-MM-DD.log`)
Records all member data access events:
- View member data
- Update member data
- Export data
- Data filtering operations

### 2. **Authentication Logs** (`authentication-YYYY-MM-DD.log`)
Records all authentication events:
- Successful token verification
- Failed authentication attempts
- Login/logout events
- Token validation failures

### 3. **Chatbot Interaction Logs** (`chatbot_interaction-YYYY-MM-DD.log`)
Records all chatbot conversations:
- User messages and bot responses
- Intent recognition results
- Member ID associations
- Conversation context

### 4. **System Event Logs** (`system_event-YYYY-MM-DD.log`)
Records system-level events:
- Server start/stop
- API requests
- Configuration changes
- Error events
- Performance metrics

## Log File Format

All logs are written in **JSON Lines** format (one JSON object per line):

```json
{"id":"unique_id","userId":"user123","action":"READ_MEMBER_DATA","timestamp":"2025-08-17T19:14:14.042Z","type":"DATA_ACCESS","ipAddress":"192.168.1.1","userAgent":"Mozilla/5.0..."}
```

## Log File Structure

```
backend/logs/
├── authentication-2025-08-17.log
├── chatbot_interaction-2025-08-17.log
├── data_access-2025-08-17.log
├── system_event-2025-08-17.log
└── .gitkeep
```

## API Endpoints for Log Management

**Note**: All log management endpoints require `regulator` role with `AUDIT_LOGS` permission.

### Get Available Log Files
```
GET /api/logs/files
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "AUTHENTICATION",
      "date": "2025-08-17",
      "filename": "authentication-2025-08-17.log"
    }
  ]
}
```

### Get Logs for Specific Date and Type
```
GET /api/logs/:type/:date?limit=100&offset=0
```

**Example:**
```
GET /api/logs/data_access/2025-08-17?limit=50&offset=0
```

### Get Log Statistics
```
GET /api/logs/stats/:type/:date
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEntries": 25,
    "type": "DATA_ACCESS",
    "date": "2025-08-17",
    "breakdown": {
      "READ_MEMBER_DATA": 15,
      "UPDATE_MEMBER_DATA": 8,
      "EXPORT_DATA": 2
    }
  }
}
```

### Export Logs
```
GET /api/logs/export/:type/:date?format=csv
```

**Formats supported:**
- `json` (default)
- `csv`

### Clean Up Old Logs
```
POST /api/logs/cleanup
Content-Type: application/json

{
  "daysToKeep": 90
}
```

## AuditService Methods

### Data Access Logging
```javascript
await AuditService.logDataAccess({
  userId: 'user123',
  action: 'READ_MEMBER_DATA',
  targetMemberId: 'member456',
  changes: null,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent')
});
```

### Authentication Logging
```javascript
await AuditService.logAuth({
  userId: 'user123',
  action: 'LOGIN',
  success: true,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent')
});
```

### Chatbot Logging
```javascript
await AuditService.logChatbotInteraction({
  userId: 'user123',
  memberId: 'member456',
  message: 'What is my balance?',
  response: 'Your balance is $50,000',
  intent: 'balance_inquiry'
});
```

### System Event Logging
```javascript
await AuditService.logSystemEvent({
  event: 'SERVER_START',
  description: 'Backend server started',
  severity: 'INFO',
  metadata: { port: 4000 }
});
```

## Utility Methods

### Read Logs from File
```javascript
const logs = await AuditService.readLogsFromFile('DATA_ACCESS', new Date());
```

### Get Available Log Files
```javascript
const files = AuditService.getAvailableLogFiles();
```

### Get Log Statistics
```javascript
const stats = await AuditService.getLogStatistics('AUTHENTICATION', new Date());
```

### Clean Up Old Logs
```javascript
const result = AuditService.cleanupOldLogs(90); // Keep 90 days
```

## Automatic Logging

The system automatically logs:

1. **Authentication Events** (via middleware):
   - Token verification attempts
   - Failed authentication
   - IP address and user agent tracking

2. **Data Access Events** (via controllers):
   - Member data viewing
   - Data modifications
   - Export operations

3. **System Events** (via application lifecycle):
   - Server startup
   - API requests
   - Configuration changes

4. **Chatbot Interactions** (via ChatbotController):
   - All user messages and bot responses
   - Intent recognition results

## Security Features

1. **Sensitive Data Sanitization**:
   - Credit card numbers → `[CARD_NUMBER]`
   - Social Security Numbers → `[SSN]`
   - Passwords → `password=[REDACTED]`

2. **Access Control**:
   - Only regulators can access logs via API
   - Audit trail for log access

3. **Data Integrity**:
   - Append-only log files
   - JSON format for easy parsing
   - Unique IDs for each log entry

## Compliance Features

1. **Regulatory Compliance**:
   - Complete audit trail
   - Data access tracking
   - User action logging

2. **Data Retention**:
   - Configurable retention periods
   - Automatic cleanup functionality
   - Export capabilities for archival

3. **Monitoring**:
   - Log statistics and analytics
   - Performance tracking
   - Error monitoring

## Configuration

### Environment Variables
```bash
NODE_ENV=development  # Enables console logging in development
```

### File Paths
- Log files are stored in: `backend/logs/`
- File naming: `{type}-{YYYY-MM-DD}.log`
- Automatic directory creation

## Best Practices

1. **Regular Monitoring**:
   - Check log statistics daily
   - Monitor for unusual patterns
   - Review failed authentication attempts

2. **Data Retention**:
   - Set up automated cleanup jobs
   - Archive old logs for compliance
   - Monitor disk space usage

3. **Security**:
   - Restrict access to log files
   - Monitor log access patterns
   - Regular security audits

This comprehensive logging system ensures full auditability and compliance for the MUFG Pension Insights platform.
