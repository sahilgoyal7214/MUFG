import db from '../src/config/database.js';
import { readExcelData } from '../src/utils/excelReader.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Data Import Script for Excel to PostgreSQL
 * Imports pension data from Excel file into PostgreSQL database
 */
class DataImporter {
  constructor() {
    this.batchSize = 50; // Process records in batches
    this.excelFilePath = path.join(__dirname, 'CSV/data.xlsx');
  }

  /**
   * Convert Excel data to database format
   */
  prepareRecord(record) {
    // Convert Excel column names to database column names (snake_case)
    return {
      user_id: record.User_ID,
      age: record.Age,
      gender: record.Gender,
      country: record.Country,
      employment_status: record.Employment_Status,
      annual_income: record.Annual_Income,
      current_savings: record.Current_Savings,
      retirement_age_goal: record.Retirement_Age_Goal,
      risk_tolerance: record.Risk_Tolerance,
      contribution_amount: record.Contribution_Amount,
      contribution_frequency: record.Contribution_Frequency,
      employer_contribution: record.Employer_Contribution,
      total_annual_contribution: record.Total_Annual_Contribution,
      years_contributed: record.Years_Contributed,
      investment_type: record.Investment_Type,
      fund_name: record.Fund_Name,
      annual_return_rate: record.Annual_Return_Rate,
      volatility: record.Volatility,
      fees_percentage: record.Fees_Percentage,
      projected_pension_amount: record.Projected_Pension_Amount,
      expected_annual_payout: record.Expected_Annual_Payout,
      inflation_adjusted_payout: record.Inflation_Adjusted_Payout,
      years_of_payout: record.Years_of_Payout,
      survivor_benefits: record.Survivor_Benefits,
      transaction_id: record.Transaction_ID,
      transaction_amount: record.Transaction_Amount,
      transaction_date: this.convertExcelDate(record.Transaction_Date),
      suspicious_flag: record.Suspicious_Flag === 'Yes',
      anomaly_score: record.Anomaly_Score,
      marital_status: record.Marital_Status,
      number_of_dependents: record.Number_of_Dependents,
      education_level: record.Education_Level,
      health_status: record.Health_Status,
      life_expectancy_estimate: record.Life_Expectancy_Estimate,
      home_ownership_status: record.Home_Ownership_Status,
      debt_level: record.Debt_Level,
      monthly_expenses: record.Monthly_Expenses,
      savings_rate: record.Savings_Rate,
      investment_experience_level: record.Investment_Experience_Level,
      financial_goals: record.Financial_Goals,
      insurance_coverage: record.Insurance_Coverage,
      portfolio_diversity_score: record.Portfolio_Diversity_Score,
      tax_benefits_eligibility: record.Tax_Benefits_Eligibility,
      government_pension_eligibility: record.Government_Pension_Eligibility,
      private_pension_eligibility: record.Private_Pension_Eligibility,
      pension_type: record.Pension_Type,
      withdrawal_strategy: record.Withdrawal_Strategy,
      transaction_channel: record.Transaction_Channel,
      ip_address: record.IP_Address,
      device_id: record.Device_ID,
      geo_location: record.Geo_Location,
      time_of_transaction: record.Time_of_Transaction,
      transaction_pattern_score: record.Transaction_Pattern_Score,
      previous_fraud_flag: record.Previous_Fraud_Flag === 'Yes',
      account_age: record.Account_Age
    };
  }

  /**
   * Convert Excel date serial number to PostgreSQL timestamp
   */
  convertExcelDate(excelDate) {
    if (!excelDate || excelDate === '########' || excelDate === 'N/A') {
      return null;
    }
    
    // If it's already a valid date string, return it
    if (typeof excelDate === 'string' && isNaN(Number(excelDate))) {
      return excelDate;
    }
    
    // Convert Excel serial number to JavaScript Date
    // Excel epoch starts from 1900-01-01, but JavaScript starts from 1970-01-01
    // Excel serial number 1 = 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const daysSinceEpoch = Number(excelDate) - 1; // Excel counts 1900-01-01 as day 1
    const jsDate = new Date(excelEpoch.getTime() + (daysSinceEpoch * 24 * 60 * 60 * 1000));
    
    // Return ISO string format for PostgreSQL
    return jsDate.toISOString();
  }

