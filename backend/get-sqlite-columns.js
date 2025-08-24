import Database from 'better-sqlite3';

async function getSQLiteColumnNames() {
  try {
    console.log('Opening SQLite database...');
    
    // Open the SQLite database
    const db = new Database('./database/pension_insights.db');
    
    console.log('Database opened successfully');
    
    // Get all table names
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name;
    `).all();
    
    console.log('\nAvailable tables:');
    tables.forEach(table => {
      console.log('  -', table.name);
    });
    
    // Get column information for each table
    for (const table of tables) {
      console.log(`\n--- Columns for table: ${table.name} ---`);
      
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      
      if (columns.length > 0) {
        console.log('Column Name | Type | Not Null | Default | Primary Key');
        console.log('------------|------|----------|---------|------------');
        columns.forEach(col => {
          console.log(`${col.name.padEnd(12)} | ${col.type.padEnd(4)} | ${col.notnull.toString().padEnd(8)} | ${(col.dflt_value || 'NULL').toString().padEnd(7)} | ${col.pk}`);
        });
        
        // Show just column names for easy copying
        console.log('\nColumn names only:');
        const columnNames = columns.map(col => col.name);
        console.log(columnNames.join(', '));
        
        // Get sample data to see actual field values
        console.log('\n--- Sample Data ---');
        const sampleData = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).all();
        if (sampleData.length > 0) {
          console.log('Sample row keys:', Object.keys(sampleData[0]));
          console.log('Sample row data:');
          Object.entries(sampleData[0]).forEach(([key, value]) => {
            console.log(`  ${key}: ${value} (${typeof value})`);
          });
        }
      } else {
        console.log('No columns found');
      }
    }
    
    db.close();
    console.log('\nDatabase closed');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getSQLiteColumnNames();
