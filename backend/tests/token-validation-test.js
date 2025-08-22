#!/usr/bin/env node

// Simple Token Validation Test
// This test demonstrates the token issue you encountered

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔐 Token Validation Test');
console.log('=' .repeat(30));

// Test 1: Create a token like the frontend does
console.log('\n1️⃣  Creating JWT token (like frontend /api/auth/token)...');
const payload = {
    sub: 'member1@mufg.com',
    email: 'member1@mufg.com',
    name: 'John Member',
    username: 'member1',
    role: 'member',
    roleData: {},
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

const secret = process.env.NEXTAUTH_SECRET;
console.log('🔑 Using secret:', secret ? `${secret.substring(0, 10)}...` : 'NOT FOUND');

const token = jwt.sign(payload, secret);
console.log('🎫 Generated token:', token.substring(0, 50) + '...');

// Test 2: Validate the token
console.log('\n2️⃣  Validating the token...');
try {
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token validation successful!');
    console.log('👤 User:', decoded.username, '| Role:', decoded.role);
} catch (error) {
    console.log('❌ Token validation failed:', error.message);
}

// Test 3: Show the issue with session cookies
console.log('\n3️⃣  Explaining the cookie vs JWT issue...');
console.log('❌ WRONG: Using NextAuth session cookie directly');
console.log('   Session cookie: "bad341383de5eeb00e0e14ff15ebe29d83ec0b2c6a0e9b66c8..."');
console.log('   This is NOT a JWT token!');

console.log('\n✅ CORRECT: Using /api/auth/token endpoint');
console.log('   JWT token:', token.substring(0, 50) + '...');
console.log('   This IS a valid JWT token!');

console.log('\n🎯 SOLUTION:');
console.log('1. Login with NextAuth (gets session cookie)');
console.log('2. Call /api/auth/token to get JWT token');
console.log('3. Use JWT token for backend API calls');
console.log('4. Backend validates JWT with NEXTAUTH_SECRET');
