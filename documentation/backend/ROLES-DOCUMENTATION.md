# MUFG Pension Insights - Role-Based Access Control

## Overview

The MUFG Pension Insights platform uses a three-tier role-based access control system designed specifically for pension management:

## Roles

### 1. **Member** (`member`)
- **Purpose**: Individual pension scheme members
- **Access**: Personal data and insights only
- **Permissions**: 5 permissions
  - Read own member data
  - Update own member data
  - View personal analytics
  - Access chatbot
  - Receive personal AI insights

### 2. **Advisor** (`advisor`) 
- **Purpose**: Financial advisors who help members
- **Access**: Assigned clients' data and analysis tools
- **Permissions**: 8 permissions
  - Read assigned clients' member data
  - Update assigned clients' member data
  - View assigned clients' analytics
  - Export analytics reports
  - Access chatbot
  - Receive client AI insights
  - Read assigned user profiles
  - Update assigned user profiles

### 3. **Regulator** (`regulator`)
- **Purpose**: Regulatory authorities with oversight responsibilities
- **Access**: System-wide access for compliance and oversight
- **Permissions**: 8 permissions
  - Read all member data
  - View system-wide analytics
  - Export compliance reports
  - Generate compliance reports
  - Read all user profiles
  - Access regulatory oversight tools
  - View audit logs
  - Monitor compliance

## Permission Categories

### Data Access Permissions
- `member_data:read:all` - Access all member data (Regulator only)
- `member_data:read:assigned` - Access assigned clients' data (Advisor)
- `member_data:read:own` - Access own data (Member)
- `member_data:update:assigned` - Update assigned clients' data (Advisor)
- `member_data:update:own` - Update own data (Member)

### Analytics Permissions
- `analytics:view:all` - System-wide analytics (Regulator)
- `analytics:view:assigned` - Client analytics (Advisor)
- `analytics:view:own` - Personal analytics (Member)
- `analytics:export` - Export reports (Regulator, Advisor)

### User Management Permissions
- `user:read:all` - View all users (Regulator)
- `user:read:assigned` - View assigned clients (Advisor)
- `user:update:assigned` - Update assigned clients (Advisor)

### AI & Chatbot Permissions
- `chatbot:access` - Basic chatbot access (All roles)
- `ai:insights:personal` - Personal AI insights (Member)
- `ai:insights:client` - Client AI insights (Advisor)

### Compliance & Regulatory Permissions
- `regulatory:oversight` - Full regulatory access (Regulator)
- `audit:logs` - Access audit trails (Regulator)
- `compliance:monitoring` - Monitor compliance (Regulator)
- `compliance:reports` - Generate compliance reports (Regulator)

## Role Hierarchy

1. **Regulator** (Highest privilege) - Regulatory oversight
2. **Advisor** (Medium privilege) - Client management
3. **Member** (Lowest privilege) - Personal access only

## Implementation Examples

### Frontend NextAuth Configuration
```javascript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role || 'member'; // Default to member
    }
    return token;
  }
}
```

### Backend API Authorization
```javascript
// Endpoint accessible by all roles
router.get('/dashboard', 
  authorize([
    PERMISSIONS.ANALYTICS_VIEW_ALL,      // Regulator
    PERMISSIONS.ANALYTICS_VIEW_ASSIGNED, // Advisor
    PERMISSIONS.ANALYTICS_VIEW_OWN       // Member
  ]),
  handler
);

// Regulator-only endpoint
router.get('/compliance', 
  authorize([PERMISSIONS.REGULATORY_OVERSIGHT]),
  handler
);
```

### Business Logic Examples
```javascript
// Data filtering based on role
if (user.role === ROLES.MEMBER) {
  // Return only own data
  return memberData.filter(data => data.memberId === user.memberId);
} else if (user.role === ROLES.ADVISOR) {
  // Return assigned clients' data
  return memberData.filter(data => user.assignedClients.includes(data.memberId));
} else if (user.role === ROLES.REGULATOR) {
  // Return all data
  return memberData;
}
```

## Security Considerations

1. **Principle of Least Privilege**: Each role has only the minimum permissions required
2. **Data Segregation**: Members can only access their own data
3. **Advisor Boundaries**: Advisors limited to explicitly assigned clients
4. **Regulatory Oversight**: Regulators have appropriate oversight access
5. **Audit Trail**: All access is logged for compliance

## API Endpoints by Role

### Member Endpoints
- `GET /api/auth/me` - Own profile
- `GET /api/members/me` - Own member data
- `PUT /api/members/me` - Update own data
- `GET /api/analytics/personal` - Personal analytics
- `POST /api/chatbot/message` - Chatbot access

### Advisor Endpoints
- All member endpoints (for assigned clients)
- `GET /api/users/assigned` - Assigned clients
- `GET /api/analytics/clients` - Client analytics
- `GET /api/analytics/export` - Export reports

### Regulator Endpoints
- `GET /api/users` - All users
- `GET /api/members` - All member data
- `GET /api/analytics/system` - System analytics
- `GET /api/compliance/reports` - Compliance reports
- `GET /api/audit/logs` - Audit logs

This role system ensures appropriate access control while maintaining the flexibility needed for a comprehensive pension management platform.
