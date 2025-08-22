#!/usr/bin/env node

// Analyze the provided token
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const providedToken = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..B6ZdEFvrYVq5fTbf.cEu-Jy6TZhGgBs-mQHcqFbj_CeGcrVRvh5RdSEw_Ud7RvHeZfuqIdooR6lfr8_M1FH2HfE0kpq9ECuOhsDGAs1T_715gqqLVGOXXzmNsKQrp1ZHr58Kdz2vVnW_jvo9u1ZwgchETogEMXtT6hGc9Sq6BLiWJWvWhszEnAZQNjMoPGGbc9oRuvVuax5c8pijR2gumz4Vx3TIWY52qvmoYhWHn9bSR2LfxXL6RiABLIfRkYDSkZ2y8u1b6s9eDQtyQ6Wr_0vcjvAYxEDa5CaaBXH_K1s9W19PKBxh5S6dFWpCAcIe5yHmO5HMNUlPA9o6iQ3zCGgN1LhDkkHMFR26Mnt5P7zAppaUEsJT0vHjoMC-lni6Qk0SRHM9DCpLhdCvqwfHv.Z6KOoywBNk9d438uTG-XKg";

console.log('🔍 Analyzing Provided Token');
console.log('=' .repeat(40));

console.log('\n📋 Token Details:');
console.log('Length:', providedToken.length);
console.log('Parts:', providedToken.split('.').length);

// Check if this is a standard JWT or JWE
const parts = providedToken.split('.');
console.log('\n🔍 Token Structure:');
console.log('Part 1 (Header):', parts[0]);

try {
    // Try to decode the header
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    console.log('Decoded header:', header);
    
    if (header.alg === 'dir' && header.enc) {
        console.log('\n🔐 This is a JWE (JSON Web Encryption) token, not a standard JWT!');
        console.log('Algorithm:', header.alg);
        console.log('Encryption:', header.enc);
        console.log('\n❌ Our backend expects standard JWT tokens, not encrypted JWE tokens.');
        console.log('🔄 NextAuth might be using JWE for session tokens instead of JWT.');
    }
} catch (error) {
    console.log('❌ Could not decode header:', error.message);
}

// Try to verify with our secret (this will likely fail for JWE)
console.log('\n🧪 Testing with backend verification...');
const secret = process.env.NEXTAUTH_SECRET;

try {
    const decoded = jwt.verify(providedToken, secret);
    console.log('✅ Token verified successfully!');
    console.log('Decoded payload:', decoded);
} catch (error) {
    console.log('❌ Token verification failed:', error.message);
    
    if (error.message.includes('invalid signature') || error.message.includes('malformed')) {
        console.log('\n💡 This confirms the token is JWE (encrypted), not JWT (signed)');
        console.log('🔧 Solution: Use our /api/auth/token endpoint to get a proper JWT token');
    }
}

console.log('\n🎯 Recommendation:');
console.log('1. This appears to be a NextAuth session token (JWE encrypted)');
console.log('2. Use /api/auth/token endpoint to get a standard JWT token');
console.log('3. Our backend expects JWT, not JWE tokens');

// Test our token generation
console.log('\n🔧 Generating correct JWT token for comparison...');
const correctPayload = {
    sub: 'member1@mufg.com',
    email: 'member1@mufg.com',
    name: 'John Member',
    username: 'member1',
    role: 'member',
    roleData: {},
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
};

const correctToken = jwt.sign(correctPayload, secret);
console.log('✅ Correct JWT token:', correctToken.substring(0, 50) + '...');

// Test the correct token
try {
    const decoded = jwt.verify(correctToken, secret);
    console.log('✅ Correct token verification successful!');
    console.log('👤 User:', decoded.username, '| Role:', decoded.role);
} catch (error) {
    console.log('❌ Unexpected error with correct token:', error.message);
}
