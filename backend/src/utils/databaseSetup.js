/**
 * Database Setup and Migration Utility
 * Handles database initialization and schema setup
 */

import db from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
export const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, '../../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Split by semicolons and execute each statement
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await db.query(statement);
        }
      }
      
      console.log(`✅ Migration completed: ${file}`);
    }
    
    console.log('🎉 All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Check if tables exist
 */
export const checkTablesExist = async () => {
  try {
    const requiredTables = ['users', 'pension_data'];
    const results = {};
    
    for (const table of requiredTables) {
      try {
        await db.query(`SELECT 1 FROM ${table} LIMIT 1`);
        results[table] = true;
      } catch (error) {
        results[table] = false;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking tables:', error);
    return {};
  }
};

/**
 * Create database schema if not exists
 */
export const ensureSchema = async () => {
  try {
    console.log('🔍 Checking database schema...');
    
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist.users || !tablesExist.pension_data) {
      console.log('📦 Creating missing tables...');
      await runMigrations();
    } else {
      console.log('✅ Database schema is up to date');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Schema setup failed:', error);
    throw error;
  }
};

/**
 * Seed database with initial data
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Check if data already exists
    const result = await db.query('SELECT COUNT(*) FROM pension_data');
    const count = parseInt(result.rows[0].count);
    
    if (count > 0) {
      console.log('📊 Database already contains data, skipping seed');
      return false;
    }
    
    // Import Excel data if available
    try {
      const { readExcelData } = await import('./excelReader.js');
      const excelData = readExcelData();
      
      if (excelData && excelData.data.length > 0) {
        console.log(`📈 Importing ${excelData.data.length} records from Excel...`);
        
        // TODO: Implement bulk insert of Excel data
        console.log('⚠️  Excel import not yet implemented');
        
        return true;
      }
    } catch (error) {
      console.log('⚠️  Excel data not available, using sample data');
    }
    
    // Insert sample data
    const sampleData = [
      {
        user_id: 'SAMPLE001',
        age: 35,
        annual_income: 75000,
        current_savings: 150000,
        risk_tolerance: 'moderate',
        retirement_age_goal: 65
      }
    ];
    
    for (const record of sampleData) {
      await db.query(`
        INSERT INTO pension_data (user_id, age, annual_income, current_savings, risk_tolerance, retirement_age_goal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        record.user_id,
        record.age,
        record.annual_income,
        record.current_savings,
        record.risk_tolerance,
        record.retirement_age_goal
      ]);
    }
    
    console.log('✅ Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Initialize database (run migrations and seed if needed)
 */
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    await ensureSchema();
    await seedDatabase();
    
    console.log('🎉 Database initialization completed');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
