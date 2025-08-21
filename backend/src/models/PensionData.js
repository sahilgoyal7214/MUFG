import db from '../config/database.js';

/**
 * PensionData Model
 * Provides an object-oriented interface for pension data operations
 */
class PensionData {
  constructor(data = {}) {
    // Personal Information
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.age = data.age || null;
    this.gender = data.gender || null;
    this.country = data.country || null;
    this.employment_status = data.employment_status || null;
    this.marital_status = data.marital_status || null;
    this.number_of_dependents = data.number_of_dependents || null;
    this.education_level = data.education_level || null;
    this.health_status = data.health_status || null;
    this.life_expectancy_estimate = data.life_expectancy_estimate || null;

    // Financial Information
    this.annual_income = data.annual_income || null;
    this.current_savings = data.current_savings || null;
    this.debt_level = data.debt_level || null;
    this.monthly_expenses = data.monthly_expenses || null;
    this.savings_rate = data.savings_rate || null;
    this.home_ownership_status = data.home_ownership_status || null;

    // Pension & Retirement Planning
    this.retirement_age_goal = data.retirement_age_goal || null;
    this.risk_tolerance = data.risk_tolerance || null;
    this.contribution_amount = data.contribution_amount || null;
    this.contribution_frequency = data.contribution_frequency || null;
    this.employer_contribution = data.employer_contribution || null;
    this.total_annual_contribution = data.total_annual_contribution || null;
    this.years_contributed = data.years_contributed || null;

    // Investment Information
    this.investment_type = data.investment_type || null;
    this.fund_name = data.fund_name || null;
    this.annual_return_rate = data.annual_return_rate || null;
    this.volatility = data.volatility || null;
    this.fees_percentage = data.fees_percentage || null;
    this.investment_experience_level = data.investment_experience_level || null;
    this.portfolio_diversity_score = data.portfolio_diversity_score || null;

    // Pension Projections
    this.projected_pension_amount = data.projected_pension_amount || null;
    this.expected_annual_payout = data.expected_annual_payout || null;
    this.inflation_adjusted_payout = data.inflation_adjusted_payout || null;
    this.years_of_payout = data.years_of_payout || null;
    this.survivor_benefits = data.survivor_benefits || null;
    this.pension_type = data.pension_type || null;
    this.withdrawal_strategy = data.withdrawal_strategy || null;

    // Benefits Eligibility
    this.tax_benefits_eligibility = data.tax_benefits_eligibility || null;
    this.government_pension_eligibility = data.government_pension_eligibility || null;
    this.private_pension_eligibility = data.private_pension_eligibility || null;
    this.insurance_coverage = data.insurance_coverage || null;

    // Financial Goals & Planning
    this.financial_goals = data.financial_goals || null;

    // Transaction Information
    this.transaction_id = data.transaction_id || null;
    this.transaction_amount = data.transaction_amount || null;
    this.transaction_date = data.transaction_date || null;
    this.transaction_channel = data.transaction_channel || null;
    this.time_of_transaction = data.time_of_transaction || null;

    // Security & Fraud Detection
    this.suspicious_flag = data.suspicious_flag || null;
    this.anomaly_score = data.anomaly_score || null;
    this.transaction_pattern_score = data.transaction_pattern_score || null;
    this.previous_fraud_flag = data.previous_fraud_flag || null;

    // Technical Information
    this.ip_address = data.ip_address || null;
    this.device_id = data.device_id || null;
    this.geo_location = data.geo_location || null;
    this.account_age = data.account_age || null;

    // Audit Fields
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Save the current instance to database (INSERT or UPDATE)
   */
  async save() {
    try {
      if (this.id) {
        return await this.update();
      } else {
        return await this.create();
      }
    } catch (error) {
      console.error('Error saving pension data:', error);
      throw error;
    }
  }

  /**
   * Create new record in database
   */
  async create() {
    try {
      const allFields = this.getValidFields();
      const validFields = await this.getDatabaseFields();
      
      // Filter fields to only include ones that exist in the database
      const fields = {};
      for (const [key, value] of Object.entries(allFields)) {
        if (validFields.includes(key)) {
          fields[key] = value;
        }
      }
      
      const columns = Object.keys(fields).join(', ');
      const placeholders = Object.keys(fields).map((_, index) => `$${index + 1}`).join(', ');
      const values = Object.values(fields);

      const query = `INSERT INTO pension_data (${columns}) VALUES (${placeholders}) RETURNING id`;
      const result = await db.query(query, values);

      this.id = result.rows[0]?.id;
      this.created_at = new Date().toISOString();
      this.updated_at = new Date().toISOString();

      return this;
    } catch (error) {
      console.error('Error creating pension data:', error);
      throw error;
    }
  }

  /**
   * Update existing record in database
   */
  async update() {
    try {
      if (!this.id) {
        throw new Error('Cannot update record without ID');
      }

      // Get all fields from the instance, excluding system fields
      const allFields = {};
      const excludeFields = ['save', 'create', 'update', 'delete', 'getValidFields', 'toJSON', 'id', 'created_at', 'updated_at'];

      // Get valid fields that exist in the database
      const validFields = await this.getDatabaseFields();

      for (const [key, value] of Object.entries(this)) {
        if (!excludeFields.includes(key) && typeof value !== 'function' && validFields.includes(key)) {
          allFields[key] = value;
        }
      }

      // If no fields to update, just return
      if (Object.keys(allFields).length === 0) {
        return this;
      }

      const fieldNames = Object.keys(allFields);
      const fieldValues = Object.values(allFields);
      
      // Create SET clause with proper parameter indexing
      const setClause = fieldNames.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      // Add ID as the last parameter
      const values = [...fieldValues, this.id];
      const whereParamIndex = values.length;
      
      const query = `UPDATE pension_data SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${whereParamIndex}`;
      
      await db.query(query, values);

      this.updated_at = new Date().toISOString();
      return this;
    } catch (error) {
      console.error('Error updating pension data:', error);
      throw error;
    }
  }

  /**
   * Delete record from database
   */
  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete record without ID');
      }

