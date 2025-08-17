#!/usr/bin/env node

/**
 * Generate Test JWT Token for MUFG API Testing
 * This script creates a valid JWT token for testing API endpoints in Swagger UI
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Test user data
const testUsers = {
  regulator: {
    id: 'REG001',
    email: 'regulator@mufg.com',
    role: 'REGULATOR',
    name: 'John Regulator',
    permissions: ['USER_READ_ALL', 'ANALYTICS_VIEW_ALL', 'AUDIT_LOGS', 'MEMBER_DATA_READ_ALL']
  },
  advisor: {
    id: 'ADV001', 
    email: 'advisor@mufg.com',
    role: 'ADVISOR',
    name: 'Jane Advisor',
    permissions: ['USER_READ_ASSIGNED', 'ANALYTICS_VIEW_ASSIGNED', 'MEMBER_DATA_READ_ASSIGNED']
  },
  member: {
    id: 'MEM001',
    email: 'member@mufg.com', 
    role: 'MEMBER',
    name: 'Bob Member',
    permissions: ['ANALYTICS_VIEW_OWN', 'MEMBER_DATA_READ_OWN', 'CHATBOT_ACCESS']
  }
};

function generateToken(userType = 'member') {
  const user = testUsers[userType];
  
  if (!user) {
    console.error('❌ Invalid user type. Use: regulator, advisor, or member');
    process.exit(1);
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iss: 'mufg-pension-insights',
    aud: 'mufg-api'
  };

  const token = jwt.sign(payload, JWT_SECRET);
  
  console.log('🚀 MUFG API Test Token Generated');
  console.log('================================');
  console.log(`👤 User Type: ${userType.toUpperCase()}`);
  console.log(`📧 Email: ${user.email}`);
  console.log(`🔑 Role: ${user.role}`);
  console.log(`⏰ Expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
  console.log('');
  console.log('🎫 JWT Token:');
  console.log('=============');
  console.log(token);
  console.log('');
  console.log('📋 How to use in Swagger UI:');
  console.log('============================');
  console.log('1. Go to http://localhost:4000/api-docs');
  console.log('2. Click the "Authorize" button (🔓 icon)');
  console.log('3. Enter: Bearer ' + token);
  console.log('4. Click "Authorize" and then "Close"');
  console.log('5. Now you can test all endpoints!');
  console.log('');
  console.log('💡 Quick test with curl:');
  console.log('========================');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:4000/api/auth/me`);
  
  return token;
}

// Get user type from command line argument
const userType = process.argv[2] || 'member';

// Generate and display token
generateToken(userType);
