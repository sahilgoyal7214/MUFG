import Database from 'better-sqlite3';
import XLSX from 'xlsx';

try {
  console.log('🚀 Importing data into SQLite...');
  
  // Open SQLite database
  const db = new Database('./database/pension_insights.db');
  
  // Check current SQLite data
  const currentCount = db.prepare('SELECT COUNT(*) as count FROM pension_data').get();
  console.log(`📋 Current SQLite records: ${currentCount.count}`);
  
  // Read Excel data
  const workbook = XLSX.readFile('./database/CSV/data.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📊 Excel records to import: ${excelData.length}`);
  
  // Function to convert Excel date
  function convertExcelDate(excelDate) {
    if (!excelDate || excelDate === '########' || excelDate === 'N/A') {
      return null;
    }
    
    if (typeof excelDate === 'string' && isNaN(Number(excelDate))) {
      return excelDate;
    }
    
    const excelEpoch = new Date(1900, 0, 1);
    const daysSinceEpoch = Number(excelDate) - 1;
    const jsDate = new Date(excelEpoch.getTime() + (daysSinceEpoch * 24 * 60 * 60 * 1000));
    
    return jsDate.toISOString();
  }
  
  // Prepare insert statement (excluding auto-generated columns: id, created_at, updated_at)
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO pension_data (
      user_id, age, gender, country, employment_status, marital_status,
      number_of_dependents, education_level, health_status, life_expectancy_estimate,
      annual_income, current_savings, debt_level, monthly_expenses, savings_rate,
      home_ownership_status, retirement_age_goal, risk_tolerance, contribution_amount,
      contribution_frequency, employer_contribution, total_annual_contribution,
      years_contributed, investment_type, fund_name, annual_return_rate,
      volatility, fees_percentage, investment_experience_level, portfolio_diversity_score,
      projected_pension_amount, expected_annual_payout, inflation_adjusted_payout,
      years_of_payout, survivor_benefits, pension_type, withdrawal_strategy,
      tax_benefits_eligibility, government_pension_eligibility, private_pension_eligibility,
      insurance_coverage, financial_goals, transaction_id, transaction_amount,
      transaction_date, transaction_channel, time_of_transaction, suspicious_flag,
      anomaly_score, transaction_pattern_score, previous_fraud_flag, ip_address,
      device_id, geo_location, account_age
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Import data in transaction
  let imported = 0;
  const transaction = db.transaction((records) => {
    for (const record of records) {
      insertStmt.run(
        record.User_ID, record.Age, record.Gender, record.Country,
        record.Employment_Status, record.Marital_Status, record.Number_of_Dependents,
        record.Education_Level, record.Health_Status, record.Life_Expectancy_Estimate,
        record.Annual_Income, record.Current_Savings, record.Debt_Level,
        record.Monthly_Expenses, record.Savings_Rate, record.Home_Ownership_Status,
        record.Retirement_Age_Goal, record.Risk_Tolerance, record.Contribution_Amount,
        record.Contribution_Frequency, record.Employer_Contribution,
        record.Total_Annual_Contribution, record.Years_Contributed,
        record.Investment_Type, record.Fund_Name, record.Annual_Return_Rate,
        record.Volatility, record.Fees_Percentage, record.Investment_Experience_Level,
        record.Portfolio_Diversity_Score, record.Projected_Pension_Amount,
        record.Expected_Annual_Payout, record.Inflation_Adjusted_Payout,
        record.Years_of_Payout, record.Survivor_Benefits, record.Pension_Type,
        record.Withdrawal_Strategy, record.Tax_Benefits_Eligibility,
        record.Government_Pension_Eligibility, record.Private_Pension_Eligibility,
        record.Insurance_Coverage, record.Financial_Goals, record.Transaction_ID,
        record.Transaction_Amount, convertExcelDate(record.Transaction_Date),
        record.Transaction_Channel, record.Time_of_Transaction,
        record.Suspicious_Flag === 'Yes' ? 1 : 0, record.Anomaly_Score,
        record.Transaction_Pattern_Score, record.Previous_Fraud_Flag === 'Yes' ? 1 : 0,
        record.IP_Address, record.Device_ID, record.Geo_Location, record.Account_Age
      );
      imported++;
    }
  });
  
  transaction(excelData);
  
  // Verify final count
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM pension_data').get();
  console.log(`✅ SQLite import completed: ${imported} records imported`);
  console.log(`📊 Total SQLite records: ${finalCount.count}`);
  
  // Sample verification
  const sample = db.prepare('SELECT user_id, country, survivor_benefits, transaction_id FROM pension_data LIMIT 3').all();
  console.log('\n🔍 SQLite sample data:');
  console.table(sample);
  
  db.close();
  console.log('✅ SQLite database closed');
  
} catch (error) {
  console.error('❌ SQLite import error:', error);
}