  /**
   * Generate INSERT query for a batch of records
   */
  generateInsertQuery(records) {
    const columns = Object.keys(records[0]);
    const columnNames = columns.join(', ');
    
    // Create placeholders for prepared statement
    const valuePlaceholders = records.map((_, index) => {
      const start = index * columns.length + 1;
      const placeholders = Array.from(
        { length: columns.length }, 
        (_, i) => `$${start + i}`
      );
      return `(${placeholders.join(', ')})`;
    }).join(', ');

    const query = `
      INSERT INTO pension_data (${columnNames}) 
      VALUES ${valuePlaceholders}
      ON CONFLICT (user_id) DO UPDATE SET
        ${columns.map(col => `${col} = EXCLUDED.${col}`).join(', ')},
        updated_at = CURRENT_TIMESTAMP
    `;

    // Flatten all values for the prepared statement
    const values = records.flatMap(record => Object.values(record));
    
    return { query, values };
  }

  /**
   * Import data in batches
   */
  async importData() {
    try {
      console.log('🚀 Starting data import process...');
      
      // Test database connection
      const isConnected = await db.testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      // Read Excel data
      console.log('📖 Reading Excel file...');
      const excelResult = readExcelData();
      if (!excelResult) {
        throw new Error('Failed to read Excel file');
      }
      const excelData = excelResult.data;
      console.log(`📊 Found ${excelData.length} records to import`);

      if (excelData.length === 0) {
        console.log('⚠️  No data found in Excel file');
        return;
      }

      // Check if table already has data
      const existingCount = await db.getRecordCount('pension_data');
      console.log(`📋 Existing records in database: ${existingCount}`);

      // Process data in batches
      let importedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < excelData.length; i += this.batchSize) {
        const batch = excelData.slice(i, i + this.batchSize);
        const preparedRecords = batch.map(record => this.prepareRecord(record));

        try {
          const { query, values } = this.generateInsertQuery(preparedRecords);
          const result = await db.query(query, values);
          
          importedCount += result.rowCount;
          console.log(`✅ Batch ${Math.floor(i / this.batchSize) + 1}: Imported ${result.rowCount} records`);
        } catch (error) {
          console.error(`❌ Error importing batch ${Math.floor(i / this.batchSize) + 1}:`, error.message);
          skippedCount += batch.length;
        }
      }

      // Final statistics
      const finalCount = await db.getRecordCount('pension_data');
      console.log('\n🎉 Import completed!');
      console.log(`📊 Final statistics:`);
      console.log(`   - Records imported: ${importedCount}`);
      console.log(`   - Records skipped: ${skippedCount}`);
      console.log(`   - Total in database: ${finalCount}`);
      
      // Sample some data to verify
      console.log('\n🔍 Sample verification:');
      const sampleResult = await db.query('SELECT user_id, country, pension_type, survivor_benefits, transaction_id, created_at FROM pension_data LIMIT 3');
      console.table(sampleResult.rows);

    } catch (error) {
      console.error('💥 Import failed:', error);
      throw error;
    }
  }

  /**
   * Clear all data (for testing)
   */
  async clearData() {
    try {
      console.log('🗑️  Clearing all pension data...');
      const result = await db.query('DELETE FROM pension_data');
      console.log(`✅ Cleared ${result.rowCount} records`);
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Get import statistics
   */
  async getStatistics() {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT country) as countries,
          COUNT(DISTINCT pension_type) as pension_types,
          AVG(age) as avg_age,
          AVG(annual_income) as avg_income,
          COUNT(CASE WHEN suspicious_flag = 'Yes' THEN 1 END) as suspicious_records
        FROM pension_data
      `);
      
      console.log('📈 Database Statistics:');
      console.table(stats.rows[0]);
      
      return stats.rows[0];
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      throw error;
    }
  }
}

// CLI interface
const command = process.argv[2];

if (command) {
  const importer = new DataImporter();
  
  switch (command) {
    case 'import':
      importer.importData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'clear':
      importer.clearData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'stats':
      importer.getStatistics()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log(`
📋 Usage: node scripts/importData.js <command>

Commands:
  import  - Import Excel data to database
  clear   - Clear all data from database
  stats   - Show database statistics

Examples:
  node scripts/importData.js import
  node scripts/importData.js stats
      `);
      process.exit(0);
  }
}

export default DataImporter;
