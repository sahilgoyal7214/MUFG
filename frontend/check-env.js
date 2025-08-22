/**
 * Check Frontend Environment Variables
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('🔍 Frontend Environment Check');
console.log('================================');

// Check Next.js environment variables
const envVars = [
  'NODE_ENV',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_BACKEND_URL',
  'DATABASE_URL',
  'JWT_SECRET'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    if (varName.includes('SECRET') || varName.includes('DATABASE_URL')) {
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
console.log(`- NextAuth URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`);
console.log(`- NextAuth Secret: ${process.env.NEXTAUTH_SECRET ? 'Configured' : 'NOT SET'}`);
console.log(`- API URL: ${process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}`);
console.log(`- API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}`);

// Check for .env files
console.log('\n📄 Environment Files:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}: EXISTS`);
  } else {
    console.log(`❌ ${file}: NOT FOUND`);
  }
});
