#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

import pool from './src/lib/db.js';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      process.exit(1);
    }

    // Test the connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');

    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('🕒 Database time:', result.rows[0].current_time);
    console.log('📋 Database version:', result.rows[0].version);

    client.release();
    
    // Close the pool
    await pool.end();
    console.log('✅ Connection test completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

testConnection();
