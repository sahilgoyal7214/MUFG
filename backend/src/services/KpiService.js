/**
 * KPI Service for Pension Management
 * Enhanced with your original financial calculation functions
 */

// Your original calculateRetirementAge function
function calculateRetirementAge(currentAge, targetCorpus, annualInvestment, annualReturn, currentCorpus = 0) {
  let years = 0;
  let corpus = currentCorpus;
  
  while (corpus < targetCorpus && years < 100) {
    years += 1;
    corpus = corpus * (1 + annualReturn) + annualInvestment;
  }
  
  return currentAge + years;
}

// Your original predictTotalCorpus function  
function predictTotalCorpus(currentSavings, annualContribution, expectedReturn, currentAge, retirementAge) {
  const years = retirementAge - currentAge;
  const r = expectedReturn;
  
  if (r === 0) {
    return currentSavings + (annualContribution * years);
  }
  
  const fvLumpsum = currentSavings * Math.pow(1 + r, years);
  const fvAnnuity = annualContribution * ((Math.pow(1 + r, years) - 1) / r);
  
  return fvLumpsum + fvAnnuity;
}

// Additional KPI calculation
function calculateRetirementReadiness(memberData) {
  const {
    currentAge,
    retirementAge = 65,
    currentBalance = 0,
    monthlyContribution = 0,
    expectedReturnRate = 0.08,
    currentSalary = 0
  } = memberData;

  const projectedCorpus = predictTotalCorpus(
    currentBalance,
    monthlyContribution * 12,
    expectedReturnRate,
    currentAge,
    retirementAge
  );

  const targetCorpus = currentSalary * 10; // 10x salary rule
  const readinessScore = Math.min((projectedCorpus / targetCorpus) * 100, 100);

  return {
    readinessScore: Math.round(readinessScore * 10) / 10,
    projectedCorpus: Math.round(projectedCorpus),
    targetCorpus: Math.round(targetCorpus),
    yearsToRetirement: retirementAge - currentAge
  };
}

// Export all functions as ES6 module
export {
  calculateRetirementAge,
  predictTotalCorpus,
  calculateRetirementReadiness
};

// Default export for convenience
export default {
  calculateRetirementAge,
  predictTotalCorpus,
  calculateRetirementReadiness
};
