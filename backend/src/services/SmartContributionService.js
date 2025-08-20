import DatabaseConnection from '../config/database.js';

/**
 * Smart Contribution Recommendations Service
 * Provides personalized contribution advice and growth projections
 */
class SmartContributionService {

  /**
   * Generate comprehensive contribution recommendations
   */
  static async generateContributionRecommendations(userId) {
    try {
      // Fetch member data from database using user_id
      const query = `
        SELECT user_id, age, annual_income, current_savings, investment_type,
               retirement_age_goal, contribution_amount, total_annual_contribution
        FROM pension_data 
        WHERE user_id = $1
      `;
      
      const result = await DatabaseConnection.query(query, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Member data not found');
      }
      
      const memberData = result.rows[0];

      const currentAge = memberData.age;
      const retirementAge = memberData.retirement_age_goal || 65;
      const yearsToRetirement = retirementAge - currentAge;
      const currentSavings = memberData.current_savings || 0;
      const annualIncome = memberData.annual_income || 0;
      const currentContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;

      // Calculate retirement goals
      const retirementGoal = annualIncome * 10; // 10x annual income rule
      const incomeReplacementTarget = annualIncome * 0.8; // 80% income replacement

      // Generate multiple scenarios
      const scenarios = this.generateScenarios(memberData);

      // Calculate contribution gap
      const contributionGap = this.calculateContributionGap(memberData);

      // Generate specific recommendations
      const recommendations = this.generateRecommendations(memberData, scenarios);

      // Calculate contribution limits and opportunities
      const contributionLimits = this.getContributionLimits(currentAge);

      return {
        userId,
        currentStatus: {
          currentSavings,
          currentContributions,
          yearsToRetirement,
          retirementGoal,
          incomeReplacementTarget
        },
        contributionGap,
        scenarios,
        recommendations,
        contributionLimits,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Contribution recommendations error:', error);
      throw error;
    }
  }

  /**
   * Generate growth scenarios with different contribution levels
   */
  static generateScenarios(memberData) {
    const currentAge = memberData.age;
    const retirementAge = memberData.retirement_age_goal || 65;
    const yearsToRetirement = retirementAge - currentAge;
    const currentSavings = memberData.current_savings || 0;
    const currentContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;
    const annualIncome = memberData.annual_income || 0;

    if (yearsToRetirement <= 0) {
      return this.generateRetiredScenarios(memberData);
    }

    const assumedReturn = 0.07; // 7% annual return
    const scenarios = [];

    // Scenario 1: Status Quo (current contributions)
    const statusQuoValue = this.calculateFutureValue(
      currentSavings, 
      currentContributions, 
      assumedReturn, 
      yearsToRetirement
    );

    scenarios.push({
      name: 'Status Quo',
      description: 'Continue current contribution level',
      annualContribution: currentContributions,
      monthlyContribution: Math.round(currentContributions / 12),
      projectedValue: Math.round(statusQuoValue),
      incomeReplacement: Math.round((statusQuoValue * 0.04 / annualIncome) * 100),
      probability: 'Medium'
    });

    // Scenario 2: Increased Contributions (10% income)
    const tenPercentContribution = annualIncome * 0.10;
    const tenPercentValue = this.calculateFutureValue(
      currentSavings, 
      tenPercentContribution, 
      assumedReturn, 
      yearsToRetirement
    );

    scenarios.push({
      name: '10% Income Savings',
      description: 'Save 10% of annual income',
      annualContribution: tenPercentContribution,
      monthlyContribution: Math.round(tenPercentContribution / 12),
      projectedValue: Math.round(tenPercentValue),
      incomeReplacement: Math.round((tenPercentValue * 0.04 / annualIncome) * 100),
      probability: 'High'
    });

    // Scenario 3: Aggressive Savings (15% income)
    const fifteenPercentContribution = annualIncome * 0.15;
    const fifteenPercentValue = this.calculateFutureValue(
      currentSavings, 
      fifteenPercentContribution, 
      assumedReturn, 
      yearsToRetirement
    );

    scenarios.push({
      name: '15% Income Savings',
      description: 'Aggressive savings rate of 15%',
      annualContribution: fifteenPercentContribution,
      monthlyContribution: Math.round(fifteenPercentContribution / 12),
      projectedValue: Math.round(fifteenPercentValue),
      incomeReplacement: Math.round((fifteenPercentValue * 0.04 / annualIncome) * 100),
      probability: 'High'
    });

    // Scenario 4: Maximum Contribution (401k limits)
    const contributionLimits = this.getContributionLimits(currentAge);
    const maxContribution = contributionLimits.total401k;
    const maxValue = this.calculateFutureValue(
      currentSavings, 
      maxContribution, 
      assumedReturn, 
      yearsToRetirement
    );

    scenarios.push({
      name: 'Maximum 401(k)',
      description: 'Contribute maximum allowed to 401(k)',
      annualContribution: maxContribution,
      monthlyContribution: Math.round(maxContribution / 12),
      projectedValue: Math.round(maxValue),
      incomeReplacement: Math.round((maxValue * 0.04 / annualIncome) * 100),
      probability: 'High'
    });

    // Add market variation scenarios
    scenarios.forEach(scenario => {
      scenario.optimisticValue = Math.round(this.calculateFutureValue(
        currentSavings, 
        scenario.annualContribution, 
        0.09, // 9% optimistic return
        yearsToRetirement
      ));
      scenario.pessimisticValue = Math.round(this.calculateFutureValue(
        currentSavings, 
        scenario.annualContribution, 
        0.05, // 5% conservative return
        yearsToRetirement
      ));
    });

    return scenarios;
  }

  /**
   * Generate scenarios for already retired members
   */
  static generateRetiredScenarios(memberData) {
    const currentSavings = memberData.current_savings || 0;
    const annualIncome = memberData.annual_income || 0;

    return [{
      name: 'Current Portfolio',
      description: 'Maintain current portfolio with 4% withdrawal rule',
      annualContribution: 0,
      monthlyContribution: 0,
      projectedValue: currentSavings,
      incomeReplacement: Math.round((currentSavings * 0.04 / annualIncome) * 100),
      sustainableWithdrawal: Math.round(currentSavings * 0.04),
      probability: 'Medium'
    }];
  }

  /**
   * Calculate future value with regular contributions
   */
  static calculateFutureValue(presentValue, annualContribution, annualReturn, years) {
    if (years <= 0) return presentValue;

    // Future value of current savings
    const futureValuePresent = presentValue * Math.pow(1 + annualReturn, years);

    // Future value of annuity (regular contributions)
    const futureValueAnnuity = annualContribution * 
      ((Math.pow(1 + annualReturn, years) - 1) / annualReturn);

    return futureValuePresent + futureValueAnnuity;
  }

  /**
   * Calculate contribution gap to meet retirement goals
   */
  static calculateContributionGap(memberData) {
    const currentAge = memberData.age;
    const retirementAge = memberData.retirement_age_goal || 65;
    const yearsToRetirement = retirementAge - currentAge;
    const currentSavings = memberData.current_savings || 0;
    const currentContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;
    const annualIncome = memberData.annual_income || 0;

    if (yearsToRetirement <= 0) {
      return {
        isRetired: true,
        message: 'Member is already retired',
        currentWithdrawalCapacity: Math.round(currentSavings * 0.04)
      };
    }

    const retirementGoal = annualIncome * 10;
    const assumedReturn = 0.07;

    // Project current trajectory
    const projectedSavings = this.calculateFutureValue(
      currentSavings, 
      currentContributions, 
      assumedReturn, 
      yearsToRetirement
    );

    const gap = retirementGoal - projectedSavings;

    if (gap <= 0) {
      return {
        onTrack: true,
        surplus: Math.round(Math.abs(gap)),
        message: 'On track to meet retirement goals'
      };
    }

    // Calculate additional contribution needed
    const additionalAnnualContribution = 
      (gap * assumedReturn) / (Math.pow(1 + assumedReturn, yearsToRetirement) - 1);

    return {
      onTrack: false,
      gap: Math.round(gap),
      additionalAnnualContribution: Math.round(additionalAnnualContribution),
      additionalMonthlyContribution: Math.round(additionalAnnualContribution / 12),
      percentageOfIncome: Math.round((additionalAnnualContribution / annualIncome) * 100),
      message: `Need additional $${Math.round(additionalAnnualContribution).toLocaleString()} annually`
    };
  }

  /**
   * Generate specific contribution recommendations
   */
  static generateRecommendations(memberData, scenarios) {
    const currentAge = memberData.age;
    const annualIncome = memberData.annual_income || 0;
    const currentContributions = memberData.yearly_contributions || 0;
    const contributionRate = currentContributions / annualIncome;

    const recommendations = [];

    // Immediate actions
    if (contributionRate < 0.03) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Immediate Action',
        title: 'Start Emergency Contributions',
        description: 'Current savings rate is critically low',
        action: 'Increase to at least 6% of income immediately',
        impact: 'Foundation for retirement security'
      });
    }

    // Employer match optimization
    const employerMatch = memberData.employer_match_rate || 0;
    if (employerMatch > 0 && contributionRate < employerMatch) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Free Money',
        title: 'Maximize Employer Match',
        description: 'Not taking full advantage of employer matching',
        action: `Contribute at least ${Math.round(employerMatch * 100)}% to get full match`,
        impact: 'Immediate 100% return on investment'
      });
    }

    // Age-based recommendations
    if (currentAge < 30) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Early Career',
        title: 'Leverage Time Advantage',
        description: 'You have decades for compound growth',
        action: 'Target 10-15% savings rate with aggressive allocation',
        impact: 'Maximize long-term growth potential'
      });
    } else if (currentAge >= 50) {
      const contributionLimits = this.getContributionLimits(currentAge);
      recommendations.push({
        priority: 'HIGH',
        category: 'Catch-Up Strategy',
        title: 'Utilize Catch-Up Contributions',
        description: 'Take advantage of higher contribution limits',
        action: `Consider contributing up to $${contributionLimits.total401k.toLocaleString()}`,
        impact: 'Accelerate retirement savings in final years'
      });
    }

    // Income-based recommendations
    if (contributionRate < 0.10) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Savings Rate',
        title: 'Increase Contribution Rate',
        description: 'Current savings rate may not meet retirement goals',
        action: 'Gradually increase to 10-15% of income',
        impact: 'Significantly improve retirement readiness'
      });
    }

    // Tax efficiency recommendations
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Tax Strategy',
      title: 'Optimize Tax Benefits',
      description: 'Review tax-advantaged account strategies',
      action: 'Consider Roth vs Traditional based on current vs future tax rates',
      impact: 'Maximize after-tax retirement income'
    });

    return recommendations;
  }

  /**
   * Get current contribution limits based on age and year
   */
  static getContributionLimits(age) {
    const year = new Date().getFullYear();
    
    // 2024 contribution limits
    const limits = {
      standard401k: 23000,
      catchUp401k: age >= 50 ? 7500 : 0,
      standardIRA: 7000,
      catchUpIRA: age >= 50 ? 1000 : 0
    };

    limits.total401k = limits.standard401k + limits.catchUp401k;
    limits.totalIRA = limits.standardIRA + limits.catchUpIRA;
    limits.combinedMax = limits.total401k + limits.totalIRA;

    return limits;
  }

  /**
   * Calculate what-if scenarios for contribution changes
   */
  static async calculateWhatIfScenarios(userId, contributionChanges) {
    try {
      // Fetch member data from database
      const query = `
        SELECT user_id, age, annual_income, current_savings, risk_tolerance, 
               retirement_age_goal, contribution_amount, employer_contribution, 
               total_annual_contribution, pension_type, annual_return_rate,
               volatility, projected_pension_amount, expected_annual_payout,
               inflation_adjusted_payout, years_of_payout
        FROM pension_data 
        WHERE user_id = $1
      `;
      
      const result = await DatabaseConnection.query(query, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Member data not found');
      }
      
      const memberData = result.rows[0];

      const scenarios = [];

      for (const change of contributionChanges) {
        const modifiedData = { ...memberData };
        
        // Apply changes
        if (change.newAnnualContribution !== undefined) {
          modifiedData.total_annual_contribution = change.newAnnualContribution;
        }
        if (change.retirementAgeChange !== undefined) {
          modifiedData.retirement_age_goal = memberData.retirement_age_goal + change.retirementAgeChange;
        }

        const scenario = this.generateScenarios(modifiedData)[0]; // Get the first scenario
        
        // Calculate target achievement
        const targetAchievement = this.calculateTargetAchievement(scenario, memberData);
        
        scenarios.push({
          name: change.name || 'What-If Scenario',
          changes: change,
          results: {
            ...scenario,
            targetAchievement
          }
        });
      }

      return {
        userId,
        baselineScenario: {
          ...this.generateScenarios(memberData)[0],
          targetAchievement: this.calculateTargetAchievement(this.generateScenarios(memberData)[0], memberData)
        },
        whatIfScenarios: scenarios,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('What-if calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate how well a scenario meets retirement targets
   */
  static calculateTargetAchievement(scenario, memberData) {
    const targetAmount = memberData.projected_pension_amount || 0;
    const targetPayout = memberData.expected_annual_payout || 0;
    const inflationAdjustedPayout = memberData.inflation_adjusted_payout || 0;
    const payoutYears = memberData.years_of_payout || 25;
    
    const projectedValue = scenario.projectedValue || 0;
    const sustainableWithdrawal = projectedValue * 0.04; // 4% rule
    
    // Calculate achievement percentages
    const targetAmountAchievement = targetAmount > 0 ? (projectedValue / targetAmount) * 100 : 100;
    const payoutAchievement = targetPayout > 0 ? (sustainableWithdrawal / targetPayout) * 100 : 100;
    const inflationAdjustedAchievement = inflationAdjustedPayout > 0 ? (sustainableWithdrawal / inflationAdjustedPayout) * 100 : 100;
    
    // Determine status
    let status = 'On Track';
    if (targetAmountAchievement < 80) status = 'Behind Target';
    if (targetAmountAchievement > 120) status = 'Exceeds Target';
    
    return {
      targetAmount,
      projectedValue,
      targetAmountAchievement: Math.round(targetAmountAchievement),
      targetPayout,
      sustainableWithdrawal: Math.round(sustainableWithdrawal),
      payoutAchievement: Math.round(payoutAchievement),
      inflationAdjustedPayout,
      inflationAdjustedAchievement: Math.round(inflationAdjustedAchievement),
      payoutYears,
      status,
      gapAnalysis: {
        amountGap: Math.max(0, targetAmount - projectedValue),
        payoutGap: Math.max(0, targetPayout - sustainableWithdrawal),
        inflationGap: Math.max(0, inflationAdjustedPayout - sustainableWithdrawal)
      }
    };
  }

  /**
   * Get contribution recommendations for multiple members
   */
  static async getBulkRecommendations(filters = {}) {
    try {
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Build filter conditions
      if (filters.ageMin && filters.ageMax) {
        conditions.push(`age BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        params.push(filters.ageMin, filters.ageMax);
        paramIndex += 2;
      }

      if (filters.incomeMin && filters.incomeMax) {
        conditions.push(`annual_income BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        params.push(filters.incomeMin, filters.incomeMax);
        paramIndex += 2;
      }

      let query = `
        SELECT user_id, age, annual_income, current_savings, 
               contribution_amount, total_annual_contribution, retirement_age_goal, investment_type
        FROM pension_data
        WHERE user_id IS NOT NULL
      `;

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      const result = await DatabaseConnection.query(query, params);
      const members = result.rows;

      const bulkRecommendations = [];

      for (const member of members) {
        try {
          const recommendations = await this.generateContributionRecommendations(member.user_id);
          bulkRecommendations.push(recommendations);
        } catch (error) {
          console.error(`Error generating recommendations for user ${member.user_id}:`, error);
        }
      }

      return {
        totalMembers: bulkRecommendations.length,
        summary: this.generateBulkSummary(bulkRecommendations),
        recommendations: bulkRecommendations,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Bulk recommendations error:', error);
      throw error;
    }
  }

  /**
   * Generate summary statistics for bulk recommendations
   */
  static generateBulkSummary(recommendations) {
    const total = recommendations.length;
    
    const onTrackCount = recommendations.filter(r => 
      r.contributionGap.onTrack || r.contributionGap.isRetired
    ).length;

    const avgGap = recommendations
      .filter(r => r.contributionGap.gap)
      .reduce((sum, r) => sum + r.contributionGap.gap, 0) / 
      recommendations.filter(r => r.contributionGap.gap).length || 0;

    const highPriorityCount = recommendations.filter(r =>
      r.recommendations.some(rec => rec.priority === 'HIGH')
    ).length;

    return {
      totalMembers: total,
      onTrackPercentage: Math.round((onTrackCount / total) * 100),
      averageGap: Math.round(avgGap),
      needingImmediateAction: highPriorityCount,
      actionNeededPercentage: Math.round((highPriorityCount / total) * 100)
    };
  }
}

export default SmartContributionService;
