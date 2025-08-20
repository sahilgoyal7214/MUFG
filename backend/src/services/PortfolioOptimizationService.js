import db from '../config/database.js';
import PensionData from '../models/PensionData.js';

/**
 * Portfolio Optimization Service
 * Provides portfolio allocation recommendations based on member profile
 */
class PortfolioOptimizationService {
  
  /**
   * Calculate recommended portfolio allocation based on member profile
   */
  static calculateRecommendedAllocation(memberProfile) {
    const {
      age = 35,
      riskTolerance = 'Medium',
      pensionType = 'Defined Contribution',
      withdrawalStrategy = 'Fixed',
      retirementAgeGoal = 65
    } = memberProfile;

    // Base equity allocation by risk tolerance
    const baseEquityMap = {
      'Low': 0.40,
      'Medium': 0.60,
      'High': 0.75
    };
    
    let equity = baseEquityMap[riskTolerance] || 0.60;

    // Age-based glide path: reduce equity as age increases
    const glideAdjustment = Math.max(0, (age - 30) * 0.005);
    equity = Math.max(0.25, Math.min(0.90, equity - glideAdjustment));

    // Withdrawal strategy adjustments
    if (['Flexible', 'Dynamic'].includes(withdrawalStrategy)) {
      equity += 0.03;
    } else if (['Fixed', 'Bucket'].includes(withdrawalStrategy)) {
      equity -= 0.03;
    }

    // Pension type adjustments
    if (pensionType.includes('Defined Benefit')) {
      equity += 0.03; // DB provides bond-like floor
    }

    // Near retirement dampening
    const yearsToRetirement = Math.max(0, retirementAgeGoal - age);
    if (yearsToRetirement <= 7) {
      equity -= 0.05;
    }

    // Final constraints
    equity = Math.max(0.15, Math.min(0.90, equity));
    
    // Calculate bonds and cash allocation
    const remainder = 1.0 - equity;
    let cash = 0.10;
    
    // Increase cash for older members or low risk tolerance
    if (age >= 55) cash += 0.05;
    if (riskTolerance === 'Low') cash += 0.05;
    
    cash = Math.max(0.05, Math.min(0.25, cash));
    const bonds = Math.max(0.0, remainder - cash);

    // Normalize to 100%
    const total = equity + bonds + cash;
    const normalizedEquity = equity / total;
    const normalizedBonds = bonds / total;
    const normalizedCash = cash / total;

    return {
      stocks: Math.round(normalizedEquity * 100 * 10) / 10,
      bonds: Math.round(normalizedBonds * 100 * 10) / 10,
      cash: Math.round(normalizedCash * 100 * 10) / 10
    };
  }

  /**
   * Estimate current allocation from investment type
   */
  static estimateCurrentAllocation(investmentType) {
    const type = (investmentType || 'Mixed').toLowerCase();
    
    if (type.includes('bond')) {
      return { stocks: 20.0, bonds: 70.0, cash: 10.0 };
    }
    if (type.includes('equity') || type.includes('stock')) {
      return { stocks: 70.0, bonds: 20.0, cash: 10.0 };
    }
    if (type.includes('balanced') || type.includes('mixed') || type.includes('fund')) {
      return { stocks: 50.0, bonds: 40.0, cash: 10.0 };
    }
    
    return { stocks: 50.0, bonds: 40.0, cash: 10.0 };
  }

  /**
   * Calculate rebalancing deltas
   */
  static calculateRebalanceDeltas(currentAllocation, recommendedAllocation) {
    return {
      stocks: Math.round((recommendedAllocation.stocks - currentAllocation.stocks) * 10) / 10,
      bonds: Math.round((recommendedAllocation.bonds - currentAllocation.bonds) * 10) / 10,
      cash: Math.round((recommendedAllocation.cash - currentAllocation.cash) * 10) / 10
    };
  }

