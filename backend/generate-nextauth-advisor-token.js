/**
 * Generate NextAuth-compatible JWT token for advisor testing
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Simulate NextAuth advisor payload structure
const advisorPayload = {
  sub: '2', // NextAuth uses 'sub' for user ID
  email: 'advisor1@mufg.com',
  name: 'Jane Advisor', 
  username: 'advisor1',
  role: 'advisor',
  roleData: {
    totalClients: 247,
    assetsUnderManagement: 45200000,
    avgPerformance: 7.8,
    clientsNeedingReview: 18
  },
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  iss: 'nextauth' // NextAuth issuer
};

// Generate the token
const token = jwt.sign(advisorPayload, NEXTAUTH_SECRET);

console.log('🎫 NextAuth-compatible Advisor JWT Token:');
console.log('==========================================');
console.log(token);
console.log('\n💡 Test with curl:');
console.log('==================');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:4000/api/advisor/portfolio-optimization/M001`);