      const query = 'DELETE FROM pension_data WHERE id = $1';
      await db.query(query, [this.id]);
      
      return true;
    } catch (error) {
      console.error('Error deleting pension data:', error);
      throw error;
    }
  }

  /**
   * Get field names that exist in the database schema
   */
  async getDatabaseFields() {
    try {
      const tableInfo = await db.getTableInfo('pension_data');
      return tableInfo.map(col => col.column_name || col.name);
    } catch (error) {
      console.error('Error getting database fields:', error);
      // Fallback to common PostgreSQL fields if schema check fails
      return [
        'user_id', 'age', 'gender', 'country', 'employment_status', 'marital_status',
        'number_of_dependents', 'education_level', 'health_status', 'life_expectancy_estimate',
        'annual_income', 'current_savings', 'debt_level', 'monthly_expenses', 'savings_rate',
        'home_ownership_status', 'retirement_age_goal', 'risk_tolerance', 'contribution_amount',
        'contribution_frequency', 'employer_contribution', 'total_annual_contribution',
        'years_contributed', 'investment_type', 'fund_name', 'annual_return_rate', 'volatility',
        'fees_percentage', 'investment_experience_level', 'portfolio_diversity_score',
        'projected_pension_amount', 'expected_annual_payout', 'inflation_adjusted_payout',
        'years_of_payout', 'pension_type', 'anomaly_score', 'risk_assessment_score',
        'fraud_detection_score', 'transaction_pattern_score', 'kyc_status', 'compliance_score',
        'regulatory_flag', 'last_compliance_check', 'additional_notes', 'suspicious_flag'
      ];
    }
  }

  /**
   * Get fields that have non-null values for database operations
   */
  getValidFields() {
    const fields = {};
    const excludeFields = ['save', 'create', 'update', 'delete', 'getValidFields', 'toJSON'];

    for (const [key, value] of Object.entries(this)) {
      if (value !== null && !excludeFields.includes(key) && typeof value !== 'function') {
        fields[key] = value;
      }
    }

    return fields;
  }

  /**
   * Convert instance to JSON (excluding methods)
   */
  toJSON() {
    const json = {};
    const excludeFields = ['save', 'create', 'update', 'delete', 'getValidFields', 'toJSON'];

    for (const [key, value] of Object.entries(this)) {
      if (!excludeFields.includes(key) && typeof value !== 'function') {
        json[key] = value;
      }
    }

    return json;
  }

  // ==================== STATIC METHODS ====================

  /**
   * Find record by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM pension_data WHERE id = $1';
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new PensionData(result.rows[0]);
    } catch (error) {
      console.error('Error finding pension data by ID:', error);
      throw error;
    }
  }

  /**
   * Find record by user ID
   */
  static async findByUserId(userId) {
    try {
      const query = 'SELECT * FROM pension_data WHERE user_id = $1';
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new PensionData(result.rows[0]);
    } catch (error) {
      console.error('Error finding pension data by user ID:', error);
      throw error;
    }
  }

  /**
   * Find all records with optional filtering and pagination
   */
  static async findAll(options = {}) {
    try {
      let query = 'SELECT * FROM pension_data';
      const params = [];
      const conditions = [];

      // Add WHERE conditions
      if (options.where) {
        let paramIndex = 1;
        for (const [field, value] of Object.entries(options.where)) {
          conditions.push(`${field} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add ORDER BY
      if (options.orderBy) {
        const direction = options.orderDirection || 'ASC';
        query += ` ORDER BY ${options.orderBy} ${direction}`;
      }

      // Add LIMIT and OFFSET for pagination
      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
        if (options.offset) {
          query += ` OFFSET ${options.offset}`;
        }
      }

      const result = await db.query(query, params);
      return result.rows.map(row => new PensionData(row));
    } catch (error) {
      console.error('Error finding pension data:', error);
      throw error;
    }
  }

  /**
   * Get paginated results
   */
  static async paginate(page = 1, limit = 10, options = {}) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM pension_data';
      const countParams = [];
      const conditions = [];

      if (options.where) {
        let paramIndex = 1;
        for (const [field, value] of Object.entries(options.where)) {
          conditions.push(`${field} = $${paramIndex}`);
          countParams.push(value);
          paramIndex++;
        }
      }

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countResult = await db.query(countQuery, countParams);
      const total = countResult.rows[0].total;

      // Get paginated data
      const data = await PensionData.findAll({
        ...options,
        limit,
        offset
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error paginating pension data:', error);
      throw error;
    }
  }

  /**
   * Find records by country
   */
  static async findByCountry(country, options = {}) {
    return await PensionData.findAll({
      ...options,
      where: { ...options.where, country }
    });
  }

  /**
   * Find records by pension type
   */
  static async findByPensionType(pensionType, options = {}) {
    return await PensionData.findAll({
      ...options,
      where: { ...options.where, pension_type: pensionType }
    });
  }

  /**
   * Find records by risk tolerance
   */
  static async findByRiskTolerance(riskTolerance, options = {}) {
    return await PensionData.findAll({
      ...options,
      where: { ...options.where, risk_tolerance: riskTolerance }
    });
  }

  /**
   * Find suspicious records
   */
  static async findSuspicious(options = {}) {
    return await PensionData.findAll({
      ...options,
      where: { ...options.where, suspicious_flag: 'Yes' }
    });
  }

  /**
   * Get comprehensive statistics for analytics dashboard
   */
  static async getStatistics() {
    try {
      const basicStatsQuery = `
        SELECT 
          COUNT(*) as total_members,
          COUNT(DISTINCT country) as countries,
          AVG(age) as avg_age,
          AVG(annual_income) as avg_income,
          AVG(current_savings) as average_balance,
          SUM(current_savings) as total_savings,
          SUM(contribution_amount) as total_contributions,
          COUNT(CASE WHEN suspicious_flag = 'Yes' THEN 1 END) as suspicious_records,
          MIN(created_at) as oldest_record,
          MAX(created_at) as newest_record
        FROM pension_data
      `;

      const riskDistributionQuery = `
        SELECT 
          risk_tolerance,
          COUNT(*) as count
        FROM pension_data 
        WHERE risk_tolerance IS NOT NULL
        GROUP BY risk_tolerance
      `;

      const complianceQuery = `
        SELECT 
          COUNT(CASE WHEN suspicious_flag = 'No' OR suspicious_flag IS NULL THEN 1 END) as compliant_members,
          COUNT(CASE WHEN suspicious_flag = 'Yes' THEN 1 END) as non_compliant_members
        FROM pension_data
      `;

      const performanceQuery = `
        SELECT 
          AVG(annual_return_rate) as average_return,
          AVG(portfolio_diversity_score) as avg_diversity_score,
          COUNT(CASE WHEN annual_return_rate > 0.08 THEN 1 END) as high_performers
        FROM pension_data
        WHERE annual_return_rate IS NOT NULL
      `;

      const [basicStats, riskDistribution, compliance, performance] = await Promise.all([
        db.query(basicStatsQuery),
        db.query(riskDistributionQuery),
        db.query(complianceQuery),
        db.query(performanceQuery)
      ]);

      const riskDist = {};
      riskDistribution.rows.forEach(row => {
        riskDist[row.risk_tolerance] = parseInt(row.count);
      });

      return {
        totalMembers: parseInt(basicStats.rows[0].total_members) || 0,
        countries: parseInt(basicStats.rows[0].countries) || 0,
        averageAge: parseFloat(basicStats.rows[0].avg_age) || 0,
        averageIncome: parseFloat(basicStats.rows[0].avg_income) || 0,
        averageBalance: parseFloat(basicStats.rows[0].average_balance) || 0,
        totalSavings: parseFloat(basicStats.rows[0].total_savings) || 0,
        totalContributions: parseFloat(basicStats.rows[0].total_contributions) || 0,
        suspiciousRecords: parseInt(basicStats.rows[0].suspicious_records) || 0,
        riskDistribution: riskDist,
        compliantMembers: parseInt(compliance.rows[0].compliant_members) || 0,
        nonCompliantMembers: parseInt(compliance.rows[0].non_compliant_members) || 0,
        performanceMetrics: {
          averageReturn: parseFloat(performance.rows[0].average_return) || 0,
          avgDiversityScore: parseFloat(performance.rows[0].avg_diversity_score) || 0,
          highPerformers: parseInt(performance.rows[0].high_performers) || 0
        },
        projectedRetirements: parseInt(basicStats.rows[0].total_members) || 0, // Placeholder
        dataRange: {
          oldestRecord: basicStats.rows[0].oldest_record,
          newestRecord: basicStats.rows[0].newest_record
        }
      };
    } catch (error) {
      console.error('Error getting pension data statistics:', error);
      // Return default values on error
      return {
        totalMembers: 0,
        countries: 0,
        averageAge: 0,
        averageIncome: 0,
        averageBalance: 0,
        totalSavings: 0,
        totalContributions: 0,
        suspiciousRecords: 0,
        riskDistribution: {},
        compliantMembers: 0,
        nonCompliantMembers: 0,
        performanceMetrics: {
          averageReturn: 0,
          avgDiversityScore: 0,
          highPerformers: 0
        },
        projectedRetirements: 0,
        dataRange: {
          oldestRecord: null,
          newestRecord: null
        }
      };
    }
  }

  /**
   * Search records by multiple criteria
   */
  static async search(searchOptions = {}) {
    try {
      let query = 'SELECT * FROM pension_data WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Age range
      if (searchOptions.minAge) {
        query += ` AND age >= $${paramIndex++}`;
        params.push(searchOptions.minAge);
      }
      if (searchOptions.maxAge) {
        query += ` AND age <= $${paramIndex++}`;
        params.push(searchOptions.maxAge);
      }

      // Income range
      if (searchOptions.minIncome) {
        query += ` AND annual_income >= $${paramIndex++}`;
        params.push(searchOptions.minIncome);
      }
      if (searchOptions.maxIncome) {
        query += ` AND annual_income <= $${paramIndex++}`;
        params.push(searchOptions.maxIncome);
      }

      // Text search in multiple fields
      if (searchOptions.searchText) {
        query += ` AND (
          user_id LIKE $${paramIndex++} OR 
          country LIKE $${paramIndex++} OR 
          employment_status LIKE $${paramIndex++} OR 
          fund_name LIKE $${paramIndex++}
        )`;
        const searchPattern = `%${searchOptions.searchText}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        paramIndex += 3; // We added 4 params but paramIndex was already incremented once
      }

      // Specific field filters
      if (searchOptions.country) {
        query += ` AND country = $${paramIndex++}`;
        params.push(searchOptions.country);
      }

      if (searchOptions.riskTolerance) {
        query += ` AND risk_tolerance = $${paramIndex++}`;
        params.push(searchOptions.riskTolerance);
      }

      if (searchOptions.pensionType) {
        query += ` AND pension_type = $${paramIndex++}`;
        params.push(searchOptions.pensionType);
      }

      // Suspicious records only
      if (searchOptions.suspiciousOnly) {
        query += ` AND suspicious_flag = $${paramIndex++}`;
        params.push(true);
      }

      // Order by
      const orderBy = searchOptions.orderBy || 'created_at';
      const orderDirection = searchOptions.orderDirection || 'DESC';
      query += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Pagination
      if (searchOptions.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(searchOptions.limit);
        if (searchOptions.offset) {
          query += ` OFFSET $${paramIndex++}`;
          params.push(searchOptions.offset);
        }
      }

      const result = await db.query(query, params);
      return result.rows.map(row => new PensionData(row));
    } catch (error) {
      console.error('Error searching pension data:', error);
      throw error;
    }
  }

  /**
   * Bulk create records
   */
  static async bulkCreate(dataArray) {
    try {
      const results = [];
      
      // Use transaction for bulk insert
      await db.transaction(async () => {
        for (const data of dataArray) {
          const pensionData = new PensionData(data);
          await pensionData.create();
          results.push(pensionData);
        }
      });

      return results;
    } catch (error) {
      console.error('Error bulk creating pension data:', error);
      throw error;
    }
  }

  /**
   * Delete multiple records by IDs
   */
  static async bulkDelete(ids) {
    try {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
      const query = `DELETE FROM pension_data WHERE id IN (${placeholders})`;
      
      const result = await db.query(query, ids);
      return result.rowCount || result.changes;
    } catch (error) {
      console.error('Error bulk deleting pension data:', error);
      throw error;
    }
  }

  /**
   * Get record count
   */
  static async count(where = {}) {
    try {
      let query = 'SELECT COUNT(*) as count FROM pension_data';
      const params = [];
      const conditions = [];

      let paramIndex = 1;
      for (const [field, value] of Object.entries(where)) {
        conditions.push(`${field} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await db.query(query, params);
      return result.rows[0].count;
    } catch (error) {
      console.error('Error counting pension data:', error);
      throw error;
    }
  }
}

export default PensionData;
