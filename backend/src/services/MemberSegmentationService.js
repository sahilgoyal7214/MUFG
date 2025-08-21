import db from '../config/database.js';
import PensionData from '../models/PensionData.js';

/**
 * Member Segmentation Service
 * Provides member clustering and segmentation for tailored advice
 */
class MemberSegmentationService {

  /**
   * Perform KMeans clustering on member data
   */
  static async performMemberSegmentation(filters = {}, clusterCount = 4) {
    try {
      // Build filter conditions
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Age filter
      if (filters.ageMin && filters.ageMax) {
        conditions.push(`age BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        params.push(filters.ageMin, filters.ageMax);
        paramIndex += 2;
      }
      

      // Income filter
      if (filters.incomeMin && filters.incomeMax) {
        conditions.push(`annual_income BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        params.push(filters.incomeMin, filters.incomeMax);
        paramIndex += 2;
      }

      // Risk tolerance filter
      if (filters.riskTolerance && filters.riskTolerance.length > 0) {
        const placeholders = filters.riskTolerance.map(() => `$${paramIndex++}`).join(',');
        conditions.push(`risk_tolerance IN (${placeholders})`);
        params.push(...filters.riskTolerance);
      }

      // Build query
      let query = `
        SELECT 
          user_id,
          age,
          annual_income,
          current_savings,
          risk_tolerance,
          CASE 
            WHEN risk_tolerance = 'Low' THEN 1
            WHEN risk_tolerance = 'Medium' THEN 2
            WHEN risk_tolerance = 'High' THEN 3
            ELSE 2
          END as risk_tolerance_num
        FROM pension_data
        WHERE age IS NOT NULL 
          AND annual_income IS NOT NULL 
          AND current_savings IS NOT NULL 
          AND risk_tolerance IS NOT NULL
      `;

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      // Execute query
      const result = await db.query(query, params);
      const members = result.rows;

      if (members.length < clusterCount) {
        throw new Error(`Not enough members (${members.length}) for ${clusterCount} clusters`);
      }

      // Prepare features for clustering
      const features = members.map(member => [
        member.age,
        member.annual_income,
        member.current_savings,
        member.risk_tolerance_num
      ]);

      // Standardize features
      const standardizedFeatures = this.standardizeFeatures(features);

      // Perform simple K-means clustering
      const clusters = this.performKMeans(standardizedFeatures, clusterCount);

      // Assign cluster labels to members
      const clusteredMembers = members.map((member, index) => ({
        ...member,
        cluster: clusters[index]
      }));

      // Generate cluster profiles
      const clusterProfiles = this.generateClusterProfiles(clusteredMembers, clusterCount);

      // Generate cluster labels
      const clusterLabels = this.generateClusterLabels(clusterProfiles, members);

      return {
        members: clusteredMembers,
        clusterProfiles,
        clusterLabels,
        totalMembers: members.length,
        clusterCount,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Member segmentation error:', error);
      throw error;
    }
  }

  /**
   * Standardize features using z-score normalization
   */
  static standardizeFeatures(features) {
    const numFeatures = features[0].length;
    const means = new Array(numFeatures).fill(0);
    const stds = new Array(numFeatures).fill(0);

    // Calculate means
    for (let j = 0; j < numFeatures; j++) {
      means[j] = features.reduce((sum, row) => sum + row[j], 0) / features.length;
    }

    // Calculate standard deviations
    for (let j = 0; j < numFeatures; j++) {
      const variance = features.reduce((sum, row) => sum + Math.pow(row[j] - means[j], 2), 0) / features.length;
      stds[j] = Math.sqrt(variance) || 1; // Avoid division by zero
    }

    // Standardize
    return features.map(row => 
      row.map((value, j) => (value - means[j]) / stds[j])
    );
  }

  /**
   * Simple K-means clustering implementation
   */
  static performKMeans(features, k, maxIterations = 100) {
    const numFeatures = features[0].length;
    const numPoints = features.length;

    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * numPoints);
      centroids.push([...features[randomIndex]]);
    }

    let labels = new Array(numPoints);

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to closest centroid
      const newLabels = features.map(point => {
        let minDistance = Infinity;
        let closestCentroid = 0;

        for (let c = 0; c < k; c++) {
          const distance = this.euclideanDistance(point, centroids[c]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = c;
          }
        }

        return closestCentroid;
      });

      // Check for convergence
      let converged = true;
      for (let i = 0; i < numPoints; i++) {
        if (labels[i] !== newLabels[i]) {
          converged = false;
          break;
        }
      }

      labels = newLabels;

      if (converged) break;

      // Update centroids
      for (let c = 0; c < k; c++) {
        const clusterPoints = features.filter((_, index) => labels[index] === c);
        if (clusterPoints.length > 0) {
          for (let j = 0; j < numFeatures; j++) {
            centroids[c][j] = clusterPoints.reduce((sum, point) => sum + point[j], 0) / clusterPoints.length;
          }
        }
      }
    }

