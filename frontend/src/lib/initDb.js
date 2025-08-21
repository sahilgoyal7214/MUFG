import pool from './db';

export async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');

    // Create users table if it doesn't exist
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'advisor', 'regulator')),
        full_name VARCHAR(100) NOT NULL,
        role_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await pool.query(createUsersTable);
    console.log('Users table created/verified successfully');

    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);'
    ];

    for (const indexQuery of createIndexes) {
      await pool.query(indexQuery);
    }

    console.log('Database indexes created/verified successfully');
    console.log('Database initialization completed');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default initializeDatabase;
