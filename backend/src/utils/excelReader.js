/**
 * Excel Data Reader and Database Setup
 * Reads data.xlsx and prepares it for database insertion
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read Excel file and convert to JSON
 */
export function readExcelData() {
  try {
    const filePath = path.join(__dirname, '../../database/CSV/data.xlsx');
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('📊 Excel Data Summary:');
    console.log(`📁 File: data.xlsx`);
    console.log(`📋 Sheet: ${sheetName}`);
    console.log(`📈 Records: ${jsonData.length}`);
    
    if (jsonData.length > 0) {
      console.log('🔍 Sample columns:', Object.keys(jsonData[0]));
      console.log('📝 First record:', jsonData[0]);
    }
    
    return {
      sheetName,
      data: jsonData,
      columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : []
    };
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error);
    return null;
  }
}

/**
 * Analyze data structure and suggest database schema
 */
export function analyzeDataStructure(data) {
  if (!data || data.length === 0) return null;
  
  const sample = data[0];
  const schema = {};
  
  Object.keys(sample).forEach(key => {
    const value = sample[key];
    const type = typeof value;
    
    if (type === 'number') {
      schema[key] = Number.isInteger(value) ? 'INTEGER' : 'DECIMAL';
    } else if (type === 'string') {
      // Check if it looks like a date
      if (isDateString(value)) {
        schema[key] = 'DATE';
      } else {
        schema[key] = value.length > 255 ? 'TEXT' : 'VARCHAR(255)';
      }
    } else if (type === 'boolean') {
      schema[key] = 'BOOLEAN';
    } else {
      schema[key] = 'TEXT';
    }
  });
  
  return schema;
}

/**
 * Check if string looks like a date
 */
function isDateString(str) {
  if (typeof str !== 'string') return false;
  const date = new Date(str);
  return !isNaN(date.getTime()) && str.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/);
}

/**
 * Generate SQL CREATE TABLE statement
 */
export function generateCreateTableSQL(tableName, schema) {
  const columns = Object.entries(schema).map(([name, type]) => {
    // Clean column name (remove spaces, special chars)
    const cleanName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    return `  ${cleanName} ${type}`;
  }).join(',\n');
  
  return `CREATE TABLE IF NOT EXISTS ${tableName} (
  id SERIAL PRIMARY KEY,
${columns},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
}

/**
 * Generate SQL INSERT statements
 */
export function generateInsertSQL(tableName, data, schema) {
  if (!data || data.length === 0) return [];
  
  const columns = Object.keys(schema).map(name => 
    name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
  );
  
  const insertStatements = data.map(row => {
    const values = Object.keys(schema).map(originalKey => {
      const value = row[originalKey];
      
      if (value === null || value === undefined) {
        return 'NULL';
      }
      
      const type = schema[originalKey];
      
      if (type.includes('VARCHAR') || type === 'TEXT' || type === 'DATE') {
        return `'${String(value).replace(/'/g, "''")}'`;
      }
      
      return value;
    });
    
    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
  });
  
  return insertStatements;
}

// If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔍 Reading Excel data...');
  const result = readExcelData();
  
  if (result) {
    console.log('\n📊 Data Analysis:');
    const schema = analyzeDataStructure(result.data);
    console.log('📋 Suggested Schema:', schema);
    
    console.log('\n🗃️ SQL CREATE TABLE:');
    const createSQL = generateCreateTableSQL('pension_data', schema);
    console.log(createSQL);
    
    console.log('\n📥 Sample INSERT statements (first 3):');
    const insertSQL = generateInsertSQL('pension_data', result.data.slice(0, 3), schema);
    insertSQL.forEach(sql => console.log(sql));
    
    console.log(`\n✅ Ready to process ${result.data.length} records`);
  }
}
