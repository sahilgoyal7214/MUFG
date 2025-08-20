#!/usr/bin/env node

/**
 * Generate Fixed Test JWT Token for MUFG API Testing
 * This creates a hardcoded token that never expires for testing purposes
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Test user payload with comprehensive permissions (using lowercase format)
const testUser = {
  sub: 'TEST001',
  email: 'test@mufg.com', 
  role: 'regulator',
  name: 'Test User',
  memberId: 'TEST001',
  permissions: [
    'user:read:all',
    'analytics:read', 
    'analytics:view:all',
    'analytics:view:own',
    'analytics:view:assigned',
    'analytics:export',
    'audit:logs',
    'member_data:read:all',
    'member_data:create',
    'member_data:update', 
    'member_data:delete',
    'chatbot:access',
    'regulatory:oversight',
    'compliance:monitoring',
    'compliance:reports'
  ],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
  iss: 'mufg-pension-insights',
  aud: 'mufg-api'
};

const FIXED_TEST_TOKEN = jwt.sign(testUser, JWT_SECRET);

console.log('🧪 FIXED TEST TOKEN GENERATED');
console.log('================================');
console.log('👤 User: Test User (test@mufg.com)');
console.log('🔑 Role: REGULATOR (full permissions)');
console.log('⏰ Expires: 1 year from now');
console.log('');
console.log('🎫 FIXED TEST TOKEN:');
console.log('====================');
console.log(FIXED_TEST_TOKEN);
console.log('');
console.log('💾 Save this token for testing! It will work for 1 year.');
console.log('');
console.log('🧪 Test with curl:');
console.log(`curl -H "Authorization: Bearer ${FIXED_TEST_TOKEN}" http://localhost:4000/api/auth/me`);

// Export for use in other files
export const FIXED_TEST_TOKEN_VALUE = FIXED_TEST_TOKEN;
export const FIXED_TEST_USER = {
  id: 'TEST001',
  email: 'test@mufg.com',
  name: 'Test User',
  role: 'regulator',
  memberId: 'TEST001',
  permissions: testUser.permissions
};