  /**
   * Optimize portfolio allocation for a member
   */
  static async optimizePortfolio(userId) {
    try {
      // Fetch member data from database
      const query = `
        SELECT user_id, age, annual_income, current_savings, risk_tolerance, 
               retirement_age_goal, investment_type, portfolio_diversity_score, 
               contribution_amount, employer_contribution, pension_type,
               years_contributed, annual_return_rate, volatility
        FROM pension_data 
        WHERE user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Member data not found');
      }
      
      const memberData = result.rows[0];

      // Prepare member profile for optimization
      const memberProfile = {
        age: memberData.age,
        riskTolerance: memberData.risk_tolerance,
        pensionType: memberData.pension_type || 'Defined Contribution',
        withdrawalStrategy: 'Fixed', // Default strategy
        retirementAgeGoal: memberData.retirement_age_goal || 65
      };

      // Estimate current allocation from investment type
      const currentAllocation = this.estimateCurrentAllocation(memberData.investment_type);

      // Calculate recommended allocation
      const recommendedAllocation = this.calculateRecommendedAllocation(memberProfile);

      // Calculate allocation deltas
      const allocationDeltas = this.calculateRebalanceDeltas(currentAllocation, recommendedAllocation);

      // Generate optimization rationale
      const rationale = this.generateOptimizationRationale(
        memberProfile, 
        currentAllocation, 
        recommendedAllocation, 
        allocationDeltas
      );

      return {
        userId,
        memberProfile,
        currentAllocation,
        recommendedAllocation,
        allocationDeltas,
        rationale,
        optimizationDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Portfolio optimization error:', error);
      throw error;
    }
  }

  /**
   * Generate optimization rationale
   */
  static generateOptimizationRationale(profile, current, recommended, deltas) {
    const { age, riskTolerance, pensionType } = profile;
    const yearsToRetirement = Math.max(0, profile.retirementAgeGoal - age);
    
    let rationale = `Based on your ${riskTolerance.toLowerCase()} risk tolerance and ${age} years of age, `;
    
    // Growth vs safety balance
    if (recommended.stocks > current.stocks) {
      rationale += `we recommend increasing equity allocation by ${deltas.stocks}% to capture more growth potential `;
      rationale += `while you have ${yearsToRetirement} years until retirement. `;
    } else if (recommended.stocks < current.stocks) {
      rationale += `we suggest reducing equity exposure by ${Math.abs(deltas.stocks)}% to preserve capital `;
      rationale += `as you approach retirement in ${yearsToRetirement} years. `;
    }

    // Risk assessment
    if (riskTolerance === 'Low' && current.equity > 60) {
      rationale += `Your current high equity allocation (${current.equity}%) may be too aggressive for your conservative risk profile. `;
    } else if (riskTolerance === 'High' && current.equity < 50) {
      rationale += `Your current allocation may be too conservative given your high risk tolerance and time horizon. `;
    }

    // Next steps
    if (Math.abs(deltas.equity) > 5) {
      rationale += `Consider rebalancing gradually over 3-6 months to minimize market timing risk.`;
    } else {
      rationale += `Your current allocation is well-aligned with your profile. Review annually or after major life changes.`;
    }

    return rationale;
  }

  /**
   * Generate rebalancing recommendations
   */
  static async generateRebalancingRecommendations(userId) {
    try {
      // Fetch member data from database
      const query = `
        SELECT user_id, age, annual_income, current_savings, risk_tolerance, 
               retirement_age_goal, investment_type, portfolio_diversity_score, 
               contribution_amount, employer_contribution, pension_type,
               years_contributed, annual_return_rate, volatility
        FROM pension_data 
        WHERE user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      if (result.rows.length === 0) {
        throw new Error('Member data not found');
      }
      
      const memberData = result.rows[0];

      // Get portfolio optimization first
      const optimization = await this.optimizePortfolio(userId);
      
      const driftTolerance = 5; // 5% drift tolerance
      const needsRebalancing = Math.abs(optimization.allocationDeltas.stocks) > driftTolerance;

      const recommendations = {
        userId,
        needsRebalancing,
        driftTolerance,
        currentAllocation: optimization.currentAllocation,
        targetAllocation: optimization.recommendedAllocation,
        rebalancingActions: []
      };

      if (needsRebalancing) {
        // Generate specific rebalancing actions
        if (optimization.allocationDeltas.stocks > driftTolerance) {
          recommendations.rebalancingActions.push({
            action: 'INCREASE_EQUITY',
            description: `Increase equity allocation by ${Math.round(optimization.allocationDeltas.stocks)}%`,
            priority: 'HIGH',
            estimatedTrades: this.generateTradeRecommendations(memberData.current_savings, optimization)
          });
        } else if (optimization.allocationDeltas.stocks < -driftTolerance) {
          recommendations.rebalancingActions.push({
            action: 'DECREASE_EQUITY',
            description: `Decrease equity allocation by ${Math.round(Math.abs(optimization.allocationDeltas.stocks))}%`,
            priority: 'HIGH',
            estimatedTrades: this.generateTradeRecommendations(memberData.current_savings, optimization)
          });
        }
      }

      return recommendations;

    } catch (error) {
      console.error('Rebalancing recommendations error:', error);
      throw error;
    }
  }

