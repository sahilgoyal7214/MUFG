/**
 * KPI (Key Performance Indicator) Routes
 * Financial calculations and retirement planning analytics
 * 
 * @swagger
 * tags:
 *   - name: KPI
 *     description: Financial calculations and retirement planning KPIs
 */

import express from 'express';
import { authenticateTest as authenticate, authorize } from '../middleware/auth-test.js';
import { PERMISSIONS } from '../config/roles.js';
import KpiService from '../services/KpiService.js';

const router = express.Router();

// Apply authentication to all KPI routes
router.use(authenticate);

/**
 * @swagger
 * /api/kpi/retirement-age:
 *   post:
 *     summary: Calculate projected retirement age
 *     description: Calculates when a member can retire based on target corpus and contributions
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentAge, targetCorpus, annualInvestment, annualReturn]
 *             properties:
 *               currentAge:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 100
 *                 description: Current age of the member
 *                 example: 30
 *               targetCorpus:
 *                 type: number
 *                 minimum: 1
 *                 description: Target retirement corpus needed
 *                 example: 1000000
 *               annualInvestment:
 *                 type: number
 *                 minimum: 0
 *                 description: Annual investment/contribution amount
 *                 example: 12000
 *               annualReturn:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Expected annual return rate (as decimal)
 *                 example: 0.08
 *               currentCorpus:
 *                 type: number
 *                 minimum: 0
 *                 description: Current accumulated corpus
 *                 example: 50000
 *     responses:
 *       200:
 *         description: Retirement age calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectedRetirementAge:
 *                       type: integer
 *                       description: Age at which retirement target will be reached
 *                       example: 58
 *                     yearsToRetirement:
 *                       type: integer
 *                       description: Number of years until retirement
 *                       example: 28
 *                     currentAge:
 *                       type: integer
 *                       example: 30
 *                     targetCorpus:
 *                       type: number
 *                       example: 1000000
 *       400:
 *         description: Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/retirement-age',
  authorize([PERMISSIONS.MEMBER_DATA_READ_ALL]),
  async (req, res) => {
    try {
      const { currentAge, targetCorpus, annualInvestment, annualReturn, currentCorpus = 0 } = req.body;

      // Validate required fields
      if (!currentAge || !targetCorpus || !annualInvestment || annualReturn === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: currentAge, targetCorpus, annualInvestment, annualReturn'
        });
      }

      const projectedRetirementAge = KpiService.calculateRetirementAge(
        currentAge,
        targetCorpus,
        annualInvestment,
        annualReturn,
        currentCorpus
      );

      res.json({
        success: true,
        data: {
          projectedRetirementAge,
          yearsToRetirement: projectedRetirementAge - currentAge,
          currentAge,
          targetCorpus,
          annualInvestment,
          currentCorpus
        }
      });

    } catch (error) {
      console.error('Error calculating retirement age:', error);
      res.status(400).json({
        error: error.message || 'Error calculating retirement age'
      });
    }
  }
);

/**
 * @swagger
 * /api/kpi/total-corpus:
 *   post:
 *     summary: Predict total corpus at retirement
 *     description: Calculates projected total pension corpus at a future retirement age
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentSavings, annualContribution, expectedReturn, currentAge, retirementAge]
 *             properties:
 *               currentSavings:
 *                 type: number
 *                 minimum: 0
 *                 description: Current accumulated savings
 *                 example: 50000
 *               annualContribution:
 *                 type: number
 *                 minimum: 0
 *                 description: Annual contribution amount
 *                 example: 12000
 *               expectedReturn:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Expected annual return rate (as decimal)
 *                 example: 0.08
 *               currentAge:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 100
 *                 description: Current age
 *                 example: 30
 *               retirementAge:
 *                 type: integer
 *                 minimum: 50
 *                 maximum: 100
 *                 description: Target retirement age
 *                 example: 65
 *     responses:
 *       200:
 *         description: Total corpus calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectedCorpus:
 *                       type: number
 *                       description: Projected total corpus at retirement
 *                       example: 1234567
 *                     yearsToRetirement:
 *                       type: integer
 *                       example: 35
 *                     currentSavings:
 *                       type: number
 *                       example: 50000
 *                     totalContributions:
 *                       type: number
 *                       description: Total contributions over the period
 *                       example: 420000
 *                     totalGrowth:
 *                       type: number
 *                       description: Total growth from investments
 *                       example: 764567
 */
router.post('/total-corpus',
  authorize(PERMISSIONS.VIEW_MEMBER_DATA),
  async (req, res) => {
    try {
      const { currentSavings, annualContribution, expectedReturn, currentAge, retirementAge } = req.body;

      // Validate required fields
      if (currentSavings === undefined || annualContribution === undefined || 
          expectedReturn === undefined || !currentAge || !retirementAge) {
        return res.status(400).json({
          error: 'Missing required fields: currentSavings, annualContribution, expectedReturn, currentAge, retirementAge'
        });
      }

      const projectedCorpus = KpiService.predictTotalCorpus(
        currentSavings,
        annualContribution,
        expectedReturn,
        currentAge,
        retirementAge
      );

      const yearsToRetirement = retirementAge - currentAge;
      const totalContributions = annualContribution * yearsToRetirement;
      const totalGrowth = projectedCorpus - currentSavings - totalContributions;

      res.json({
        success: true,
        data: {
          projectedCorpus: Math.round(projectedCorpus),
          yearsToRetirement,
          currentSavings,
          totalContributions,
          totalGrowth: Math.round(totalGrowth),
          annualContribution,
          expectedReturn
        }
      });

    } catch (error) {
      console.error('Error calculating total corpus:', error);
      res.status(400).json({
        error: error.message || 'Error calculating total corpus'
      });
    }
  }
);

/**
 * @swagger
 * /api/kpi/retirement-readiness:
 *   post:
 *     summary: Calculate comprehensive retirement readiness
 *     description: Analyzes retirement preparedness with score, projections, and recommendations
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentAge, currentSalary, monthlyContribution]
 *             properties:
 *               currentAge:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 100
 *                 example: 30
 *               retirementAge:
 *                 type: integer
 *                 minimum: 50
 *                 maximum: 100
 *                 example: 65
 *               currentBalance:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               monthlyContribution:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000
 *               expectedReturnRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.08
 *               targetRetirementIncome:
 *                 type: number
 *                 minimum: 0
 *                 example: 40000
 *               currentSalary:
 *                 type: number
 *                 minimum: 0
 *                 example: 60000
 *     responses:
 *       200:
 *         description: Retirement readiness analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KpiCalculation'
 */
router.post('/retirement-readiness',
  authorize(PERMISSIONS.VIEW_MEMBER_DATA),
  async (req, res) => {
    try {
      const memberData = req.body;

      // Validate required fields
      if (!memberData.currentAge || !memberData.currentSalary || 
          memberData.monthlyContribution === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: currentAge, currentSalary, monthlyContribution'
        });
      }

      const readinessAnalysis = KpiService.calculateRetirementReadiness(memberData);

      res.json({
        success: true,
        data: readinessAnalysis
      });

    } catch (error) {
      console.error('Error calculating retirement readiness:', error);
      res.status(400).json({
        error: error.message || 'Error calculating retirement readiness'
      });
    }
  }
);

export default router;
