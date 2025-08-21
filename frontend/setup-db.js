#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

import initializeDatabase from './src/lib/initDb.js';
import { userService } from './src/lib/userService.js';

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please check your .env.local file');
      process.exit(1);
    }

    // Initialize database schema
    await initializeDatabase();

    // Initialize default users
    await userService.initializeDefaultUsers();

    console.log('✅ Database setup completed successfully!');
    console.log('\n📝 Default users created:');
    console.log('   - member1 (password: password123)');
    console.log('   - advisor1 (password: password123)');
    console.log('   - regulator1 (password: password123)');
    console.log('\n🔐 All passwords are securely hashed using bcryptjs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

setupDatabase();