    return labels;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  static euclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, val, index) => sum + Math.pow(val - point2[index], 2), 0)
    );
  }

  /**
   * Generate cluster profiles with statistics
   */
  static generateClusterProfiles(clusteredMembers, clusterCount) {
    const profiles = {};

    for (let c = 0; c < clusterCount; c++) {
      const clusterMembers = clusteredMembers.filter(member => member.cluster === c);
      
      if (clusterMembers.length === 0) {
        profiles[c] = {
          count: 0,
          age: { mean: 0, median: 0, min: 0, max: 0 },
          annual_income: { mean: 0, median: 0, min: 0, max: 0 },
          current_savings: { mean: 0, median: 0, min: 0, max: 0 },
          risk_tolerance_num: { mean: 0, median: 0, min: 0, max: 0 }
        };
        continue;
      }

      const calculateStats = (values) => {
        const sorted = [...values].sort((a, b) => a - b);
        return {
          mean: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length * 100) / 100,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...values),
          max: Math.max(...values)
        };
      };

      profiles[c] = {
        count: clusterMembers.length,
        age: calculateStats(clusterMembers.map(m => m.age)),
        annual_income: calculateStats(clusterMembers.map(m => m.annual_income)),
        current_savings: calculateStats(clusterMembers.map(m => m.current_savings)),
        risk_tolerance_num: calculateStats(clusterMembers.map(m => m.risk_tolerance_num))
      };
    }

    return profiles;
  }

  /**
   * Generate descriptive labels for clusters
   */
  static generateClusterLabels(clusterProfiles, allMembers) {
    const medianIncome = this.calculateMedian(allMembers.map(m => m.annual_income));
    const medianSavings = this.calculateMedian(allMembers.map(m => m.current_savings));

    const labels = {};

    Object.keys(clusterProfiles).forEach(clusterId => {
      const profile = clusterProfiles[clusterId];
      
      if (profile.count === 0) {
        labels[clusterId] = 'Empty Cluster';
        return;
      }

      const avgIncome = profile.annual_income.mean;
      const avgSavings = profile.current_savings.mean;
      const avgRisk = profile.risk_tolerance_num.mean;

      // Generate label based on characteristics
      if (avgSavings >= medianSavings && avgIncome >= medianIncome) {
        labels[clusterId] = 'High Capacity Savers';
      } else if (avgSavings < medianSavings && avgIncome >= medianIncome) {
        labels[clusterId] = 'High Income, Low Savings';
      } else if (avgRisk >= 2.5 && avgSavings < medianSavings) {
        labels[clusterId] = 'Aggressive & Underfunded';
      } else if (avgRisk <= 1.5 && avgSavings >= medianSavings) {
        labels[clusterId] = 'Conservative & Funded';
      } else {
        labels[clusterId] = 'Balanced';
      }
    });

    return labels;
  }

  /**
   * Calculate median of an array
   */
  static calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
  }

  /**
   * Generate advisor recommendations for each cluster
   */
  static generateAdvisorRecommendations(clusterProfiles, clusterLabels) {
    const recommendations = {};

    Object.keys(clusterProfiles).forEach(clusterId => {
      const profile = clusterProfiles[clusterId];
      const label = clusterLabels[clusterId];

      if (profile.count === 0) {
        recommendations[clusterId] = {
          description: 'No members in this cluster',
          actions: [],
          risks: []
        };
        return;
      }

      let description = '';
      let actions = [];
      let risks = [];

      switch (label) {
        case 'High Capacity Savers':
          description = 'High earners with substantial savings - ideal candidates for advanced planning';
          actions = [
            'Offer premium investment products and private banking services',
            'Discuss tax-efficient strategies and estate planning',
            'Present alternative investment opportunities'
          ];
          risks = ['Market volatility impact on large portfolios'];
          break;

        case 'High Income, Low Savings':
          description = 'High earners who need help with savings discipline and budgeting';
          actions = [
            'Implement automatic contribution increases',
            'Provide budgeting and expense management tools',
            'Set up aggressive catch-up contribution schedules'
          ];
          risks = ['Lifestyle inflation', 'Insufficient retirement savings'];
          break;

        case 'Aggressive & Underfunded':
          description = 'High risk tolerance but low savings - need balance between growth and security';
          actions = [
            'Educate on risk management and diversification',
            'Increase contribution rates before taking more risk',
            'Consider target-date funds for automatic rebalancing'
          ];
          risks = ['Excessive risk taking', 'Inadequate emergency funds'];
          break;

        case 'Conservative & Funded':
          description = 'Well-funded conservatives who may be too risk-averse for long-term growth';
          actions = [
            'Gradually introduce growth-oriented investments',
            'Explain inflation risk of overly conservative allocations',
            'Consider I-bonds or Treasury Inflation-Protected Securities'
          ];
          risks = ['Inflation erosion', 'Insufficient growth for retirement goals'];
          break;

        default:
          description = 'Balanced members with moderate risk and savings profiles';
          actions = [
            'Regular portfolio reviews and rebalancing',
            'Gradual contribution increases with salary growth',
            'Education on lifecycle investing strategies'
          ];
          risks = ['Complacency', 'Not adjusting strategy with life changes'];
      }

      recommendations[clusterId] = {
        description,
        actions,
        risks
      };
    });

    return recommendations;
  }

  /**
   * Get members in a specific cluster
   */
  static async getClusterMembers(clusterId, segmentationData) {
    const clusterMembers = segmentationData.members
      .filter(member => member.cluster === parseInt(clusterId))
      .sort((a, b) => b.current_savings - a.current_savings);

    return clusterMembers.map(member => ({
      userId: member.user_id,
      age: member.age,
      annualIncome: member.annual_income,
      currentSavings: member.current_savings,
      riskTolerance: member.risk_tolerance
    }));
  }
}

export default MemberSegmentationService;
