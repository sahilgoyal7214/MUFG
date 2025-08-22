/**
 * Logs Management Routes
 * Handles log viewing and management endpoints (Regulator access only)
 * 
 * @swagger
 * tags:
 *   - name: Logs
 *     description: Audit log management and compliance reporting (Regulator only)
 */

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/roles.js';
import { AuditService } from '../services/AuditService.js';

const router = express.Router();

// Apply authentication to all log routes
router.use(authenticate);

/**
 * @swagger
 * /api/logs/files:
 *   get:
 *     summary: Get available log files
 *     description: Retrieve list of available audit log files (Regulator access only)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Log files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         example: "authentication-2025-08-17.log"
 *                       type:
 *                         type: string
 *                         example: "authentication"
 *                       date:
 *                         type: string
 *                         example: "2025-08-17"
 *                       size:
 *                         type: number
 *                         example: 1024
 *       403:
 *         description: Insufficient permissions (Regulator access only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/files', 
  authorize([PERMISSIONS.AUDIT_LOGS]),
  (req, res) => {
    try {
      const files = AuditService.getAvailableLogFiles();
      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Error retrieving log files',
          status: 500
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/logs/{type}/{date}:
 *   get:
 *     summary: Get logs by type and date
 *     description: Retrieve specific audit logs filtered by type and date (Regulator access only)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         description: Log type to retrieve
 *         schema:
 *           type: string
 *           enum: [authentication, data_access, system_event, chatbot_interaction]
 *           example: "authentication"
 *       - in: path
 *         name: date
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-08-17"
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "log_123456"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       type:
 *                         type: string
 *                         example: "AUTHENTICATION"
 *                       details:
 *                         type: object
 *                         description: Log entry details
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalRecords:
 *                       type: integer
 *       404:
 *         description: Log file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:type/:date', 
  authorize([PERMISSIONS.AUDIT_LOGS]),
  async (req, res) => {
    try {
      const { type, date } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const logDate = new Date(date);
      const logs = await AuditService.readLogsFromFile(type.toUpperCase(), logDate);
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedLogs = logs.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          logs: paginatedLogs,
          total: logs.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Error retrieving logs',
          status: 500
        }
      });
    }
  }
);

/**
 * GET /api/logs/stats/:type/:date
 * Get log statistics for specific type and date
 */
router.get('/stats/:type/:date', 
  authorize([PERMISSIONS.AUDIT_LOGS]),
  async (req, res) => {
    try {
      const { type, date } = req.params;
      const logDate = new Date(date);
      
      const stats = await AuditService.getLogStatistics(type.toUpperCase(), logDate);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Error retrieving log statistics',
          status: 500
        }
      });
    }
  }
);

/**
 * POST /api/logs/cleanup
 * Clean up old log files
 */
router.post('/cleanup', 
  authorize([PERMISSIONS.AUDIT_LOGS]),
  (req, res) => {
    try {
      const { daysToKeep = 90 } = req.body;
      const result = AuditService.cleanupOldLogs(parseInt(daysToKeep));

      // Log the cleanup action
      AuditService.logSystemEvent({
        event: 'LOG_CLEANUP',
        description: `Cleaned up old log files, deleted ${result.deletedCount} files`,
        severity: 'INFO',
        metadata: { 
          deletedCount: result.deletedCount, 
          totalFiles: result.totalFiles,
          daysToKeep: parseInt(daysToKeep),
          performedBy: req.user.id
        }
      });

      res.json({
        success: true,
        data: result,
        message: `Cleaned up ${result.deletedCount} old log files`
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Error cleaning up logs',
          status: 500
        }
      });
    }
  }
);

/**
 * GET /api/logs/export/:type/:date
 * Export logs as CSV for compliance
 */
router.get('/export/:type/:date', 
  authorize([PERMISSIONS.AUDIT_LOGS]),
  async (req, res) => {
    try {
      const { type, date } = req.params;
      const { format = 'json' } = req.query;
      
      const logDate = new Date(date);
      const logs = await AuditService.readLogsFromFile(type.toUpperCase(), logDate);

      if (format === 'csv') {
        const csv = AuditService.convertToCSV(logs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-${date}.csv"`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-${date}.json"`);
        res.json({
          success: true,
          data: logs,
          exportDate: new Date().toISOString(),
          totalRecords: logs.length
        });
      }

      // Log the export action
      await AuditService.logDataAccess({
        userId: req.user.id,
        action: 'EXPORT_AUDIT_LOGS',
        targetMemberId: null,
        changes: null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Error exporting logs',
          status: 500
        }
      });
    }
  }
);

export default router;
