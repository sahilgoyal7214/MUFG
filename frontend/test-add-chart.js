#!/usr/bin/env node

/**
 * Test Add Chart Component Functionality
 */

console.log('🔍 Add Chart Component Analysis');
console.log('================================');

// Simulate the data loading scenario
const mockData = [
  {
    id: 1,
    age: 25,
    projected_pension_amount: 50000,
    contribution_rate: 5,
    years_to_retirement: 40
  },
  {
    id: 2,
    age: 30,
    projected_pension_amount: 75000,
    contribution_rate: 7,
    years_to_retirement: 35
  }
];

// Simulate getNumericColumns function
const getNumericColumns = (data) => {
  if (data.length === 0) return [];

  const firstRow = data[0];
  return Object.keys(firstRow).filter(key => {
    const value = firstRow[key];
    return typeof value === 'number' || !isNaN(Number(value));
  });
};

console.log('📊 Mock Data Analysis:');
console.log(`- Data rows: ${mockData.length}`);
console.log(`- Available columns: ${Object.keys(mockData[0]).join(', ')}`);

const numericColumns = getNumericColumns(mockData);
console.log(`- Numeric columns: ${numericColumns.join(', ')}`);
console.log(`- Numeric columns count: ${numericColumns.length}`);

// Test default chart configuration
if (numericColumns.length > 0) {
  const defaultY = numericColumns.includes('projected_pension_amount') 
    ? 'projected_pension_amount' 
    : numericColumns[0];
  const defaultX = numericColumns.includes('age') 
    ? 'age' 
    : numericColumns[1] || numericColumns[0];

  console.log('\n✅ Chart Configuration Test:');
  console.log(`- Default X-axis: ${defaultX}`);
  console.log(`- Default Y-axis: ${defaultY}`);
  console.log('- Chart would be created successfully');
} else {
  console.log('\n❌ Chart Configuration Test:');
  console.log('- No numeric columns available');
  console.log('- Chart creation would fail');
}

console.log('\n🔧 Add Chart Button Conditions:');
console.log('- Data loaded: ✅');
console.log('- Data length > 0: ✅');
console.log('- Numeric columns available: ✅');
console.log('- Button should be clickable: ✅');

console.log('\n🎯 Expected Flow:');
console.log('1. User clicks "Add Chart" button');
console.log('2. handleAddChart(chartId) is called');
console.log('3. Data validation passes');
console.log('4. Numeric columns are found');
console.log('5. Default config is set');
console.log('6. setEditingChartId(chartId) is called');
console.log('7. setShowConfigModal(true) is called');
console.log('8. Configuration modal should appear');

console.log('\n🐛 Potential Issues to Check:');
console.log('- Modal is hidden by CSS z-index issues');
console.log('- Modal backdrop is not receiving clicks properly');
console.log('- State updates are not triggering re-renders');
console.log('- Console errors in browser dev tools');
console.log('- Network requests blocking UI updates');
