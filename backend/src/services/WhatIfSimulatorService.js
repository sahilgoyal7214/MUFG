import DatabaseConnection from '../config/database.js';

/**
 * What-If Simulator Service
 * Provides scenario modeling and parameter adjustment analysis
 */
class WhatIfSimulatorService {

  /**
   * Run comprehensive what-if simulation
   */
  static async runSimulation(userId, scenarioParameters) {
    try {
      // Fetch member data from database
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

      // Validate scenario parameters
      const validatedParams = this.validateScenarioParameters(scenarioParameters);

      // Create baseline scenario
      const baseline = this.createBaselineScenario(memberData);

      // Create modified scenarios
      const scenarios = this.createModifiedScenarios(memberData, validatedParams);

      // Calculate market stress scenarios
      const stressTests = this.runStressTests(memberData, validatedParams);

      // Generate comparison analysis
      const analysis = this.generateComparisonAnalysis(baseline, scenarios, stressTests);

      return {
        userId,
        baseline,
        scenarios,
        stressTests,
        analysis,
        parametersUsed: validatedParams,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('What-if simulation error:', error);
      throw error;
    }
  }

  /**
   * Validate and set default scenario parameters
   */
  static validateScenarioParameters(params) {
    return {
      // Contribution changes
      contributionChanges: params.contributionChanges || [0, 1000, 2000, 5000],
      
      // Retirement age changes
      retirementAgeChanges: params.retirementAgeChanges || [-2, -1, 0, 1, 2],
      
      // Return rate scenarios
      returnRates: params.returnRates || [0.05, 0.06, 0.07, 0.08, 0.09],
      
      // Inflation rates
      inflationRates: params.inflationRates || [0.02, 0.025, 0.03, 0.035],
      
      // Market scenarios
      marketScenarios: params.marketScenarios || [
        { name: 'Bull Market', equity: 0.12, bond: 0.05 },
        { name: 'Normal Market', equity: 0.08, bond: 0.04 },
        { name: 'Bear Market', equity: 0.03, bond: 0.03 },
        { name: 'Recession', equity: -0.05, bond: 0.02 }
      ],
      
      // Life expectancy scenarios
      lifeExpectancy: params.lifeExpectancy || [80, 85, 90, 95]
    };
  }

  /**
   * Create baseline scenario from current member data
   */
  static createBaselineScenario(memberData) {
    const currentAge = memberData.age;
    const retirementAge = memberData.retirement_age_goal || 65;
    const yearsToRetirement = retirementAge - currentAge;
    const currentSavings = memberData.current_savings || 0;
    const annualContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;
    const annualIncome = memberData.annual_income || 0;

    const assumedReturn = 0.07;
    const projectedValue = this.calculateFutureValue(
      currentSavings, 
      annualContributions, 
      assumedReturn, 
      yearsToRetirement
    );

    return {
      name: 'Current Plan',
      parameters: {
        currentAge,
        retirementAge,
        currentSavings,
        annualContributions,
        assumedReturn
      },
      results: {
        projectedValue: Math.round(projectedValue),
        sustainableWithdrawal: Math.round(projectedValue * 0.04),
        incomeReplacement: Math.round((projectedValue * 0.04 / annualIncome) * 100),
        yearsToRetirement
      }
    };
  }

  /**
   * Create multiple modified scenarios
   */
  static createModifiedScenarios(memberData, params) {
    const scenarios = [];

    // Contribution change scenarios
    params.contributionChanges.forEach(change => {
      const modifiedContribution = (memberData.total_annual_contribution || memberData.contribution_amount || 0) + change;
      const scenario = this.calculateScenario(memberData, {
        yearlyContributions: modifiedContribution,
        scenarioName: `Contribution ${change >= 0 ? '+' : ''}$${change}`
      });
      scenarios.push(scenario);
    });

    // Retirement age change scenarios
    params.retirementAgeChanges.forEach(ageChange => {
      const modifiedRetirementAge = (memberData.retirement_age_goal || 65) + ageChange;
      const scenario = this.calculateScenario(memberData, {
        retirementAge: modifiedRetirementAge,
        scenarioName: `Retirement ${ageChange >= 0 ? '+' : ''}${ageChange} years`
      });
      scenarios.push(scenario);
    });

    // Return rate scenarios
    params.returnRates.forEach(returnRate => {
      const scenario = this.calculateScenario(memberData, {
        assumedReturn: returnRate,
        scenarioName: `${Math.round(returnRate * 100)}% Annual Return`
      });
      scenarios.push(scenario);
    });

    return scenarios;
  }

  /**
   * Calculate individual scenario
   */
  static calculateScenario(memberData, modifications) {
    const currentAge = memberData.age;
    const retirementAge = modifications.retirementAge || memberData.retirement_age_goal || 65;
    const yearsToRetirement = retirementAge - currentAge;
    const currentSavings = memberData.current_savings || 0;
    const annualContributions = modifications.yearlyContributions || memberData.total_annual_contribution || memberData.contribution_amount || 0;
    const assumedReturn = modifications.assumedReturn || 0.07;
    const annualIncome = memberData.annual_income || 0;

    const projectedValue = this.calculateFutureValue(
      currentSavings, 
      annualContributions, 
      assumedReturn, 
      yearsToRetirement
    );

    return {
      name: modifications.scenarioName,
      parameters: {
        currentAge,
        retirementAge,
        currentSavings,
        annualContributions,
        assumedReturn,
        yearsToRetirement
      },
      results: {
        projectedValue: Math.round(projectedValue),
        sustainableWithdrawal: Math.round(projectedValue * 0.04),
        incomeReplacement: Math.round((projectedValue * 0.04 / annualIncome) * 100),
        contributionTotal: Math.round(annualContributions * yearsToRetirement)
      }
    };
  }

  /**
   * Run market stress tests
   */
  static runStressTests(memberData, params) {
    const stressTests = [];

    // Market scenario stress tests
    params.marketScenarios.forEach(marketScenario => {
      const stressTest = this.calculateMarketStressTest(memberData, marketScenario);
      stressTests.push(stressTest);
    });

    // Sequence of returns risk
    const sequenceRiskTest = this.calculateSequenceOfReturnsRisk(memberData);
    stressTests.push(sequenceRiskTest);

    // Inflation stress test
    const inflationStressTest = this.calculateInflationStressTest(memberData, params);
    stressTests.push(inflationStressTest);

    // Longevity stress test
    const longevityStressTest = this.calculateLongevityStressTest(memberData, params);
    stressTests.push(longevityStressTest);

    return stressTests;
  }

  /**
   * Calculate market scenario stress test
   */
  static calculateMarketStressTest(memberData, marketScenario) {
    const currentAge = memberData.age;
    const retirementAge = memberData.retirement_age_goal || 65;
    const yearsToRetirement = retirementAge - currentAge;
    const currentSavings = memberData.current_savings || 0;
    const annualContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;
    
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
    
    equityAllocation = equityAllocation / 100;

    // Calculate blended return based on allocation
    const blendedReturn = (equityAllocation * marketScenario.equity) + 
                         ((1 - equityAllocation) * marketScenario.bond);

    const projectedValue = this.calculateFutureValue(
      currentSavings, 
      annualContributions, 
      blendedReturn, 
      yearsToRetirement
    );

    return {
      name: `Market Stress: ${marketScenario.name}`,
      type: 'Market Scenario',
      parameters: {
        equityReturn: Math.round(marketScenario.equity * 100),
        bondReturn: Math.round(marketScenario.bond * 100),
        blendedReturn: Math.round(blendedReturn * 100),
        equityAllocation: Math.round(equityAllocation * 100)
      },
      results: {
        projectedValue: Math.round(projectedValue),
        sustainableWithdrawal: Math.round(projectedValue * 0.04),
        vsBaseline: Math.round(((projectedValue / this.calculateFutureValue(
          currentSavings, annualContributions, 0.07, yearsToRetirement
        )) - 1) * 100)
      }
    };
  }

  /**
   * Calculate sequence of returns risk
   */
  static calculateSequenceOfReturnsRisk(memberData) {
    const currentAge = memberData.age;
    const retirementAge = memberData.expected_retirement_age || 65;
    const currentSavings = memberData.current_savings || 0;
    const annualIncome = memberData.annual_income || 0;

    // Simulate poor returns in early retirement years
    const portfolioAtRetirement = currentSavings * Math.pow(1.07, retirementAge - currentAge);
    
    // Scenario: 20% loss in first year of retirement, then average returns
    const yearOneValue = portfolioAtRetirement * 0.8;
    const withdrawalAmount = annualIncome * 0.8;
    const afterWithdrawal = yearOneValue - withdrawalAmount;
    
    // Project remaining years
    const remainingYears = 25; // Assume 25-year retirement
    const recoveryRate = 0.08; // Slightly higher to compensate
    
    const finalValue = afterWithdrawal * Math.pow(1 + recoveryRate, remainingYears - 1);

    return {
      name: 'Sequence of Returns Risk',
      type: 'Stress Test',
      parameters: {
        scenarioDescription: '20% loss in year 1 of retirement',
        initialLoss: -20,
        recoveryRate: 8
      },
      results: {
        portfolioAtRetirement: Math.round(portfolioAtRetirement),
        afterYearOneLoss: Math.round(yearOneValue),
        projectedEndValue: Math.round(finalValue),
        portfolioSurvival: finalValue > 0 ? 'Survives' : 'Depleted'
      }
    };
  }

  /**
   * Calculate inflation stress test
   */
  static calculateInflationStressTest(memberData, params) {
    const highInflation = Math.max(...params.inflationRates);
    const normalReturn = 0.07;
    const realReturn = normalReturn - highInflation;

    const scenario = this.calculateScenario(memberData, {
      assumedReturn: realReturn,
      scenarioName: `High Inflation (${Math.round(highInflation * 100)}%)`
    });

    return {
      name: 'High Inflation Stress Test',
      type: 'Inflation Risk',
      parameters: {
        inflationRate: Math.round(highInflation * 100),
        nominalReturn: Math.round(normalReturn * 100),
        realReturn: Math.round(realReturn * 100)
      },
      results: scenario.results
    };
  }

  /**
   * Calculate longevity stress test
   */
  static calculateLongevityStressTest(memberData, params) {
    const maxLifeExpectancy = Math.max(...params.lifeExpectancy);
    const retirementAge = memberData.retirement_age_goal || 65;
    const retirementYears = maxLifeExpectancy - retirementAge;

    const projectedRetirementValue = this.calculateFutureValue(
      memberData.current_savings || 0,
      memberData.total_annual_contribution || memberData.contribution_amount || 0,
      0.07,
      retirementAge - memberData.age
    );

    const annualWithdrawal = projectedRetirementValue * 0.04;
    const totalWithdrawals = annualWithdrawal * retirementYears;

    return {
      name: 'Longevity Stress Test',
      type: 'Longevity Risk',
      parameters: {
        lifeExpectancy: maxLifeExpectancy,
        retirementYears,
        withdrawalRate: 4
      },
      results: {
        projectedRetirementValue: Math.round(projectedRetirementValue),
        annualWithdrawal: Math.round(annualWithdrawal),
        totalWithdrawals: Math.round(totalWithdrawals),
        portfolioSufficiency: totalWithdrawals <= projectedRetirementValue ? 'Sufficient' : 'Insufficient'
      }
    };
  }

  /**
   * Generate comparison analysis
   */
  static generateComparisonAnalysis(baseline, scenarios, stressTests) {
    const bestScenario = scenarios.reduce((best, current) => 
      current.results.projectedValue > best.results.projectedValue ? current : best
    );

    const worstScenario = scenarios.reduce((worst, current) => 
      current.results.projectedValue < worst.results.projectedValue ? current : worst
    );

    const analysis = {
      baseline: {
        projectedValue: baseline.results.projectedValue,
        incomeReplacement: baseline.results.incomeReplacement
      },
      bestCase: {
        scenario: bestScenario.name,
        projectedValue: bestScenario.results.projectedValue,
        improvement: Math.round(((bestScenario.results.projectedValue / baseline.results.projectedValue) - 1) * 100)
      },
      worstCase: {
        scenario: worstScenario.name,
        projectedValue: worstScenario.results.projectedValue,
        decline: Math.round(((worstScenario.results.projectedValue / baseline.results.projectedValue) - 1) * 100)
      },
      stressTestSummary: {
        passedTests: stressTests.filter(test => 
          test.results.portfolioSurvival === 'Survives' || 
          test.results.portfolioSufficiency === 'Sufficient'
        ).length,
        totalTests: stressTests.length
      }
    };

    // Generate key insights
    analysis.insights = this.generateInsights(baseline, scenarios, stressTests);

    return analysis;
  }

  /**
   * Generate key insights from simulation
   */
  static generateInsights(baseline, scenarios, stressTests) {
    const insights = [];

    // Contribution sensitivity
    const contributionScenarios = scenarios.filter(s => s.name.includes('Contribution'));
    if (contributionScenarios.length > 0) {
      const best = contributionScenarios.reduce((best, current) => 
        current.results.projectedValue > best.results.projectedValue ? current : best
      );
      insights.push(`Increasing contributions by $${best.name.match(/\$(\d+)/)?.[1]} could improve retirement value by ${Math.round(((best.results.projectedValue / baseline.results.projectedValue) - 1) * 100)}%`);
    }

    // Retirement age sensitivity
    const ageScenarios = scenarios.filter(s => s.name.includes('Retirement'));
    if (ageScenarios.length > 0) {
      const delayedRetirement = ageScenarios.find(s => s.name.includes('+'));
      if (delayedRetirement) {
        insights.push(`Delaying retirement could significantly boost retirement savings due to compound growth`);
      }
    }

    // Market risk assessment
    const marketStressTests = stressTests.filter(t => t.type === 'Market Scenario');
    const bearMarketTest = marketStressTests.find(t => t.name.includes('Bear'));
    if (bearMarketTest && bearMarketTest.results.vsBaseline < -30) {
      insights.push('Portfolio is vulnerable to prolonged bear markets - consider more conservative allocation near retirement');
    }

    // Inflation risk
    const inflationTest = stressTests.find(t => t.type === 'Inflation Risk');
    if (inflationTest && inflationTest.results.projectedValue < baseline.results.projectedValue * 0.8) {
      insights.push('High inflation poses significant risk to purchasing power - consider inflation-protected investments');
    }

    return insights;
  }

  /**
   * Calculate future value with compound interest and regular contributions
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
   * Run Monte Carlo simulation for probability analysis
   */
  static async runMonteCarloSimulation(userId, simulations = 1000) {
    try {
      // Fetch member data from database
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

      const results = [];
      const currentAge = memberData.age;
      const retirementAge = memberData.retirement_age_goal || 65;
      const yearsToRetirement = retirementAge - currentAge;

      for (let i = 0; i < simulations; i++) {
        // Generate random returns with normal distribution
        const annualReturns = [];
        for (let year = 0; year < yearsToRetirement; year++) {
          // Mean return 7%, standard deviation 12%
          const randomReturn = this.generateNormalRandom(0.07, 0.12);
          annualReturns.push(randomReturn);
        }

        // Calculate final value
        let portfolioValue = memberData.current_savings || 0;
        const annualContribution = memberData.total_annual_contribution || memberData.contribution_amount || 0;

        for (const yearReturn of annualReturns) {
          portfolioValue = portfolioValue * (1 + yearReturn) + annualContribution;
        }

        results.push(portfolioValue);
      }

      // Calculate statistics
      results.sort((a, b) => a - b);
      
      const percentiles = {
        p10: results[Math.floor(simulations * 0.1)],
        p25: results[Math.floor(simulations * 0.25)],
        p50: results[Math.floor(simulations * 0.5)],
        p75: results[Math.floor(simulations * 0.75)],
        p90: results[Math.floor(simulations * 0.9)]
      };

      const successRate = results.filter(result => 
        result >= (memberData.annual_income || 0) * 10
      ).length / simulations;

      return {
        userId,
        simulations,
        percentiles: {
          p10: Math.round(percentiles.p10),
          p25: Math.round(percentiles.p25),
          p50: Math.round(percentiles.p50),
          p75: Math.round(percentiles.p75),
          p90: Math.round(percentiles.p90)
        },
        successRate: Math.round(successRate * 100),
        mean: Math.round(results.reduce((sum, val) => sum + val, 0) / simulations),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Monte Carlo simulation error:', error);
      throw error;
    }
  }

  /**
   * Generate normally distributed random number
   */
  static generateNormalRandom(mean, stdDev) {
    // Box-Muller transformation
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  }
}

export default WhatIfSimulatorService;