  /**
   * Generate specific trade recommendations
   */
  static generateTradeRecommendations(portfolioValue, optimization) {
    const trades = [];
    const totalValue = portfolioValue || 100000; // Default if not available

    const equityDelta = optimization.allocationDeltas.equity / 100;
    const bondsDelta = optimization.allocationDeltas.bonds / 100;

    if (Math.abs(equityDelta) > 0.01) { // More than 1% change
      trades.push({
        assetClass: 'Equity',
        action: equityDelta > 0 ? 'BUY' : 'SELL',
        amount: Math.round(Math.abs(equityDelta * totalValue)),
        percentage: Math.round(Math.abs(optimization.allocationDeltas.equity))
      });
    }

    if (Math.abs(bondsDelta) > 0.01) { // More than 1% change
      trades.push({
        assetClass: 'Bonds',
        action: bondsDelta > 0 ? 'BUY' : 'SELL',
        amount: Math.round(Math.abs(bondsDelta * totalValue)),
        percentage: Math.round(Math.abs(optimization.allocationDeltas.bonds))
      });
    }

    return trades;
  }

  /**
   * Get bulk portfolio optimizations
   */
  static async getBulkOptimizations(userIds = null, filters = {}) {
    try {
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Build base query
      let query = `
        SELECT user_id, age, annual_income, current_savings, risk_tolerance, 
               retirement_age_goal, investment_type, portfolio_diversity_score, 
               contribution_amount, employer_contribution, pension_type,
               years_contributed, annual_return_rate, volatility
        FROM pension_data
        WHERE user_id IS NOT NULL
      `;

      // Add user ID filter
      if (userIds && userIds.length > 0) {
        const placeholders = userIds.map(() => `$${paramIndex++}`).join(',');
        conditions.push(`user_id IN (${placeholders})`);
        params.push(...userIds);
      }

      // Add filters
      if (filters.riskTolerance && filters.riskTolerance.length > 0) {
        const placeholders = filters.riskTolerance.map(() => `$${paramIndex++}`).join(',');
        conditions.push(`risk_tolerance IN (${placeholders})`);
        params.push(...filters.riskTolerance);
      }

      if (filters.ageMin && filters.ageMax) {
        conditions.push(`age BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        params.push(filters.ageMin, filters.ageMax);
        paramIndex += 2;
      }

      // Apply conditions
      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      const result = await db.query(query, params);
      const members = result.rows;

      const optimizations = [];
      for (const member of members) {
        try {
          const optimization = await this.optimizePortfolio(member.user_id);
          optimizations.push(optimization);
        } catch (error) {
          console.error(`Error optimizing portfolio for user ${member.user_id}:`, error);
        }
      }

      return {
        totalMembers: optimizations.length,
        optimizations,
        summary: this.generateBulkSummary(optimizations),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Bulk optimizations error:', error);
      throw error;
    }
  }

  /**
   * Generate summary for bulk optimizations
   */
  static generateBulkSummary(optimizations) {
    const total = optimizations.length;
    
    const needRebalancing = optimizations.filter(opt => 
      Math.abs(opt.allocationDeltas.equity) > 5
    ).length;

    const avgEquityDelta = optimizations.reduce((sum, opt) => 
      sum + Math.abs(opt.allocationDeltas.equity), 0) / total;

    const riskDistribution = optimizations.reduce((dist, opt) => {
      const risk = opt.memberProfile.riskTolerance;
      dist[risk] = (dist[risk] || 0) + 1;
      return dist;
    }, {});

    return {
      totalMembers: total,
      needRebalancing,
      needRebalancingPercentage: Math.round((needRebalancing / total) * 100),
      averageEquityDelta: Math.round(avgEquityDelta * 10) / 10,
      riskDistribution
    };
  }
}

export default PortfolioOptimizationService;
