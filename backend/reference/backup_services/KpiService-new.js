/**
 * KPI Service
 * Handles pension-related KPI calculations and retirement projections
 * Provides comprehensive retirement analytics for pension management
 */

class KpiService {
  
  /**
   * Calculate the projected retirement age
   * @param {number} currentAge - Current age of the member
   * @param {number} targetCorpus - Target retirement corpus needed
   * @param {number} annualInvestment - Annual investment/contribution amount
   * @param {number} annualReturn - Expected annual return rate (as decimal, e.g., 0.08 for 8%)
   * @param {number} currentCorpus - Current accumulated corpus (default: 0)
   * @returns {number} Projected retirement age
   */
  static calculateRetirementAge(currentAge, targetCorpus, annualInvestment, annualReturn, currentCorpus = 0) {
    // Input validation
    if (currentAge <= 0 || currentAge > 100) {
      throw new Error('Invalid current age');
    }
    if (targetCorpus <= 0) {
      throw new Error('Target corpus must be positive');
    }
    if (annualInvestment < 0) {
      throw new Error('Annual investment cannot be negative');
    }
    if (annualReturn < 0) {
      throw new Error('Annual return cannot be negative');
    }

    let years = 0;
    let corpus = currentCorpus;
    const maxYears = 100; // Prevent infinite loops

    // Loop until corpus >= target or max years reached
    while (corpus < targetCorpus && years < maxYears) {
      years += 1;
      corpus = corpus * (1 + annualReturn) + annualInvestment;
    }

    if (years >= maxYears) {
      throw new Error('Target corpus not achievable within reasonable timeframe');
    }

    return currentAge + years;
  }

  /**
   * Predict total corpus at retirement
   * @param {number} currentSavings - Current accumulated savings
   * @param {number} annualContribution - Annual contribution amount
   * @param {number} expectedReturn - Expected annual return rate (as decimal)
   * @param {number} currentAge - Current age
   * @param {number} retirementAge - Target retirement age
   * @returns {number} Predicted total corpus at retirement
   */
  static predictTotalCorpus(currentSavings, annualContribution, expectedReturn, currentAge, retirementAge) {
    // Input validation
    if (currentAge >= retirementAge) {
      throw new Error('Current age must be less than retirement age');
    }
    if (expectedReturn < 0) {
      throw new Error('Expected return cannot be negative');
    }

    const years = retirementAge - currentAge;
    const r = expectedReturn;

    // Handle zero return rate
    if (r === 0) {
      return currentSavings + (annualContribution * years);
    }

    // Future Value of current savings (lump sum)
    const fvLumpsum = currentSavings * Math.pow(1 + r, years);

    // Future Value of yearly contributions (ordinary annuity)
    const fvAnnuity = annualContribution * ((Math.pow(1 + r, years) - 1) / r);

    return fvLumpsum + fvAnnuity;
  }

  /**
   * Calculate retirement readiness score
   * @param {Object} memberData - Member's pension data
   * @returns {Object} Readiness analysis with score and recommendations
   */
  static calculateRetirementReadiness(memberData) {
    try {
      const {
        currentAge,
        retirementAge = 65,
        currentBalance = 0,
        monthlyContribution = 0,
        expectedReturnRate = 0.08,
        targetRetirementIncome = 0,
        currentSalary = 0
      } = memberData;

      const annualContribution = monthlyContribution * 12;
      
      // Predict corpus at retirement
      const projectedCorpus = this.predictTotalCorpus(
        currentBalance,
        annualContribution,
        expectedReturnRate,
        currentAge,
        retirementAge
      );

      // Calculate target corpus (assuming 4% withdrawal rule)
      const targetCorpus = targetRetirementIncome > 0 
        ? targetRetirementIncome * 25  // 4% rule: corpus = income / 0.04
        : currentSalary * 10; // Fallback: 10x current salary

      // Calculate readiness score
      const readinessScore = Math.min((projectedCorpus / targetCorpus) * 100, 100);

      // Generate recommendations
      const recommendations = this.generateRecommendations(readinessScore, memberData);

      return {
        readinessScore: Math.round(readinessScore * 10) / 10,
        projectedCorpus,
        targetCorpus,
        shortfall: Math.max(0, targetCorpus - projectedCorpus),
        yearsToRetirement: retirementAge - currentAge,
        recommendations
      };

    } catch (error) {
      console.error('Error calculating retirement readiness:', error);
      throw new Error('Unable to calculate retirement readiness');
    }
  }

