/**
 * User Model
 * Defines the user entity for the pension insights platform
 */

import { ROLES } from '../config/roles.js';

export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.memberId = data.memberId;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || ROLES.MEMBER;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLoginAt = data.lastLoginAt;
    this.profile = data.profile || {};
  }

  // Static methods for database operations
  static async findById(id) {
    // Implementation depends on your database choice
    // This is a placeholder for the actual database query
    throw new Error('Database implementation required');
  }

  static async findByMemberId(memberId) {
    // Find user by member ID
    throw new Error('Database implementation required');
  }

  static async findByEmail(email) {
    // Find user by email
    throw new Error('Database implementation required');
  }

  static async create(userData) {
    // Create new user
    throw new Error('Database implementation required');
  }

  static async update(id, updateData) {
    // Update user
    throw new Error('Database implementation required');
  }

  static async delete(id) {
    // Soft delete user (set isActive to false)
    throw new Error('Database implementation required');
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

  toSafeJSON() {
    const data = this.toJSON();
    // Remove sensitive information for public responses
    delete data.email;
    return data;
  }
}
