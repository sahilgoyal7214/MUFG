import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pension_insights',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function getColumnNames() {
  try {
    console.log('Connecting to PostgreSQL...');
    
    // Query to get all column names from the main table
    // Replace 'your_table_name' with the actual table name containing user data
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;
    
    // Try common table names
    const possibleTableNames = ['users', 'clients', 'customer_data', 'user_data', 'pension_data'];
    
    console.log('Checking for tables...');
    
    // First, let's see what tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nAvailable tables:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    // Now get columns for each table
    for (const table of tablesResult.rows) {
      console.log(`\n--- Columns for table: ${table.table_name} ---`);
      
      const columnsResult = await pool.query(query, [table.table_name]);
      
      if (columnsResult.rows.length > 0) {
        console.log('Column Name | Data Type | Nullable');
        console.log('------------|-----------|----------');
        columnsResult.rows.forEach(row => {
          console.log(`${row.column_name.padEnd(12)} | ${row.data_type.padEnd(9)} | ${row.is_nullable}`);
        });
        
        // Also show just the column names for easy copying
        console.log('\nColumn names only:');
        const columnNames = columnsResult.rows.map(row => row.column_name);
        console.log(columnNames.join(', '));
      } else {
        console.log('No columns found');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // If PostgreSQL connection fails, also show SQLite query alternative
    console.log('\n--- Alternative: SQLite Query ---');
    console.log('If you are using SQLite instead, run this query:');
    console.log('PRAGMA table_info(your_table_name);');
    console.log('\nOr in Node.js with SQLite:');
    console.log(`
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database/pension_insights.db');

db.all("SELECT name FROM pragma_table_info('your_table_name')", (err, rows) => {
  if (err) console.error(err);
  else console.log('Columns:', rows.map(row => row.name));
});
    `);
  } finally {
    await pool.end();
  }
}

// Alternative function to get sample data to see actual field names
async function getSampleData() {
  try {
    console.log('\n--- Getting Sample Data ---');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    for (const table of tablesResult.rows) {
      console.log(`\n--- Sample data from: ${table.table_name} ---`);
      
      const sampleResult = await pool.query(`SELECT * FROM ${table.table_name} LIMIT 1`);
      
      if (sampleResult.rows.length > 0) {
        console.log('Sample row keys:', Object.keys(sampleResult.rows[0]));
        console.log('Sample row data:', sampleResult.rows[0]);
      } else {
        console.log('No data found in table');
      }
    }
    
  } catch (error) {
    console.error('Error getting sample data:', error.message);
  }
}

// Run both functions
getColumnNames().then(() => {
  console.log('\n='.repeat(50));
  return getSampleData();
});


