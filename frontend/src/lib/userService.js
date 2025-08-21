import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export const userService = {
  // Get user by username
  async getUserByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await pool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  },

  // Hash password
  async hashPassword(password) {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const { username, email, password, role, fullName, roleData } = userData;
      const hashedPassword = await this.hashPassword(password);
      
      const query = `
        INSERT INTO users (username, email, password, role, full_name, role_data, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        username,
        email,
        hashedPassword,
        role,
        fullName,
        JSON.stringify(roleData)
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Initialize database with default users if they don't exist
  async initializeDefaultUsers() {
    try {
      // Check if users table exists and has data
      const checkQuery = 'SELECT COUNT(*) FROM users';
      const result = await pool.query(checkQuery);
      const userCount = parseInt(result.rows[0].count);

      if (userCount === 0) {
        console.log('Initializing default users...');
        
        const defaultUsers = [
          {
            username: 'member1',
            email: 'member1@mufg.com',
            password: 'password123',
            role: 'member',
            fullName: 'John Member',
            roleData: {
              memberId: 'M001',
              age: 34,
              salary: 65000,
              contribution: 520,
              balance: 45200,
              riskLevel: 'Medium',
              employment: 'Full-time'
            }
          },
          {
            username: 'advisor1',
            email: 'advisor1@mufg.com',
            password: 'password123',
            role: 'advisor',
            fullName: 'Jane Advisor',
            roleData: {
              totalClients: 247,
              assetsUnderManagement: 45200000,
              avgPerformance: 7.8,
              clientsNeedingReview: 18
            }
          },
          {
            username: 'regulator1',
            email: 'regulator1@mufg.com',
            password: 'password123',
            role: 'regulator',
            fullName: 'Robert Regulator',
            roleData: {
              totalSchemes: 1247,
              complianceRate: 94.2,
              pendingReviews: 73,
              riskAlerts: 12
            }
          }
        ];

        for (const user of defaultUsers) {
          await this.createUser(user);
        }

        console.log('Default users created successfully');
      }
    } catch (error) {
      console.error('Error initializing default users:', error);
      // Don't throw here as the table might not exist yet
    }
  }
};

export default userService;
