/**
 * User Model
 * Defines the user entity for the pension insights platform
 */

import db from '../config/database.js';
import { ROLES } from '../config/roles.js';

export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.memberId = data.member_id || data.memberId;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || ROLES.MEMBER;
    this.isActive = data.is_active !== undefined ? data.is_active : data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
    this.lastLoginAt = data.last_login_at || data.lastLoginAt;
    this.profile = data.profile || {};
  }

  // Static methods for database operations
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByMemberId(memberId) {
    try {
      const query = 'SELECT * FROM users WHERE member_id = $1 AND is_active = true';
      const result = await db.query(query, [memberId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by member ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
      const result = await db.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const query = `
        INSERT INTO users (member_id, email, name, role, is_active, created_at, updated_at, profile)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        userData.memberId || userData.member_id,
        userData.email,
        userData.name,
        userData.role || ROLES.MEMBER,
        userData.isActive !== undefined ? userData.isActive : true,
        new Date(),
        new Date(),
        JSON.stringify(userData.profile || {})
      ];
      
      const result = await db.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic SET clause
      if (updateData.email !== undefined) {
        setClause.push(`email = $${paramCount++}`);
        values.push(updateData.email);
      }
      if (updateData.name !== undefined) {
        setClause.push(`name = $${paramCount++}`);
        values.push(updateData.name);
      }
      if (updateData.role !== undefined) {
        setClause.push(`role = $${paramCount++}`);
        values.push(updateData.role);
      }
      if (updateData.isActive !== undefined) {
        setClause.push(`is_active = $${paramCount++}`);
        values.push(updateData.isActive);
      }
      if (updateData.lastLoginAt !== undefined) {
        setClause.push(`last_login_at = $${paramCount++}`);
        values.push(updateData.lastLoginAt);
      }
      if (updateData.profile !== undefined) {
        setClause.push(`profile = $${paramCount++}`);
        values.push(JSON.stringify(updateData.profile));
      }

      // Always update the updated_at timestamp
      setClause.push(`updated_at = $${paramCount++}`);
      values.push(new Date());

      // Add the ID parameter
      values.push(id);

      const query = `
        UPDATE users 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Soft delete - set isActive to false
      const query = `
        UPDATE users 
        SET is_active = false, updated_at = $1
        WHERE id = $2 AND is_active = true
        RETURNING *
      `;
      
      const result = await db.query(query, [new Date(), id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM users WHERE is_active = true';
      const values = [];
      let paramCount = 1;

      // Add filters
      if (filters.role) {
        query += ` AND role = $${paramCount++}`;
        values.push(filters.role);
      }

      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount++} OR email ILIKE $${paramCount++})`;
        values.push(`%${filters.search}%`, `%${filters.search}%`);
        paramCount++; // Account for second parameter
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramCount++}`;
        values.push(filters.limit);
      }

      if (filters.offset) {
        query += ` OFFSET $${paramCount++}`;
        values.push(filters.offset);
      }

      const result = await db.query(query, values);
      return result.rows.map(row => new User(row));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // Instance methods
  toJSON() {
    return {
      id: this.id,
      memberId: this.memberId,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
      profile: this.profile
    };
  }

  toPublicJSON() {
    return {
      id: this.id,
      memberId: this.memberId,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      profile: this.profile
    };
  }

  toSafeJSON() {
    const data = this.toJSON();
    // Remove sensitive information for public responses
    delete data.email;
    return data;
  }

  static async findByAdvisor(advisorId) {
    try {
      // TODO: Implement advisor-client relationship logic
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error finding users by advisor:', error);
      throw error;
    }
  }
}
