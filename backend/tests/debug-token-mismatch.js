#!/usr/bin/env node

// Direct token comparison test
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Token Comparison Test');
console.log('=' .repeat(40));

const secret = process.env.NEXTAUTH_SECRET;
console.log('🔑 Secret:', secret?.substring(0, 20) + '...');

// Create a token exactly like the frontend does
const frontendPayload = {
  sub: "2",
  email: "advisor1@mufg.com", 
  name: "Jane Advisor",
  username: "advisor1",
  role: "advisor",
  roleData: {},
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
};

console.log('\n🎫 Creating token with frontend payload...');
const frontendToken = jwt.sign(frontendPayload, secret);
console.log('Frontend token:', frontendToken.substring(0, 100) + '...');

// Test verification
console.log('\n🧪 Testing verification...');
try {
  const decoded = jwt.verify(frontendToken, secret);
  console.log('✅ Verification successful!');
  console.log('Decoded user:', decoded.username, '|', decoded.role);
} catch (error) {
  console.log('❌ Verification failed:', error.message);
}

// Test with the actual token from your test
const actualToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJhZHZpc29yMUBtdWZnLmNvbSIsIm5hbWUiOiJKYW5lIEFkdmlzb3IiLCJ1c2VybmFtZSI6ImFkdmlzb3IxIiwicm9sZSI6ImFkdmlzb3IiLCJyb2xlRGF0YSI6eyJ0b3RhbENsaWVudHMiOjI0NywiYXZnUGVyZm9ybWFuY2UiOjcuOCwiY2xpZW50c05lZWRpbmdSZXZpZXciOjE4LCJhc3NldHNVbmRlck1hbmFnZW1lbnQiOjQ1MjAwMDAwfSwiaWF0IjoxNzU1ODEyNzk4LCJleHAiOjE3NTU4OTkxOTh9.IvuQrmfBGv74M637YOE_msZ0UKq04x_QTVIlL9EGlsw";

console.log('\n🧪 Testing the actual failing token...');
try {
  const decoded = jwt.verify(actualToken, secret);
  console.log('✅ Actual token verification successful!');
  console.log('Decoded user:', decoded.username, '|', decoded.role);
} catch (error) {
  console.log('❌ Actual token verification failed:', error.message);
  console.log('Error details:', error);
}

console.log('\n🔍 Token analysis:');
console.log('Secret length:', secret?.length);
console.log('Token length:', actualToken?.length);
console.log('Token parts:', actualToken?.split('.').length);
