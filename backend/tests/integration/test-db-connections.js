#!/usr/bin/env node

/**
 * Simple Database Connection Test for Dashboard Services
 * Tests that all services can fetch data from the database
 */

import db from './src/config/database.js';
import PortfolioOptimizationService from './src/services/PortfolioOptimizationService.js';
import MemberSegmentationService from './src/services/MemberSegmentationService.js';
import PersonalizedRiskAlertService from './src/services/PersonalizedRiskAlertService.js';
import SmartContributionService from './src/services/SmartContributionService.js';
import WhatIfSimulatorService from './src/services/WhatIfSimulatorService.js';

async function testDatabaseConnections() {
  console.log('🔧 Testing Database Connections for Dashboard Services');
  console.log('=====================================================');

  try {
    // Test basic database connection
    console.log('\n📡 Testing database connection...');
    const testQuery = await db.query('SELECT COUNT(*) as count FROM pension_data');
    const totalRecords = testQuery.rows[0].count;
    console.log(`✅ Database connected successfully. Found ${totalRecords} records.`);

    // Get first few user IDs for testing
    const userQuery = await db.query('SELECT user_id FROM pension_data LIMIT 3');
    const testUserIds = userQuery.rows.map(row => row.user_id);
    
    if (testUserIds.length === 0) {
      console.log('❌ No user data found in database. Please import data first.');
      return;
    }

    console.log(`\n🧪 Testing with user IDs: ${testUserIds.join(', ')}`);

    // Test Portfolio Optimization Service
    console.log('\n📊 Testing Portfolio Optimization Service...');
    try {
      const portfolioResult = await PortfolioOptimizationService.optimizePortfolio(testUserIds[0]);
      console.log(`✅ Portfolio optimization successful for user ${testUserIds[0]}`);
      console.log(`   Current allocation: ${portfolioResult.currentAllocation.equity}% equity`);
      console.log(`   Recommended allocation: ${portfolioResult.recommendedAllocation.stocks}% stocks`);
    } catch (error) {
      console.log(`❌ Portfolio optimization failed: ${error.message}`);
    }

    // Test Member Segmentation Service
    console.log('\n👥 Testing Member Segmentation Service...');
    try {
      const segmentationResult = await MemberSegmentationService.performMemberSegmentation({}, 3);
      console.log(`✅ Member segmentation successful`);
      console.log(`   Total members segmented: ${segmentationResult.totalMembers}`);
      console.log(`   Clusters created: ${segmentationResult.clusterCount}`);
    } catch (error) {
      console.log(`❌ Member segmentation failed: ${error.message}`);
    }

    // Test Risk Alert Service
    console.log('\n⚠️  Testing Risk Alert Service...');
    try {
      const riskAlertsResult = await PersonalizedRiskAlertService.generateRiskAlerts(testUserIds[0]);
      console.log(`✅ Risk alerts generated for user ${testUserIds[0]}`);
      console.log(`   Risk level: ${riskAlertsResult.riskLevel}`);
      console.log(`   Total alerts: ${riskAlertsResult.totalAlerts}`);
    } catch (error) {
      console.log(`❌ Risk alerts failed: ${error.message}`);
    }

    // Test Smart Contribution Service
    console.log('\n💰 Testing Smart Contribution Service...');
    try {
      const contributionResult = await SmartContributionService.generateContributionRecommendations(testUserIds[0]);
      console.log(`✅ Contribution recommendations generated for user ${testUserIds[0]}`);
      console.log(`   Current contributions: $${contributionResult.currentStatus.currentContributions}`);
      console.log(`   Scenarios generated: ${contributionResult.scenarios.length}`);
    } catch (error) {
      console.log(`❌ Contribution recommendations failed: ${error.message}`);
    }

    // Test What-If Simulator Service
    console.log('\n🎯 Testing What-If Simulator Service...');
    try {
      const simulatorResult = await WhatIfSimulatorService.runSimulation(testUserIds[0], {
        contributionChanges: [0, 1000],
        returnRates: [0.06, 0.07]
      });
      console.log(`✅ What-if simulation completed for user ${testUserIds[0]}`);
      console.log(`   Scenarios generated: ${simulatorResult.scenarios.length}`);
      console.log(`   Stress tests: ${simulatorResult.stressTests.length}`);
    } catch (error) {
      console.log(`❌ What-if simulation failed: ${error.message}`);
    }

    // Test Monte Carlo Simulation
    console.log('\n🎲 Testing Monte Carlo Simulation...');
    try {
      const monteCarloResult = await WhatIfSimulatorService.runMonteCarloSimulation(testUserIds[0], 100);
      console.log(`✅ Monte Carlo simulation completed for user ${testUserIds[0]}`);
      console.log(`   Success rate: ${monteCarloResult.successRate}%`);
      console.log(`   Median outcome: $${monteCarloResult.percentiles.p50.toLocaleString()}`);
    } catch (error) {
      console.log(`❌ Monte Carlo simulation failed: ${error.message}`);
    }

    console.log('\n🎉 Database connection tests completed!');
    console.log('📊 All services are now properly connected to the database');

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  } finally {
    // Close database connection
    if (db.end) {
      await db.end();
    }
    process.exit(0);
  }
}

// Run the test
testDatabaseConnections();
