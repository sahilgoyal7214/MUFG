/**
 * Member Data Controller
 * Handles member pension data operations with role-based access control
 */

import PensionData from '../models/PensionData.js';
import { hasPermission } from '../config/roles.js';
import { AuditService } from '../services/AuditService.js';

export class MemberDataController {
  /**
   * Get member data by ID
   */
  static async getMemberData(req, res) {
    try {
      const { memberId } = req.params;
      const user = req.user;

      // Check access permissions
      if (user.memberId !== memberId && !hasPermission(user.role, 'member_data:read:all')) {
        return res.status(403).json({
          error: {
            message: 'Access denied: Can only access your own data',
            status: 403
          }
        });
      }

      const memberData = await PensionData.findByUserId(memberId);
      
      if (!memberData) {
        return res.status(404).json({
          error: {
            message: 'Member data not found',
            status: 404
          }
        });
      }

      // Log data access for audit
      await AuditService.logDataAccess({
        userId: user.id,
        action: 'VIEW_MEMBER_DATA',
        targetMemberId: memberId,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: memberData.toJSON()
      });

    } catch (error) {
      console.error('Error fetching member data:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch member data',
          status: 500
        }
      });
    }
  }

  /**
   * Update member data
   */
  static async updateMemberData(req, res) {
    try {
      const { memberId } = req.params;
      const updateData = req.body;
      const user = req.user;

      // Check update permissions
      if (!hasPermission(user.role, 'member_data:update')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to update member data',
            status: 403
          }
        });
      }

      // Find existing data
      const existingData = await PensionData.findByUserId(memberId);
      
      if (!existingData) {
        return res.status(404).json({
          error: {
            message: 'Member data not found',
            status: 404
          }
        });
      }

      // Update the data
      Object.assign(existingData, updateData);
      const updatedData = await existingData.save();
      
      // Log data modification for audit
      await AuditService.logDataAccess({
        userId: user.id,
        action: 'UPDATE_MEMBER_DATA',
        targetMemberId: memberId,
        changes: updateData,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: updatedData.toJSON(),
        message: 'Member data updated successfully'
      });

    } catch (error) {
      console.error('Error updating member data:', error);
      res.status(500).json({
        error: {
          message: 'Failed to update member data',
          status: 500
        }
      });
    }
  }

  /**
   * Get contribution history
   */
  static async getContributionHistory(req, res) {
    try {
      const { memberId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;
      const user = req.user;

      // Check access permissions
      if (user.memberId !== memberId && !hasPermission(user.role, 'member_data:read:all')) {
        return res.status(403).json({
          error: {
            message: 'Access denied',
            status: 403
          }
        });
      }

      const contributions = await MemberData.getContributionHistory(
        memberId, 
        startDate, 
        endDate, 
        parseInt(limit)
      );

      res.json({
        success: true,
        data: contributions
      });

    } catch (error) {
      console.error('Error fetching contribution history:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch contribution history',
          status: 500
        }
      });
    }
  }

  /**
   * Get pension projections
   */
  static async getProjections(req, res) {
    try {
      const { memberId } = req.params;
      const user = req.user;

      // Check access permissions
      if (user.memberId !== memberId && !hasPermission(user.role, 'member_data:read:all')) {
        return res.status(403).json({
          error: {
            message: 'Access denied',
            status: 403
          }
        });
      }

      const projections = await MemberData.getProjections(memberId);

      res.json({
        success: true,
        data: projections
      });

    } catch (error) {
      console.error('Error fetching projections:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch projections',
          status: 500
        }
      });
    }
  }

  /**
   * Get member analytics dashboard data
   */
  static async getDashboardData(req, res) {
    try {
      const { memberId } = req.params;
      const user = req.user;

      // Check access permissions
      if (user.memberId !== memberId && !hasPermission(user.role, 'member_data:read:all')) {
        return res.status(403).json({
          error: {
            message: 'Access denied',
            status: 403
          }
        });
      }

      const memberData = await MemberData.findByMemberId(memberId);
      
      if (!memberData) {
        return res.status(404).json({
          error: {
            message: 'Member data not found',
            status: 404
          }
        });
      }

      const dashboardData = {
        summary: {
          currentBalance: memberData.pensionDetails.currentBalance || 0,
          monthlyContribution: memberData.pensionDetails.monthlyContribution || 0,
          readinessScore: memberData.calculateReadinessScore(),
          yearsToRetirement: (memberData.pensionDetails.retirementAge || 65) - (memberData.personalInfo.age || 30)
        },
        recentContributions: await MemberData.getContributionHistory(memberId, null, null, 5),
        projections: await MemberData.getProjections(memberId)
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch dashboard data',
          status: 500
        }
      });
    }
  }
}