  /**
   * Generate personalized recommendations
   * @param {number} readinessScore - Current readiness score (0-100)
   * @param {Object} memberData - Member's pension data
   * @returns {Array} Array of recommendation objects
   */
  static generateRecommendations(readinessScore, memberData) {
    const recommendations = [];
    const { monthlyContribution = 0, currentSalary = 0 } = memberData;

    if (readinessScore < 50) {
      recommendations.push({
        priority: 'high',
        type: 'contribution_increase',
        title: 'Significantly Increase Contributions',
        description: 'Your current savings rate may not meet retirement goals. Consider increasing contributions by 50-100%.',
        action: 'Increase monthly contribution',
        impact: 'High'
      });
    } else if (readinessScore < 75) {
      recommendations.push({
        priority: 'medium',
        type: 'contribution_increase',
        title: 'Moderate Contribution Increase',
        description: 'You\'re on a reasonable track but could improve. Consider increasing contributions by 20-30%.',
        action: 'Increase monthly contribution',
        impact: 'Medium'
      });
    }

    if (monthlyContribution / (currentSalary / 12) < 0.15) {
      recommendations.push({
        priority: 'medium',
        type: 'savings_rate',
        title: 'Improve Savings Rate',
        description: 'Aim to save at least 15% of your salary for retirement.',
        action: 'Review budget and increase savings',
        impact: 'Medium'
      });
    }

    if (readinessScore >= 80) {
      recommendations.push({
        priority: 'low',
        type: 'optimization',
        title: 'Optimize Investment Allocation',
        description: 'You\'re well on track! Consider optimizing your investment mix for better returns.',
        action: 'Review investment portfolio',
        impact: 'Low'
      });
    }

    return recommendations;
  }

  /**
   * Calculate required monthly contribution to meet retirement goals
   * @param {Object} params - Calculation parameters
   * @returns {number} Required monthly contribution
   */
  static calculateRequiredContribution({ 
    currentAge, 
    retirementAge, 
    currentBalance, 
    targetCorpus, 
    expectedReturnRate 
  }) {
    const years = retirementAge - currentAge;
    const r = expectedReturnRate;

    // Future value of current balance
    const fvCurrent = currentBalance * Math.pow(1 + r, years);
    
    // Required corpus from future contributions
    const requiredFromContributions = targetCorpus - fvCurrent;

    if (requiredFromContributions <= 0) {
      return 0; // Already have enough
    }

    // Calculate required annual contribution using annuity formula
    let annualContribution;
    if (r === 0) {
      annualContribution = requiredFromContributions / years;
    } else {
      annualContribution = requiredFromContributions * r / (Math.pow(1 + r, years) - 1);
    }

    return Math.max(0, annualContribution / 12); // Convert to monthly
  }

  /**
   * Calculate savings rate as percentage of salary
   * @param {Object} memberData - Member data
   * @returns {number} Savings rate percentage
   */
  static calculateSavingsRate(memberData) {
    const { monthlyContribution = 0, currentSalary = 0 } = memberData;
    if (currentSalary <= 0) return 0;
    
    const monthlySalary = currentSalary / 12;
    return Math.round((monthlyContribution / monthlySalary) * 100 * 10) / 10;
  }

  /**
   * Project retirement income scenarios
   * @param {Object} memberData - Member data
   * @returns {Object} Different retirement scenarios
   */
  static projectRetirementScenarios(memberData) {
    const baseContribution = memberData.monthlyContribution || 0;
    const scenarios = {};

    // Conservative, moderate, and aggressive scenarios
    const returnRates = {
      conservative: 0.06,
      moderate: 0.08,
      aggressive: 0.10
    };

    Object.entries(returnRates).forEach(([scenario, returnRate]) => {
      const projectedCorpus = this.predictTotalCorpus(
        memberData.currentBalance || 0,
        baseContribution * 12,
        returnRate,
        memberData.currentAge,
        memberData.retirementAge || 65
      );

      // 4% withdrawal rule for annual income
      const annualIncome = projectedCorpus * 0.04;

      scenarios[scenario] = {
        returnRate,
        projectedCorpus: Math.round(projectedCorpus),
        monthlyIncome: Math.round(annualIncome / 12),
        annualIncome: Math.round(annualIncome),
        replacementRatio: memberData.currentSalary > 0 
          ? Math.round((annualIncome / memberData.currentSalary) * 100) 
          : 0
      };
    });

    return scenarios;
  }

  /**
   * Calculate contribution impact analysis
   * @param {Object} memberData - Member data
   * @returns {Object} Impact of different contribution levels
   */
  static calculateContributionImpact(memberData) {
    const baseContribution = memberData.monthlyContribution || 0;
    const impacts = {};

    // Different contribution increase scenarios
    const increases = [0, 0.1, 0.2, 0.5, 1.0]; // 0%, 10%, 20%, 50%, 100%

    increases.forEach(increase => {
      const newContribution = baseContribution * (1 + increase);
      const projectedCorpus = this.predictTotalCorpus(
        memberData.currentBalance || 0,
        newContribution * 12,
        memberData.expectedReturnRate || 0.08,
        memberData.currentAge,
        memberData.retirementAge || 65
      );

      const increaseLabel = increase === 0 ? 'current' : `+${Math.round(increase * 100)}%`;
      impacts[increaseLabel] = {
        monthlyContribution: Math.round(newContribution),
        projectedCorpus: Math.round(projectedCorpus),
        additionalIncome: Math.round((projectedCorpus * 0.04) / 12)
      };
    });

    return impacts;
  }
}

module.exports = KpiService;
