import PersonalizedRiskAlertService from './src/services/PersonalizedRiskAlertService.js';
import SmartContributionService from './src/services/SmartContributionService.js';
import WhatIfSimulatorService from './src/services/WhatIfSimulatorService.js';
import PortfolioOptimizationService from './src/services/PortfolioOptimizationService.js';
import MemberSegmentationService from './src/services/MemberSegmentationService.js';

async function testUpdatedServices() {
  console.log('🧪 Testing Updated Dashboard Services with Database');
  console.log('=' .repeat(60));

  try {
    // Test with an actual user ID from the database
    const testMemberId = 'USER002';

    console.log('\n1. Testing PersonalizedRiskAlertService...');
    try {
      const riskAlerts = await PersonalizedRiskAlertService.generateRiskAlerts(testMemberId);
      console.log('✅ PersonalizedRiskAlertService - Success');
      console.log('   Alerts generated:', riskAlerts.alerts?.length || 0);
      console.log('   Risk level:', riskAlerts.riskLevel);
    } catch (error) {
      console.log('❌ PersonalizedRiskAlertService - Error:', error.message);
    }

    console.log('\n2. Testing SmartContributionService...');
    try {
      const contributionRecs = await SmartContributionService.generateContributionRecommendations(testMemberId);
      console.log('✅ SmartContributionService - Success');
      console.log('   Current savings:', contributionRecs.currentStatus?.currentSavings);
      console.log('   Years to retirement:', contributionRecs.currentStatus?.yearsToRetirement);
    } catch (error) {
      console.log('❌ SmartContributionService - Error:', error.message);
    }

    console.log('\n3. Testing WhatIfSimulatorService...');
    try {
      const scenarios = {
        contributionChanges: [1000, 2000],
        retirementAgeChanges: [2, -2],
        newMarketConditions: {
          bullMarket: 0.09,
          bearMarket: 0.05
        }
      };
      const simulation = await WhatIfSimulatorService.runSimulation(testMemberId, scenarios);
      console.log('✅ WhatIfSimulatorService - Success');
      console.log('   Scenarios generated:', simulation.scenarios?.length || 0);
      console.log('   Baseline value:', simulation.baseline?.projectedValue);
    } catch (error) {
      console.log('❌ WhatIfSimulatorService - Error:', error.message);
    }

    console.log('\n4. Testing PortfolioOptimizationService...');
    try {
      const optimization = await PortfolioOptimizationService.optimizePortfolio(testMemberId);
      console.log('✅ PortfolioOptimizationService - Success');
      console.log('   Current allocation:', optimization.currentAllocation);
      console.log('   Recommended allocation:', optimization.recommendedAllocation);
    } catch (error) {
      console.log('❌ PortfolioOptimizationService - Error:', error.message);
    }

    console.log('\n5. Testing MemberSegmentationService...');
    try {
      const segmentation = await MemberSegmentationService.performMemberSegmentation();
      console.log('✅ MemberSegmentationService - Success');
      console.log('   Total members segmented:', segmentation.totalMembers);
      console.log('   Number of clusters:', segmentation.clusters?.length || 0);
    } catch (error) {
      console.log('❌ MemberSegmentationService - Error:', error.message);
    }

    console.log('\n6. Testing Bulk Operations...');
    try {
      const bulkRisks = await PersonalizedRiskAlertService.getBulkRiskAlerts();
      console.log('✅ Bulk Risk Analysis - Success');
      console.log('   Members analyzed:', bulkRisks.totalMembers);
      console.log('   Risk distribution:', JSON.stringify(bulkRisks.riskDistribution, null, 2));
    } catch (error) {
      console.log('❌ Bulk Risk Analysis - Error:', error.message);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Service Testing Complete!');

  } catch (error) {
    console.error('❌ Testing Error:', error);
  }
}

testUpdatedServices().catch(console.error);
