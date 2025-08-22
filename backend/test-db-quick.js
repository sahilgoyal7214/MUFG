#!/usr/bin/env node

/**
 * Quick Database Connection Test
 */

import db from './src/config/database.js';

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Initialize the database connection
    await db.initialize();
    console.log('✅ Database initialized successfully');
    console.log(`📊 Database type: ${db.dbType}`);
    
    // Test a simple query
    if (db.dbType === 'postgresql') {
      const result = await db.query('SELECT version()');
      console.log('🐘 PostgreSQL version:', result.rows[0].version);
      
      // Test if we can see the users table
      const tableCheck = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'pension_data')
      `);
      console.log('📋 Available tables:', tableCheck.rows.map(row => row.table_name));
      
      // Test user query
      const userCount = await db.query('SELECT COUNT(*) as count FROM users');
      console.log('👥 User count:', userCount.rows[0].count);
      
    } else if (db.dbType === 'sqlite') {
      const result = await db.query('SELECT sqlite_version() as version');
      console.log('🗃️ SQLite version:', result[0].version);
      
      // Test tables
      const tables = await db.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name IN ('users', 'pension_data')
      `);
      console.log('📋 Available tables:', tables.map(row => row.name));
      
      // Test user query
      const userCount = await db.query('SELECT COUNT(*) as count FROM users');
      console.log('👥 User count:', userCount[0].count);
    }
    
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close connections
    if (db.pool) {
      await db.pool.end();
    }
    if (db.sqlite) {
      db.sqlite.close();
    }
    process.exit(0);
  }
}

testDatabase();
