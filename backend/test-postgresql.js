#!/usr/bin/env node

/**
 * PostgreSQL Connection Diagnostic Tool
 */

import pkg from 'pg';
const { Pool, Client } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 PostgreSQL Connection Diagnostic');
console.log('=====================================');

// Check environment variable
const connectionString = process.env.DATABASE_URL;
console.log(`📋 Database URL: ${connectionString ? connectionString.substring(0, 30) + '...' : 'NOT SET'}`);

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!connectionString.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL does not appear to be a PostgreSQL connection string');
  process.exit(1);
}

// Parse connection string
try {
  const url = new URL(connectionString);
  console.log('\n📋 Connection Details:');
  console.log(`- Host: ${url.hostname}`);
  console.log(`- Port: ${url.port || 5432}`);
  console.log(`- Database: ${url.pathname.slice(1)}`);
  console.log(`- Username: ${url.username}`);
  console.log(`- SSL: ${url.searchParams.get('sslmode') || 'inferred'}`);
} catch (error) {
  console.error('❌ Invalid connection string format:', error.message);
  process.exit(1);
}

console.log('\n🔄 Testing Connection Methods...');

// Test 1: Basic Client Connection
console.log('\n1. Testing basic client connection...');
try {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 second timeout
  });

  await client.connect();
  console.log('✅ Basic client connection successful');
  
  // Test a simple query
  const result = await client.query('SELECT NOW() as current_time, version() as db_version');
  console.log(`✅ Query test successful - Current time: ${result.rows[0].current_time}`);
  console.log(`📊 PostgreSQL version: ${result.rows[0].db_version.split(' ')[0]}`);
  
  await client.end();
} catch (error) {
  console.error('❌ Basic client connection failed:', error.message);
  console.error('Error code:', error.code);
  console.error('Error details:', error.detail || 'No additional details');
}

// Test 2: Connection Pool
console.log('\n2. Testing connection pool...');
try {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  console.log('✅ Pool connection successful');
  
  // Test schema access
  const schemaResult = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    LIMIT 5
  `);
  console.log(`📊 Found ${schemaResult.rows.length} tables in public schema`);
  
  client.release();
  await pool.end();
} catch (error) {
  console.error('❌ Pool connection failed:', error.message);
  console.error('Error code:', error.code);
}

// Test 3: Network connectivity
console.log('\n3. Testing network connectivity...');
try {
  const url = new URL(connectionString);
  const host = url.hostname;
  const port = url.port || 5432;
  
  // Simple TCP connection test
  const net = await import('net');
  
  const tcpTest = new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    }, 5000);
    
    socket.connect(port, host, () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve('Connected');
    });
    
    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
  
  await tcpTest;
  console.log(`✅ Network connectivity to ${host}:${port} successful`);
} catch (error) {
  console.error('❌ Network connectivity failed:', error.message);
}

console.log('\n📋 Diagnostic Summary:');
console.log('If you see errors above, here are common solutions:');
console.log('1. Network issues: Check firewall and internet connection');
console.log('2. Authentication: Verify username/password in DATABASE_URL');
console.log('3. SSL issues: Azure PostgreSQL requires SSL connections');
console.log('4. Timeout: Server might be slow or overloaded');
console.log('5. Database not found: Check database name in connection string');

console.log('\n🔧 Troubleshooting Steps:');
console.log('1. Verify DATABASE_URL format: postgresql://user:pass@host:port/db');
console.log('2. Test from Azure portal or pgAdmin');
console.log('3. Check Azure PostgreSQL firewall rules');
console.log('4. Ensure IP address is whitelisted');
console.log('5. Verify server is running and accessible');
*-*--