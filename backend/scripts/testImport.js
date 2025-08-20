import db from '../src/config/database.js';
import XLSX from 'xlsx';

async function testImport() {
  try {
    console.log('🚀 Starting test import...');
    
    // Test connection
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Read Excel data
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile('./database/CSV/data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${excelData.length} records in Excel`);
    
    // Check current database status
    const existingCount = await db.getRecordCount('pension_data');
    console.log(`📋 Existing records in database: ${existingCount}`);
    
    // Test with first record
    if (excelData.length > 0) {
      const testRecord = excelData[0];
      console.log('\n🔍 Testing with first record:');
      console.log(`User ID: ${testRecord.User_ID}`);
      console.log(`Country: ${testRecord.Country}`);
      console.log(`Survivor Benefits: ${testRecord.Survivor_Benefits}`);
      console.log(`Transaction ID: ${testRecord.Transaction_ID}`);
      
      // Simple insert test
      const result = await db.query(`
        INSERT INTO pension_data (user_id, country, survivor_benefits, transaction_id) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING id, user_id, country, survivor_benefits, transaction_id
      `, [
        testRecord.User_ID,
        testRecord.Country,
        testRecord.Survivor_Benefits,
        testRecord.Transaction_ID
      ]);
      
      console.log(`✅ Test insert successful:`, result.rows[0]);
    }
    
    // Now try to import all data
    console.log('\n🚀 Starting full import...');
    let imported = 0;
    
    for (let i = 0; i < Math.min(excelData.length, 10); i++) { // Start with first 10 records
      const record = excelData[i];
      try {
        await db.query(`
          INSERT INTO pension_data (
            user_id, age, gender, country, employment_status, annual_income,
            current_savings, retirement_age_goal, risk_tolerance, contribution_amount,
            contribution_frequency, employer_contribution, total_annual_contribution,
            years_contributed, investment_type, fund_name, annual_return_rate,
            volatility, fees_percentage, projected_pension_amount, expected_annual_payout,
            inflation_adjusted_payout, years_of_payout, survivor_benefits, transaction_id,
            transaction_amount, suspicious_flag, anomaly_score, marital_status,
            number_of_dependents, education_level, health_status, life_expectancy_estimate,
            home_ownership_status, debt_level, monthly_expenses, savings_rate,
            investment_experience_level, financial_goals, insurance_coverage,
            portfolio_diversity_score, tax_benefits_eligibility, government_pension_eligibility,
            private_pension_eligibility, pension_type, withdrawal_strategy,
            transaction_channel, ip_address, device_id, geo_location,
            time_of_transaction, transaction_pattern_score, previous_fraud_flag, account_age
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
            $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54
          )
          ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        `, [
          record.User_ID, record.Age, record.Gender, record.Country,
          record.Employment_Status, record.Annual_Income, record.Current_Savings,
          record.Retirement_Age_Goal, record.Risk_Tolerance, record.Contribution_Amount,
          record.Contribution_Frequency, record.Employer_Contribution,
          record.Total_Annual_Contribution, record.Years_Contributed,
          record.Investment_Type, record.Fund_Name, record.Annual_Return_Rate,
          record.Volatility, record.Fees_Percentage, record.Projected_Pension_Amount,
          record.Expected_Annual_Payout, record.Inflation_Adjusted_Payout,
          record.Years_of_Payout, record.Survivor_Benefits, record.Transaction_ID,
          record.Transaction_Amount, record.Suspicious_Flag, record.Anomaly_Score,
          record.Marital_Status, record.Number_of_Dependents, record.Education_Level,
          record.Health_Status, record.Life_Expectancy_Estimate,
          record.Home_Ownership_Status, record.Debt_Level, record.Monthly_Expenses,
          record.Savings_Rate, record.Investment_Experience_Level,
          record.Financial_Goals, record.Insurance_Coverage,
          record.Portfolio_Diversity_Score, record.Tax_Benefits_Eligibility,
          record.Government_Pension_Eligibility, record.Private_Pension_Eligibility,
          record.Pension_Type, record.Withdrawal_Strategy, record.Transaction_Channel,
          record.IP_Address, record.Device_ID, record.Geo_Location,
          record.Time_of_Transaction, record.Transaction_Pattern_Score,
          record.Previous_Fraud_Flag, record.Account_Age
        ]);
        imported++;
        console.log(`✅ Imported record ${i + 1}: ${record.User_ID}`);
      } catch (error) {
        console.error(`❌ Failed to import record ${i + 1} (${record.User_ID}):`, error.message);
      }
    }
    
    console.log(`\n🎉 Import test completed! Imported ${imported} records`);
    
    // Final count
    const finalCount = await db.getRecordCount('pension_data');
    console.log(`📊 Total records in database: ${finalCount}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testImport();
