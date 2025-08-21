/**
 * Analytics Routes
 * Handles analytics and reporting endpoints
 * 
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Business intelligence and reporting endpoints for pension data analysis
 */

import express from 'express';
import { authenticateTest as authenticate, authorize } from '../middleware/auth-test.js';
import { PERMISSIONS } from '../config/roles.js';
import PensionData from '../models/PensionData.js';
import { AuditService } from '../services/AuditService.js';

const router = express.Router();

// Apply authentication to all analytics routes
router.use(authenticate);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get analytics dashboard data
 *     description: Retrieve comprehensive dashboard data including portfolio metrics, user statistics, and trends
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                     userMetrics:
 *                       type: object
 *                     portfolioMetrics:
 *                       type: object
 *                     trends:
 *                       type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/dashboard', 
  authorize([
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW_ASSIGNED, 
    PERMISSIONS.ANALYTICS_VIEW_OWN
  ]),
  async (req, res) => {
    try {
      const user = req.user;
      let dashboardData = {};

      if (user.permissions?.includes(PERMISSIONS.ANALYTICS_VIEW_ALL)) {
        // Regulator view - system-wide analytics
        const stats = await PensionData.getStatistics();
        dashboardData = {
          totalMembers: stats.totalMembers || 0,
          totalContributions: stats.totalContributions || 0,
          averageBalance: stats.averageBalance || 0,
          projectedRetirements: stats.projectedRetirements || 0,
          riskDistribution: stats.riskDistribution || {},
          performanceMetrics: stats.performanceMetrics || {},
          complianceStatus: {
            compliantMembers: stats.compliantMembers || 0,
            nonCompliantMembers: stats.nonCompliantMembers || 0
          }
        };
      } else if (user.permissions?.includes(PERMISSIONS.ANALYTICS_VIEW_ASSIGNED)) {
        // Advisor view - assigned clients analytics
        dashboardData = {
          totalClients: 0,
          totalContributions: 0,
          averageBalance: 0,
          performanceMetrics: {}
        };
      } else {
        // Member view - personal analytics
        const memberData = await PensionData.findByUserId(user.memberId);
        if (memberData) {
          dashboardData = {
            currentBalance: memberData.current_savings || 0,
            monthlyContribution: memberData.contribution_amount || 0,
            projectedRetirement: memberData.projected_pension_amount || 0,
            riskProfile: memberData.risk_tolerance || 'medium',
            performanceScore: memberData.portfolio_diversity_score || 0
          };
        }
      }

      // Log analytics access
      await AuditService.logDataAccess({
        userId: user.id,
        action: 'VIEW_ANALYTICS_DASHBOARD',
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: dashboardData,
        userRole: user.role,
        message: 'Analytics dashboard data retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch dashboard data',
          status: 500
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/analytics/reports:
 *   get:
 *     summary: Generate analytics reports
 *     description: Generate various types of reports including compliance, performance, and portfolio analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [compliance, performance, portfolio]
 *         description: Type of report to generate
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *         description: Output format for the report
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reportType:
 *                   type: string
 *                 data:
 *                   type: array
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/reports', 
  authorize([PERMISSIONS.REPORTS_GENERATE]),
  async (req, res) => {
    try {
      const user = req.user;
      const { reportType, startDate, endDate, format = 'json' } = req.query;

      let reportData = [];

      switch (reportType) {
        case 'compliance':
          reportData = await generateComplianceReport(startDate, endDate);
          break;
        case 'performance':
          reportData = await generatePerformanceReport(startDate, endDate);
          break;
        case 'member-summary':
          reportData = await generateMemberSummaryReport(startDate, endDate);
          break;
        default:
          reportData = await generateDashboardReport();
      }

      // Log report generation
      await AuditService.logDataAccess({
        userId: user.id,
        action: 'GENERATE_REPORT',
        metadata: { reportType, format },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: reportData,
        reportType: reportType || 'dashboard',
        generatedAt: new Date().toISOString(),
        message: 'Report generated successfully'
      });

    } catch (error) {
      console.error('Error generating reports:', error);
      res.status(500).json({
        error: {
          message: 'Failed to generate report',
          status: 500
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: Export analytics data
 *     description: Export various types of analytics data in different formats for external analysis and reporting
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format (CSV implementation pending)
 *       - in: query
 *         name: dataType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [dashboard, members, statistics]
 *           default: dashboard
 *         description: Type of data to export
 *     responses:
 *       200:
 *         description: Analytics data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       description: Dashboard export data
 *                       properties:
 *                         summary:
 *                           $ref: '#/components/schemas/PensionStatistics'
 *                         exportedAt:
 *                           type: string
 *                           format: date-time
 *                         exportedBy:
 *                           type: string
 *                     - type: array
 *                       description: Members data export
 *                       items:
 *                         $ref: '#/components/schemas/PensionData'
 *                     - $ref: '#/components/schemas/PensionStatistics'
 *                 format:
 *                   type: string
 *                   example: "json"
 *                 dataType:
 *                   type: string
 *                   example: "dashboard"
 *                 message:
 *                   type: string
 *                   example: "Analytics data exported successfully"
 *           text/csv:
 *             schema:
 *               type: string
 *               description: CSV formatted data (when format=csv)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/export', 
  authorize([PERMISSIONS.ANALYTICS_EXPORT]),
  async (req, res) => {
    try {
      const user = req.user;
      const { format = 'json', dataType = 'dashboard' } = req.query;

      let exportData;

      switch (dataType) {
        case 'members':
          exportData = await PensionData.findAll({ limit: 1000 });
          break;
        case 'statistics':
          exportData = await PensionData.getStatistics();
          break;
        default:
          const stats = await PensionData.getStatistics();
          exportData = {
            summary: stats,
            exportedAt: new Date().toISOString(),
            exportedBy: user.id
          };
      }

      // Log export activity
      await AuditService.logDataAccess({
        userId: user.id,
        action: 'EXPORT_ANALYTICS_DATA',
        metadata: { format, dataType },
        timestamp: new Date()
      });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_${dataType}_${Date.now()}.csv`);
        res.json({
          success: false,
          message: 'CSV export not yet implemented'
        });
      } else {
        res.json({
          success: true,
          data: exportData,
          format,
          dataType,
          message: 'Analytics data exported successfully'
        });
      }

    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({
        error: {
          message: 'Failed to export analytics data',
          status: 500
        }
      });
    }
  }
);

// Helper functions for report generation
async function generateComplianceReport(startDate, endDate) {
  try {
    const stats = await PensionData.getStatistics();
    return {
      reportType: 'compliance',
      period: { startDate, endDate },
      totalMembers: stats.totalMembers || 0,
      compliantMembers: stats.compliantMembers || 0,
      nonCompliantMembers: stats.nonCompliantMembers || 0,
      complianceRate: stats.totalMembers > 0 ? 
        ((stats.compliantMembers || 0) / stats.totalMembers * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error generating compliance report:', error);
    throw error;
  }
}

async function generatePerformanceReport(startDate, endDate) {
  try {
    const stats = await PensionData.getStatistics();
    return {
      reportType: 'performance',
      period: { startDate, endDate },
      averageReturn: stats.averageReturn || 0,
      totalContributions: stats.totalContributions || 0,
      performanceMetrics: stats.performanceMetrics || {}
    };
  } catch (error) {
    console.error('Error generating performance report:', error);
    throw error;
  }
}

async function generateMemberSummaryReport(startDate, endDate) {
  try {
    const members = await PensionData.findAll({ limit: 100 });
    return {
      reportType: 'member-summary',
      period: { startDate, endDate },
      totalMembers: members.length,
      members: members.map(m => ({
        id: m.id,
        userId: m.user_id,
        currentSavings: m.current_savings,
        riskTolerance: m.risk_tolerance,
        projectedAmount: m.projected_pension_amount
      }))
    };
  } catch (error) {
    console.error('Error generating member summary report:', error);
    throw error;
  }
}

async function generateDashboardReport() {
  try {
    const stats = await PensionData.getStatistics();
    return {
      reportType: 'dashboard',
      summary: stats,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating dashboard report:', error);
    throw error;
  }
}

export default router;