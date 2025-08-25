#!/usr/bin/env node

/**
 * Check Backend Environment Variables
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Backend Environment Check');
console.log('================================');

// Check critical environment variables
const envVars = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'LOCAL_LLM_URL',
  'LLM_MODEL_NAME',
  'GRAPH_LLM_URL',
  'GRAPH_LLM_MODEL',
  'AUTHORIZATION_MODE'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    if (varName.includes('SECRET') || varName.includes('URL')) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n📊 Environment Summary:');
console.log(`- Total env vars loaded: ${Object.keys(process.env).length}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`- Port: ${process.env.PORT || 'NOT SET'}`);
console.log(`- Database: ${process.env.DATABASE_URL ? 'Configured' : 'NOT SET'}`);
console.log(`- JWT: ${process.env.JWT_SECRET ? 'Configured' : 'NOT SET'}`);
console.log(`- LLM: ${process.env.LOCAL_LLM_URL ? 'Configured' : 'NOT SET'}`);
console.log(`- Graph LLM: ${process.env.GRAPH_LLM_URL ? 'Configured' : 'NOT SET'}`);
