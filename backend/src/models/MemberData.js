/**
 * Member Data Model
 * Handles pension member data and analytics
 */

import db from '../config/database.js';
import KpiService from '../services/KpiService.js';

export class MemberData {
  constructor(data = {}) {
    this.id = data.id;
    this.memberId = data.member_id || data.memberId;
    this.personalInfo = data.personal_info || data.personalInfo || {};
    this.employmentInfo = data.employment_info || data.employmentInfo || {};
    this.pensionDetails = data.pension_details || data.pensionDetails || {};
    this.contributions = data.contributions || [];
    this.projections = data.projections || {};
    this.riskProfile = data.risk_profile || data.riskProfile || {};
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  static async findByMemberId(memberId) {
    try {
      const query = 'SELECT * FROM member_data WHERE member_id = $1';
      const result = await db.query(query, [memberId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new MemberData(result.rows[0]);
    } catch (error) {
      console.error('Error finding member data by member ID:', error);
      throw error;
    }
  }

  static async create(memberData) {
    try {
      const query = `
        INSERT INTO member_data 
        (member_id, personal_info, employment_info, pension_details, contributions, projections, risk_profile, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        memberData.memberId || memberData.member_id,
        JSON.stringify(memberData.personalInfo || {}),
        JSON.stringify(memberData.employmentInfo || {}),
        JSON.stringify(memberData.pensionDetails || {}),
        JSON.stringify(memberData.contributions || []),
        JSON.stringify(memberData.projections || {}),
        JSON.stringify(memberData.riskProfile || {}),
        new Date(),
        new Date()
      ];
      
      const result = await db.query(query, values);
      return new MemberData(result.rows[0]);
    } catch (error) {
      console.error('Error creating member data:', error);
      throw error;
    }
  }

  static async update(memberId, updateData) {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic SET clause
      if (updateData.personalInfo !== undefined) {
        setClause.push(`personal_info = $${paramCount++}`);
        values.push(JSON.stringify(updateData.personalInfo));
      }
      if (updateData.employmentInfo !== undefined) {
        setClause.push(`employment_info = $${paramCount++}`);
        values.push(JSON.stringify(updateData.employmentInfo));
      }
      if (updateData.pensionDetails !== undefined) {
        setClause.push(`pension_details = $${paramCount++}`);
        values.push(JSON.stringify(updateData.pensionDetails));
      }
      if (updateData.contributions !== undefined) {
        setClause.push(`contributions = $${paramCount++}`);
        values.push(JSON.stringify(updateData.contributions));
      }
      if (updateData.projections !== undefined) {
        setClause.push(`projections = $${paramCount++}`);
        values.push(JSON.stringify(updateData.projections));
      }
      if (updateData.riskProfile !== undefined) {
        setClause.push(`risk_profile = $${paramCount++}`);
        values.push(JSON.stringify(updateData.riskProfile));
      }

      // Always update the updated_at timestamp
      setClause.push(`updated_at = $${paramCount++}`);
      values.push(new Date());

      // Add the member ID parameter
      values.push(memberId);

      const query = `
        UPDATE member_data 
        SET ${setClause.join(', ')}
        WHERE member_id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new MemberData(result.rows[0]);
    } catch (error) {
      console.error('Error updating member data:', error);
      throw error;
    }
  }

  static async getContributionHistory(memberId, startDate, endDate) {
    try {
      let query = `
        SELECT contributions 
        FROM member_data 
        WHERE member_id = $1
      `;
      const values = [memberId];

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return [];
      }

      let contributions = result.rows[0].contributions || [];
      
      // Filter by date range if provided
      if (startDate || endDate) {
        contributions = contributions.filter(contribution => {
          const contributionDate = new Date(contribution.date);
          if (startDate && contributionDate < new Date(startDate)) return false;
          if (endDate && contributionDate > new Date(endDate)) return false;
          return true;
        });
      }

      return contributions;
    } catch (error) {
      console.error('Error getting contribution history:', error);
      throw error;
    }
  }

  static async getProjections(memberId) {
    try {
      const query = 'SELECT projections FROM member_data WHERE member_id = $1';
      const result = await db.query(query, [memberId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].projections || {};
    } catch (error) {
      console.error('Error getting projections:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM member_data WHERE 1=1';
      const values = [];
      let paramCount = 1;

      // Add filters
      if (filters.ageRange) {
        const { min, max } = filters.ageRange;
        if (min) {
          query += ` AND (personal_info->>'age')::int >= $${paramCount++}`;
          values.push(min);
        }
        if (max) {
          query += ` AND (personal_info->>'age')::int <= $${paramCount++}`;
          values.push(max);
        }
      }

      if (filters.riskTolerance) {
        query += ` AND risk_profile->>'tolerance' = $${paramCount++}`;
        values.push(filters.riskTolerance);
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
      return result.rows.map(row => new MemberData(row));
    } catch (error) {
      console.error('Error finding all member data:', error);
      throw error;
    }
  }

  // Calculate retirement readiness score
  calculateReadinessScore() {
    // Implementation for calculating pension readiness score
    const currentAge = this.personalInfo.age || 30;
    const retirementAge = this.pensionDetails.retirementAge || 65;
    const currentBalance = this.pensionDetails.currentBalance || 0;
    const monthlyContribution = this.pensionDetails.monthlyContribution || 0;
    
    // Simplified calculation - replace with actual algorithm
    const yearsToRetirement = retirementAge - currentAge;
    const projectedBalance = currentBalance + (monthlyContribution * 12 * yearsToRetirement);
    const targetBalance = this.pensionDetails.targetBalance || 1000000;
    
    return Math.min(100, (projectedBalance / targetBalance) * 100);
  }

  toJSON() {
    return {
      id: this.id,
      memberId: this.memberId,
      personalInfo: this.personalInfo,
      employmentInfo: this.employmentInfo,
      pensionDetails: this.pensionDetails,
      contributions: this.contributions,
      projections: this.projections,
      riskProfile: this.riskProfile,
      readinessScore: this.calculateReadinessScore(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
