import DatabaseConnection from '../config/database.js';

/**
 * Personalized Risk Alert Service
 * Monitors member portfolios and generates risk alerts
 */
class PersonalizedRiskAlertService {

  /**
   * Generate comprehensive risk alerts for a member
   */
  static async generateRiskAlerts(userId) {
    try {
      // Fetch member data from database
      const query = `
        SELECT user_id, age, annual_income, current_savings, risk_tolerance, 
               retirement_age_goal, investment_type, portfolio_diversity_score, 
               contribution_amount, employer_contribution, pension_type,
               years_contributed, annual_return_rate, volatility, total_annual_contribution
        FROM pension_data 
        WHERE user_id = $1
      `;
      
      const result = await DatabaseConnection.query(query, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Member data not found');
      }
      
      const memberData = result.rows[0];

      const alerts = [];

      // 1. Withdrawal Rate Alert
      const withdrawalAlert = this.checkWithdrawalRate(memberData);
      if (withdrawalAlert) alerts.push(withdrawalAlert);

      // 2. Asset Allocation Alert
      const allocationAlert = this.checkAssetAllocation(memberData);
      if (allocationAlert) alerts.push(allocationAlert);

      // 3. Savings Gap Alert
      const savingsAlert = this.checkSavingsGap(memberData);
      if (savingsAlert) alerts.push(savingsAlert);

      // 4. Market Risk Alert
      const marketAlert = this.checkMarketRisk(memberData);
      if (marketAlert) alerts.push(marketAlert);

      // 5. Inflation Risk Alert
      const inflationAlert = this.checkInflationRisk(memberData);
      if (inflationAlert) alerts.push(inflationAlert);

      // 6. Longevity Risk Alert
      const longevityAlert = this.checkLongevityRisk(memberData);
      if (longevityAlert) alerts.push(longevityAlert);

      return {
        userId,
        totalAlerts: alerts.length,
        riskLevel: this.calculateOverallRiskLevel(alerts),
        alerts,
        recommendations: this.generateRecommendations(alerts, memberData),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Risk alert generation error:', error);
      throw error;
    }
  }

  /**
   * Analyze risks for a single member (used by bulk operations)
   */
  static analyzeRisks(memberData) {
    const alerts = [];

    // 1. Withdrawal Rate Alert
    const withdrawalAlert = this.checkWithdrawalRate(memberData);
    if (withdrawalAlert) alerts.push(withdrawalAlert);

    // 2. Asset Allocation Alert
    const allocationAlert = this.checkAssetAllocation(memberData);
    if (allocationAlert) alerts.push(allocationAlert);

    // 3. Savings Gap Alert
    const savingsAlert = this.checkSavingsGap(memberData);
    if (savingsAlert) alerts.push(savingsAlert);

    // 4. Market Risk Alert
    const marketAlert = this.checkMarketRisk(memberData);
    if (marketAlert) alerts.push(marketAlert);

    // 5. Inflation Risk Alert
    const inflationAlert = this.checkInflationRisk(memberData);
    if (inflationAlert) alerts.push(inflationAlert);

    // 6. Longevity Risk Alert
    const longevityAlert = this.checkLongevityRisk(memberData);
    if (longevityAlert) alerts.push(longevityAlert);

    return alerts;
  }

  /**
   * Check withdrawal rate against 4% rule
   */
  static checkWithdrawalRate(memberData) {
    const currentAge = memberData.age;
    const expectedRetirementAge = memberData.retirement_age_goal || 65;
    const currentSavings = memberData.current_savings || 0;
    const annualIncome = memberData.annual_income || 0;

    // Calculate if already retired
    if (currentAge >= expectedRetirementAge) {
      const safeWithdrawalAmount = currentSavings * 0.04;
      const incomeReplacementRatio = safeWithdrawalAmount / annualIncome;

      if (incomeReplacementRatio < 0.7) {
        return {
          type: 'WITHDRAWAL_RATE',
          severity: 'HIGH',
          title: 'Insufficient Retirement Income',
          description: `Current savings only support ${Math.round(incomeReplacementRatio * 100)}% income replacement`,
          metrics: {
            safeWithdrawalAmount: Math.round(safeWithdrawalAmount),
            incomeReplacementRatio: Math.round(incomeReplacementRatio * 100),
            shortfall: Math.round(annualIncome * 0.7 - safeWithdrawalAmount)
          },
          recommendations: [
            'Consider delaying retirement',
            'Reduce retirement expenses',
            'Explore part-time work options'
          ]
        };
      }
    }

    return null;
  }

  /**
   * Check asset allocation appropriateness
   */
  static checkAssetAllocation(memberData) {
    const age = memberData.age;
    const riskTolerance = memberData.risk_tolerance;
    
    // Estimate equity allocation from investment type and portfolio diversity
    let equityAllocation = 60; // Default
    const investmentType = (memberData.investment_type || '').toLowerCase();
    
    if (investmentType.includes('equity') || investmentType.includes('stock')) {
      equityAllocation = 70;
    } else if (investmentType.includes('bond')) {
      equityAllocation = 30;
    } else if (investmentType.includes('balanced')) {
      equityAllocation = 50;
    }

    // Adjust based on portfolio diversity score
    const diversityScore = memberData.portfolio_diversity_score || 50;
    if (diversityScore > 70) {
      equityAllocation += 10;
    } else if (diversityScore < 30) {
      equityAllocation -= 10;
    }

    // Calculate recommended equity allocation
    let recommendedEquity;
    if (riskTolerance === 'Low') {
      recommendedEquity = Math.max(20, 100 - age);
    } else if (riskTolerance === 'Medium') {
      recommendedEquity = Math.max(30, 110 - age);
    } else {
      recommendedEquity = Math.max(40, 120 - age);
    }

    const allocationDifference = Math.abs(equityAllocation - recommendedEquity);

    if (allocationDifference > 20) {
      const severity = allocationDifference > 40 ? 'HIGH' : 'MEDIUM';
      const isOverallocated = equityAllocation > recommendedEquity;

      return {
        type: 'ASSET_ALLOCATION',
        severity,
        title: isOverallocated ? 'Overexposed to Equity Risk' : 'Too Conservative Allocation',
        description: `Current equity allocation (${equityAllocation}%) differs significantly from recommended (${recommendedEquity}%)`,
        metrics: {
          currentEquity: equityAllocation,
          recommendedEquity,
          difference: allocationDifference,
          isOverallocated
        },
        recommendations: isOverallocated ? [
          'Reduce equity allocation to manage risk',
          'Increase bond allocation for stability',
          'Consider target-date funds for automatic rebalancing'
        ] : [
          'Increase equity allocation for growth potential',
          'Consider age-appropriate risk taking',
          'Review inflation protection strategies'
        ]
      };
    }

    return null;
  }

  /**
   * Check savings gap vs retirement goals
   */
  static checkSavingsGap(memberData) {
    const currentAge = memberData.age;
    const retirementAge = memberData.retirement_age_goal || 65;
    const currentSavings = memberData.current_savings || 0;
    const annualIncome = memberData.annual_income || 0;
    const yearlyContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;

    const yearsToRetirement = retirementAge - currentAge;
    const targetRetirementSavings = annualIncome * 10; // Common rule of thumb

    // Project future savings with current contributions
    const assumedReturn = memberData.annual_return_rate ? (memberData.annual_return_rate / 100) : 0.07;
    const futureValue = currentSavings * Math.pow(1 + assumedReturn, yearsToRetirement) +
                       yearlyContributions * ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) / assumedReturn);

