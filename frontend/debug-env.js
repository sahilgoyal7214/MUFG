#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('🔍 Environment Debug Information:');
console.log('📁 Current directory:', __dirname);
console.log('📄 .env.local path:', join(__dirname, '.env.local'));
console.log('🌐 DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔐 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
console.log('🔗 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Parse the connection string manually
const connectionString = process.env.DATABASE_URL;
if (connectionString) {
  try {
    const url = new URL(connectionString);
    console.log('\n📊 Parsed Connection String:');
    console.log('  Protocol:', url.protocol);
    console.log('  Host:', url.hostname);
    console.log('  Port:', url.port);
    console.log('  Database:', url.pathname.slice(1));
    console.log('  Username:', url.username);
    console.log('  Password:', url.password ? `[${url.password.length} chars, decoded: ${decodeURIComponent(url.password)}]` : 'Not set');
    
    console.log('\n⚙️ Pool Configuration:');
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: decodeURIComponent(url.password),
    };
    console.log('  Host:', config.host);
    console.log('  Port:', config.port);
    console.log('  Database:', config.database);
    console.log('  User:', config.user);
    console.log('  Password:', config.password ? '[HIDDEN]' : 'Not set');
    
  } catch (error) {
    console.error('❌ Error parsing connection string:', error.message);
  }
}
