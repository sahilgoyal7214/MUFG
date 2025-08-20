#!/usr/bin/env node

/**
 * Debug token verification
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJSRUcwMDEiLCJlbWFpbCI6InJlZ3VsYXRvckBtdWZnLmNvbSIsInJvbGUiOiJSRUdVTEFUT1IiLCJuYW1lIjoiSm9obiBSZWd1bGF0b3IiLCJwZXJtaXNzaW9ucyI6WyJVU0VSX1JFQURfQUxMIiwiQU5BTFlUSUNTX1JFQUQiLCJBTkFMWVRJQ1NfVklFV19BTEwiLCJBVURJVF9MT0dTIiwiTUVNQkVSX0RBVEFfUkVBRF9BTEwiLCJNRU1CRVJfREFUQV9DUkVBVEUiLCJNRU1CRVJfREFUQV9VUERBVEUiLCJNRU1CRVJfREFUQV9ERUxFVEUiXSwiaWF0IjoxNzU1NTA2NTk4LCJleHAiOjE3NTU1OTI5OTgsImlzcyI6Im11ZmctcGVuc2lvbi1pbnNpZ2h0cyIsImF1ZCI6Im11ZmctYXBpIn0.-jL53WF1KEq7GyoVCD5F4Z6vB5UeiXoedX_KTsnF9XQ";

console.log('🔍 Debug Token Verification');
console.log('============================');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);
console.log('');

try {
  console.log('📝 Decoding token without verification...');
  const decoded = jwt.decode(TOKEN, { complete: true });
  console.log('Header:', decoded.header);
  console.log('Payload:', decoded.payload);
  console.log('');

  console.log('🔐 Verifying with JWT_SECRET...');
  const verified = jwt.verify(TOKEN, process.env.JWT_SECRET);
  console.log('✅ Verification successful!');
  console.log('User data:', verified);
  
} catch (error) {
  console.log('❌ Verification failed:', error.message);
}

console.log('');
console.log('🧪 Testing nextauth config...');

try {
  const { extractUserFromToken } = await import('./src/config/nextauth.js');
  const user = await extractUserFromToken(TOKEN);
  console.log('✅ NextAuth extraction successful!');
  console.log('User:', user);
} catch (error) {
  console.log('❌ NextAuth extraction failed:', error.message);
  console.log('Error details:', error);
}