    const savingsGap = targetRetirementSavings - futureValue;

    if (savingsGap > 0 && yearsToRetirement > 0) {
      const additionalMonthlyNeeded = (savingsGap * assumedReturn) / 
                                    ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) * 12);

      const severity = savingsGap > targetRetirementSavings * 0.5 ? 'HIGH' : 'MEDIUM';

      return {
        type: 'SAVINGS_GAP',
        severity,
        title: 'Retirement Savings Shortfall',
        description: `Projected savings fall short of retirement goal by $${Math.round(savingsGap).toLocaleString()}`,
        metrics: {
          currentSavings,
          projectedSavings: Math.round(futureValue),
          targetSavings: targetRetirementSavings,
          savingsGap: Math.round(savingsGap),
          additionalMonthlyNeeded: Math.round(additionalMonthlyNeeded),
          yearsToRetirement
        },
        recommendations: [
          `Increase monthly contributions by $${Math.round(additionalMonthlyNeeded)}`,
          'Consider maximizing employer match opportunities',
          'Review and optimize investment allocations',
          'Explore catch-up contributions if eligible'
        ]
      };
    }

    return null;
  }

  /**
   * Check market risk exposure
   */
  static checkMarketRisk(memberData) {
    const age = memberData.age;
    const currentSavings = memberData.current_savings || 0;
    const yearsToRetirement = (memberData.retirement_age_goal || 65) - age;
    
    // Estimate equity allocation from investment type
    let equityAllocation = 60; // Default
    const investmentType = (memberData.investment_type || '').toLowerCase();
    
    if (investmentType.includes('equity') || investmentType.includes('stock')) {
      equityAllocation = 70;
    } else if (investmentType.includes('bond')) {
      equityAllocation = 20;
    } else if (investmentType.includes('balanced')) {
      equityAllocation = 50;
    }

    const equityValue = currentSavings * (equityAllocation / 100);

    // High market risk if heavily exposed to equities near retirement
    if (yearsToRetirement <= 10 && equityAllocation > 70) {
      return {
        type: 'MARKET_RISK',
        severity: 'HIGH',
        title: 'High Market Risk Near Retirement',
        description: `${equityAllocation}% equity allocation with only ${yearsToRetirement} years to retirement`,
        metrics: {
          equityAllocation,
          equityValue: Math.round(equityValue),
          yearsToRetirement,
          potentialLoss: Math.round(equityValue * 0.3) // 30% market decline
        },
        recommendations: [
          'Begin shifting to more conservative allocations',
          'Consider bond ladder for near-term expenses',
          'Implement systematic rebalancing strategy',
          'Review sequence of returns risk'
        ]
      };
    }

    return null;
  }

  /**
   * Check inflation risk for conservative portfolios
   */
  static checkInflationRisk(memberData) {
    const yearsToRetirement = (memberData.retirement_age_goal || 65) - memberData.age;
    
    // Estimate equity allocation from investment type
    let equityAllocation = 60; // Default
    const investmentType = (memberData.investment_type || '').toLowerCase();
    
    if (investmentType.includes('equity') || investmentType.includes('stock')) {
      equityAllocation = 70;
    } else if (investmentType.includes('bond')) {
      equityAllocation = 20;
    } else if (investmentType.includes('balanced')) {
      equityAllocation = 50;
    }

    // Too conservative for long-term growth
    if (yearsToRetirement > 15 && equityAllocation < 30) {
      return {
        type: 'INFLATION_RISK',
        severity: 'MEDIUM',
        title: 'Inflation Risk from Conservative Allocation',
        description: `Only ${equityAllocation}% equity allocation with ${yearsToRetirement} years to retirement`,
        metrics: {
          equityAllocation,
          yearsToRetirement,
          inflationImpact: Math.round(memberData.current_savings * Math.pow(0.97, yearsToRetirement)) // 3% inflation erosion
        },
        recommendations: [
          'Consider increasing equity allocation for inflation protection',
          'Explore Treasury Inflation-Protected Securities (TIPS)',
          'Review real estate or commodity exposure',
          'Balance growth needs with risk tolerance'
        ]
      };
    }

    return null;
  }

  /**
   * Check longevity risk
   */
  static checkLongevityRisk(memberData) {
    const currentAge = memberData.age;
    const retirementAge = memberData.retirement_age_goal || 65;
    const currentSavings = memberData.current_savings || 0;
    const annualIncome = memberData.annual_income || 0;

    // Assume life expectancy of 85+ for planning
    const planningLifeExpectancy = 90;
    const retirementYears = planningLifeExpectancy - retirementAge;

    if (currentAge >= retirementAge) {
      const currentWithdrawalRate = (annualIncome * 0.8) / currentSavings;
      
      if (currentWithdrawalRate > 0.04) {
        return {
          type: 'LONGEVITY_RISK',
          severity: 'HIGH',
          title: 'Risk of Outliving Savings',
          description: `Current withdrawal rate of ${Math.round(currentWithdrawalRate * 100)}% may deplete savings`,
          metrics: {
            currentWithdrawalRate: Math.round(currentWithdrawalRate * 100),
            safeWithdrawalRate: 4,
            yearsOfSavingsRemaining: Math.round(currentSavings / (annualIncome * 0.8)),
            planningLifeExpectancy
          },
          recommendations: [
            'Consider annuity products for guaranteed income',
            'Reduce withdrawal rate if possible',
            'Explore part-time work or delayed Social Security',
            'Review healthcare cost planning'
          ]
        };
      }
    }

    return null;
  }

  /**
   * Calculate overall risk level from alerts
   */
  static calculateOverallRiskLevel(alerts) {
    if (alerts.length === 0) return 'LOW';

    const highSeverityCount = alerts.filter(alert => alert.severity === 'HIGH').length;
    const mediumSeverityCount = alerts.filter(alert => alert.severity === 'MEDIUM').length;

    if (highSeverityCount >= 2) return 'CRITICAL';
    if (highSeverityCount >= 1) return 'HIGH';
    if (mediumSeverityCount >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate comprehensive recommendations
   */
  static generateRecommendations(alerts, memberData) {
    const recommendations = [];

    // Priority recommendations based on alert types
    const alertTypes = alerts.map(alert => alert.type);

    if (alertTypes.includes('WITHDRAWAL_RATE')) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Income Planning',
        action: 'Review retirement income strategy immediately',
        timeline: 'Within 30 days'
      });
    }

    if (alertTypes.includes('SAVINGS_GAP')) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Savings Strategy',
        action: 'Increase retirement contributions',
        timeline: 'Next payroll cycle'
      });
    }

    if (alertTypes.includes('ASSET_ALLOCATION')) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Portfolio Management',
        action: 'Rebalance investment allocation',
        timeline: 'Within 60 days'
      });
    }

    if (alertTypes.includes('MARKET_RISK')) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Risk Management',
        action: 'Implement de-risking strategy',
        timeline: 'Within 90 days'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Maintenance',
        action: 'Continue current strategy with periodic reviews',
        timeline: 'Annual review'
      });
    }

    return recommendations;
  }

  /**
   * Get risk alerts for multiple members
   */
  static async getBulkRiskAlerts(userIds = null, riskLevel = null) {
    try {
      let query = `
        SELECT user_id, age, annual_income, current_savings, retirement_age_goal,
               investment_type, contribution_amount
        FROM pension_data
        WHERE user_id IS NOT NULL
      `;

      if (userIds && userIds.length > 0) {
        const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
        query += ` AND user_id IN (${placeholders})`;
      }

      const result = await DatabaseConnection.query(query, userIds || []);
      const members = result.rows;

      const bulkAlerts = [];

      for (const member of members) {
        try {
          const memberAlerts = this.analyzeRisks(member);
          
          // Calculate overall risk level
          const highRisks = memberAlerts.filter(alert => alert.severity === 'HIGH').length;
          const mediumRisks = memberAlerts.filter(alert => alert.severity === 'MEDIUM').length;
          
          let overallRiskLevel = 'LOW';
          if (highRisks > 0) overallRiskLevel = 'HIGH';
          else if (mediumRisks > 1) overallRiskLevel = 'MEDIUM';
          
          const alertData = {
            user_id: member.user_id,
            riskLevel: overallRiskLevel,
            alerts: memberAlerts,
            summary: {
              totalAlerts: memberAlerts.length,
              highRisk: highRisks,
              mediumRisk: mediumRisks,
              lowRisk: memberAlerts.filter(alert => alert.severity === 'LOW').length
            }
          };
          
          if (!riskLevel || overallRiskLevel === riskLevel.toUpperCase()) {
            bulkAlerts.push(alertData);
          }
        } catch (error) {
          console.error(`Error generating alerts for user ${member.user_id}:`, error);
        }
      }

      return {
        totalMembers: bulkAlerts.length,
        riskDistribution: this.calculateRiskDistribution(bulkAlerts),
        alerts: bulkAlerts,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Bulk risk alerts error:', error);
      throw error;
    }
  }

  /**
   * Calculate risk distribution across members
   */
  static calculateRiskDistribution(alerts) {
    const distribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    
    alerts.forEach(alert => {
      distribution[alert.riskLevel]++;
    });

    const total = alerts.length;
    return {
      counts: distribution,
      percentages: {
        CRITICAL: Math.round((distribution.CRITICAL / total) * 100),
        HIGH: Math.round((distribution.HIGH / total) * 100),
        MEDIUM: Math.round((distribution.MEDIUM / total) * 100),
        LOW: Math.round((distribution.LOW / total) * 100)
      }
    };
  }
}

export default PersonalizedRiskAlertService;
