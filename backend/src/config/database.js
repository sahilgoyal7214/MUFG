import pkg from 'pg';
const { Pool } = pkg;
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dual Database Connection (PostgreSQL + SQLite fallback)
 * Automatically falls back to SQLite if PostgreSQL is unavailable
 */
class DatabaseConnection {
  constructor() {
    this.dbType = null;
    this.pool = null;
    this.sqlite = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Try PostgreSQL first
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString && connectionString.startsWith('postgresql://')) {
      try {
        console.log('🔄 Attempting PostgreSQL connection...');
        this.pool = new Pool({
          connectionString: connectionString,
          ssl: {
            rejectUnauthorized: false
          },
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000, // 5 second timeout
        });

        // Test the connection
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        
        this.dbType = 'postgresql';
        console.log('🟢 PostgreSQL connection successful');
        
        this.pool.on('error', (err) => {
          console.error('PostgreSQL pool error:', err);
        });
        
      } catch (error) {
        console.log('🟡 PostgreSQL unavailable, falling back to SQLite:', error.message);
        await this.initializeSQLite();
      }
    } else {
      console.log('🟡 No PostgreSQL URL found, using SQLite');
      await this.initializeSQLite();
    }
    
    this.initialized = true;
  }

  async initializeSQLite() {
    try {
      const dbPath = path.join(__dirname, '../../database/pension_insights.db');
      console.log('📁 SQLite database path:', dbPath);
      
      this.sqlite = new Database(dbPath);
      this.dbType = 'sqlite';
      console.log('🟢 SQLite connection successful');
      
      // Enable foreign keys
      this.sqlite.exec('PRAGMA foreign_keys = ON');
    } catch (error) {
      console.error('❌ SQLite initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient() {
    await this.initialize();
    
    if (this.dbType === 'postgresql') {
      try {
        return await this.pool.connect();
      } catch (error) {
        console.error('Error getting PostgreSQL client:', error);
        throw error;
      }
    } else {
      // For SQLite, return the database instance
      return this.sqlite;
    }
  }

  /**
   * Execute a query with parameters
   */
  async query(text, params = []) {
    await this.initialize();
    
    const start = Date.now();
    let result;

    if (this.dbType === 'postgresql') {
      const client = await this.getClient();
      try {
        result = await client.query(text, params);
        client.release();
      } catch (error) {
        client.release();
        throw error;
      }
    } else {
      // Convert PostgreSQL syntax to SQLite
      const sqliteQuery = this.convertToSQLite(text);
      try {
        if (sqliteQuery.toLowerCase().trim().startsWith('select')) {
          const stmt = this.sqlite.prepare(sqliteQuery);
          const rows = stmt.all(params);
          result = { rows, rowCount: rows.length };
        } else {
          const stmt = this.sqlite.prepare(sqliteQuery);
          const info = stmt.run(params);
          result = { 
            rows: [], 
            rowCount: info.changes || 0,
            insertId: info.lastInsertRowid 
          };
        }
      } catch (error) {
        console.error('SQLite query error:', error);
        console.error('Query:', sqliteQuery);
        console.error('Params:', params);
        throw error;
      }
    }
    
    const duration = Date.now() - start;
    console.log('📊 Executed query', { 
      db: this.dbType,
      text: text.substring(0, 100) + '...', 
      duration, 
      rows: result.rowCount 
    });
    
    return result;
  }

  /**
   * Convert PostgreSQL syntax to SQLite
   */
  convertToSQLite(query) {
    return query
      .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/CURRENT_TIMESTAMP/gi, 'datetime("now")')
      .replace(/\$(\d+)/g, '?') // Convert $1, $2, etc. to ?
      .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
      .replace(/INTEGER/gi, 'INTEGER')
      .replace(/DECIMAL\([^)]+\)/gi, 'REAL')
      .replace(/ON CONFLICT[^;]+/gi, '') // Remove ON CONFLICT clauses for now
      .replace(/INDEX\s+\w+\s*\([^)]+\)/gi, ''); // Remove inline indexes
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries) {
    await this.initialize();
    
    if (this.dbType === 'postgresql') {
      const client = await this.getClient();
      try {
        await client.query('BEGIN');
        const results = [];
        
        for (const { text, params } of queries) {
          const result = await client.query(text, params);
          results.push(result);
        }
        
        await client.query('COMMIT');
        console.log('✅ PostgreSQL transaction completed successfully');
        client.release();
        return results;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ PostgreSQL transaction rolled back:', error);
        client.release();
        throw error;
      }
    } else {
      // SQLite transaction
      try {
        this.sqlite.exec('BEGIN TRANSACTION');
        const results = [];
        
        for (const { text, params } of queries) {
          const sqliteQuery = this.convertToSQLite(text);
          const stmt = this.sqlite.prepare(sqliteQuery);
          const info = stmt.run(params);
          results.push({ rows: [], rowCount: info.changes || 0 });
        }
        
        this.sqlite.exec('COMMIT');
        console.log('✅ SQLite transaction completed successfully');
        return results;
      } catch (error) {
        this.sqlite.exec('ROLLBACK');
        console.error('❌ SQLite transaction rolled back:', error);
        throw error;
      }
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      await this.initialize();
      
      if (this.dbType === 'postgresql') {
        const result = await this.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('🟢 PostgreSQL connection test successful:', {
          time: result.rows[0].current_time,
          version: result.rows[0].postgres_version.split(' ')[0]
        });
      } else {
        const result = await this.query("SELECT datetime('now') as current_time, sqlite_version() as sqlite_version");
        console.log('🟢 SQLite connection test successful:', {
          time: result.rows[0].current_time,
          version: result.rows[0].sqlite_version
        });
      }
      return true;
    } catch (error) {
      console.error('🔴 Database connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations() {
    const { readdir, readFile } = await import('fs/promises');
    
    try {
      const migrationsDir = path.join(process.cwd(), 'database/migrations');
      const files = await readdir(migrationsDir);
      
      // Filter migrations based on database type
      let sqlFiles;
      if (this.dbType === 'sqlite') {
        // Prefer SQLite-specific migrations
        sqlFiles = files.filter(file => file.includes('sqlite') && file.endsWith('.sql')).sort();
        if (sqlFiles.length === 0) {
          // Fallback to general migrations
          sqlFiles = files.filter(file => !file.includes('sqlite') && file.endsWith('.sql')).sort();
        }
      } else {
        // Use PostgreSQL migrations
        sqlFiles = files.filter(file => !file.includes('sqlite') && file.endsWith('.sql')).sort();
      }
      
      console.log(`🔄 Running ${sqlFiles.length} ${this.dbType} migration(s)...`);
      
      for (const file of sqlFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = await readFile(filePath, 'utf8');
        
        console.log(`📝 Running migration: ${file}`);
        
        if (this.dbType === 'sqlite') {
          // For SQLite, split and execute statements separately
          const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
          for (const statement of statements) {
            const cleanStatement = statement.trim();
            if (cleanStatement && !cleanStatement.startsWith('--')) {
              try {
                this.sqlite.exec(cleanStatement);
              } catch (error) {
                console.error(`Error executing statement: ${cleanStatement.substring(0, 100)}...`);
                throw error;
              }
            }
          }
        } else {
          await this.query(sql);
        }
        
        console.log(`✅ Migration completed: ${file}`);
      }
      
      console.log('🎉 All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get table information
   */
  async getTableInfo(tableName) {
    if (this.dbType === 'postgresql') {
      const query = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;
      const result = await this.query(query, [tableName]);
      return result.rows;
    } else {
      const query = `PRAGMA table_info(${tableName})`;
      const result = await this.query(query);
      return result.rows;
    }
  }

  /**
   * Get record count for a table
   */
  async getRecordCount(tableName) {
    const result = await this.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  }

  /**
   * Close all connections
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
    }
    if (this.sqlite) {
      this.sqlite.close();
    }
    console.log('🔒 Database connections closed');
  }
}

// Create singleton instance
const db = new DatabaseConnection();

export default db;
