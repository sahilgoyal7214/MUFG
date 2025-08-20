import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);
    
    await client.end();
    console.log('🔒 Connection closed');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('📋 Full error:', error);
  }
}

testDatabase();
