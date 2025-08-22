#!/usr/bin/env node

/**
 * Compare Token Structures
 * Compares tokens from different sources to find the issue
 */

import jwt from 'jsonwebtoken';

const SECRET = 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔍 Token Structure Comparison');
console.log('==============================');

// Test 1: Decode a failing token to see its structure
console.log('\n1️⃣  Analyzing tokens from browser/cookie...');

// This is a typical NextAuth session token (JWE format)
const sessionToken = 'bad341383de5eeb00e0e14ff15ebe29d83ec0b2c6a0e9b66c877dc9c6e8cb59a%7Cf8c6fe2334e911d325b61885922d1c245c782677d8af18f75ac27dfb33128169';
console.log('Session token format:', sessionToken.substring(0, 50) + '...');
console.log('This appears to be a NextAuth session token (URL encoded)');

// Test 2: Create a token exactly as frontend token endpoint would
console.log('\n2️⃣  Creating token as frontend /api/auth/token would...');

const frontendStyle = {
  sub: 'member1@mufg.com', // Often email when id is missing
  email: 'member1@mufg.com',
  name: 'John Member',
  username: 'member1',
  role: 'member',
  roleData: {},
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
};

const frontendToken = jwt.sign(frontendStyle, SECRET);
console.log('Frontend-style token:', frontendToken);

// Test 3: Verify it works
try {
  const decoded = jwt.verify(frontendToken, SECRET);
  console.log('✅ Verification successful');
  console.log('Decoded:', JSON.stringify(decoded, null, 2));
} catch (e) {
  console.log('❌ Verification failed:', e.message);
}

// Test 4: Check what the actual issue might be
console.log('\n3️⃣  Debugging the real issue...');
console.log('Possible issues:');
console.log('1. NextAuth session vs JWT token confusion');
console.log('2. Different secret keys being used'); 
console.log('3. Token format expectations');
console.log('4. Cookie vs Authorization header');

// The key insight: NextAuth sessions are NOT JWT tokens!
// They are session identifiers that need to be converted to JWT
console.log('\n💡 KEY INSIGHT:');
console.log('NextAuth sessions are NOT JWT tokens by default!');
console.log('The cookie contains a session ID, not a JWT.');
console.log('Our /api/auth/token endpoint creates the JWT for backend use.');

console.log('\n🔧 SOLUTION:');
console.log('1. Use the /api/auth/token endpoint to get JWT');
console.log('2. Do NOT use the session cookie directly');
console.log('3. The JWT from /api/auth/token should work with backend');
