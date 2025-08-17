/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles, permissions, and access levels for the pension insights platform
 * 
 * Roles:
 * - MEMBER: Individual pension scheme members
 * - ADVISOR: Financial advisors who help members
 * - REGULATOR: Regulatory authorities with oversight access
 */

export const ROLES = {
  REGULATOR: 'regulator',
  ADVISOR: 'advisor', 
  MEMBER: 'member'
};

export const PERMISSIONS = {
  // Member Data Access
  MEMBER_DATA_READ_ALL: 'member_data:read:all',        // All member data
  MEMBER_DATA_READ_OWN: 'member_data:read:own',        // Own data only
  MEMBER_DATA_READ_ASSIGNED: 'member_data:read:assigned', // Assigned clients
  MEMBER_DATA_UPDATE_OWN: 'member_data:update:own',    // Update own data
  MEMBER_DATA_UPDATE_ASSIGNED: 'member_data:update:assigned', // Update client data
  
  // Analytics & Reports
  ANALYTICS_VIEW_ALL: 'analytics:view:all',            // System-wide analytics
  ANALYTICS_VIEW_OWN: 'analytics:view:own',            // Personal analytics
  ANALYTICS_VIEW_ASSIGNED: 'analytics:view:assigned',  // Client analytics
  ANALYTICS_EXPORT: 'analytics:export',                // Export reports
  COMPLIANCE_REPORTS: 'compliance:reports',            // Regulatory reports
  
  // Chatbot & AI
  CHATBOT_ACCESS: 'chatbot:access',                     // Basic chatbot access
  AI_INSIGHTS_PERSONAL: 'ai:insights:personal',        // Personal insights
  AI_INSIGHTS_CLIENT: 'ai:insights:client',            // Client insights
  
  // User Management
  USER_READ_ALL: 'user:read:all',                      // View all users
  USER_READ_ASSIGNED: 'user:read:assigned',            // View assigned clients
  USER_UPDATE_ASSIGNED: 'user:update:assigned',        // Update client profiles
  
  // Regulatory & Compliance
  REGULATORY_OVERSIGHT: 'regulatory:oversight',         // Full regulatory access
  AUDIT_LOGS: 'audit:logs',                           // Access audit trails
  COMPLIANCE_MONITORING: 'compliance:monitoring'       // Monitor compliance
};

export const ROLE_PERMISSIONS = {
  [ROLES.REGULATOR]: [
    // Regulators have full oversight access
    PERMISSIONS.MEMBER_DATA_READ_ALL,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.COMPLIANCE_REPORTS,
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.REGULATORY_OVERSIGHT,
    PERMISSIONS.AUDIT_LOGS,
    PERMISSIONS.COMPLIANCE_MONITORING
  ],
  
    
  [ROLES.ADVISOR]: [
    // Advisors can access their assigned clients' data
    PERMISSIONS.MEMBER_DATA_READ_ASSIGNED,
    PERMISSIONS.MEMBER_DATA_UPDATE_ASSIGNED,
    PERMISSIONS.ANALYTICS_VIEW_ASSIGNED,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.CHATBOT_ACCESS,
    PERMISSIONS.AI_INSIGHTS_CLIENT,
    PERMISSIONS.USER_READ_ASSIGNED,
    PERMISSIONS.USER_UPDATE_ASSIGNED
  ],
  
  [ROLES.MEMBER]: [
    // Members can only access their own data
    PERMISSIONS.MEMBER_DATA_READ_OWN,
    PERMISSIONS.MEMBER_DATA_UPDATE_OWN,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.CHATBOT_ACCESS,
    PERMISSIONS.AI_INSIGHTS_PERSONAL
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {array} Array of permissions
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Get the role hierarchy (highest to lowest privilege)
 * @returns {array} Array of roles in order of privilege
 */
export const getRoleHierarchy = () => {
  return [ROLES.REGULATOR, ROLES.ADVISOR, ROLES.MEMBER];
};

/**
 * Check if one role has higher privileges than another
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} True if role1 has higher privileges than role2
 */
export const isHigherRole = (role1, role2) => {
  const hierarchy = getRoleHierarchy();
  return hierarchy.indexOf(role1) < hierarchy.indexOf(role2);
};
