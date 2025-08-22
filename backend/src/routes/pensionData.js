/**
 * Pension Data Routes
 * Comprehensive CRUD operations for pension data management
 * 
 * @swagger
 * tags:
 *   - name: Pension Data
 *     description: Complete pension data management with search, filtering, and analytics
 */

import express from 'express';
import PensionData from '../models/PensionData.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/roles.js';
import { AuditService } from '../services/AuditService.js';

const router = express.Router();

// Apply authentication to all pension data routes
router.use(authenticate);

/**
 * @swagger
 * /api/pension-data:
 *   get:
 *     summary: Get all pension data with filtering and pagination
 *     description: Retrieve pension data with comprehensive filtering, search, and pagination options
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of records per page (max 100)
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - in: query
 *         name: country
 *         description: Filter by country
 *         schema:
 *           type: string
 *       - in: query
 *         name: pensionType
 *         description: Filter by pension type
 *         schema:
 *           type: string
 *       - in: query
 *         name: riskTolerance
 *         description: Filter by risk tolerance
 *         schema:
 *           type: string
 *       - in: query
 *         name: minAge
 *         description: Minimum age filter
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         description: Maximum age filter
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minIncome
 *         description: Minimum annual income filter
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxIncome
 *         description: Maximum annual income filter
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         description: Text search across multiple fields
 *         schema:
 *           type: string
 *       - in: query
 *         name: suspiciousOnly
 *         description: Show only suspicious records
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: orderBy
 *         description: Field to order by
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: orderDirection
 *         description: Order direction
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Pension data retrieved successfully
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
 *                     $ref: '#/components/schemas/PensionData'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *   post:
 *     summary: Create new pension data record
 *     description: Create a new pension data record with comprehensive validation
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PensionData'
 *     responses:
 *       201:
 *         description: Pension data created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PensionData'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Insufficient permissions
 */

// GET /api/pension-data - List all pension data with filtering
router.get('/', authorize([PERMISSIONS.MEMBER_DATA_READ_ALL, PERMISSIONS.MEMBER_DATA_READ_OWN]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    // Build search options from query parameters
    const searchOptions = {
      page,
      limit,
      minAge: req.query.minAge ? parseInt(req.query.minAge) : undefined,
      maxAge: req.query.maxAge ? parseInt(req.query.maxAge) : undefined,
      minIncome: req.query.minIncome ? parseFloat(req.query.minIncome) : undefined,
      maxIncome: req.query.maxIncome ? parseFloat(req.query.maxIncome) : undefined,
      searchText: req.query.search,
      country: req.query.country,
      riskTolerance: req.query.riskTolerance,
      pensionType: req.query.pensionType,
      suspiciousOnly: req.query.suspiciousOnly === 'true',
      orderBy: req.query.orderBy || 'created_at',
      orderDirection: req.query.orderDirection || 'DESC'
    };

    // If user only has MEMBER_DATA_READ_OWN permission, filter to their own data
    const hasFullAccess = req.user.permissions.includes(PERMISSIONS.MEMBER_DATA_READ_ALL);
    if (!hasFullAccess) {
      // Members can only access their own data
      searchOptions.userId = req.user.id;
    }

    // Use search method for complex filtering or paginate for simple queries
    let result;
    if (Object.values(searchOptions).some(val => val !== undefined && val !== null)) {
      const data = await PensionData.search(searchOptions);
      
      // Calculate pagination manually for search results
      const countWhere = hasFullAccess ? {} : { user_id: req.user.id };
      const total = await PensionData.count(countWhere);
      result = {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } else {
      // For simple pagination without filters
      const paginateOptions = hasFullAccess ? {} : { where: { user_id: req.user.id } };
      result = await PensionData.paginate(page, limit, paginateOptions);
    }

    // Log data access
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'LIST_PENSION_DATA',
      filters: searchOptions,
      timestamp: new Date()
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error fetching pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch pension data',
        status: 500
      }
    });
  }
});

// POST /api/pension-data - Create new pension data
router.post('/', authorize([PERMISSIONS.MEMBER_DATA_CREATE]), async (req, res) => {
  try {
    // Transform API request format to database format
    const transformedData = {
      user_id: req.body.memberId,
      age: req.body.age,
      gender: req.body.gender,
      country: req.body.country,
      employment_status: req.body.employmentStatus,
      marital_status: req.body.maritalStatus,
      annual_income: req.body.annualIncome,
      current_savings: req.body.currentBalance || req.body.currentSavings,
      retirement_age_goal: req.body.targetRetirementAge,
      risk_tolerance: req.body.riskTolerance,
      pension_type: req.body.pensionType,
      contribution_amount: req.body.monthlyContribution,
      contribution_frequency: req.body.contributionFrequency || 'Monthly',
      projected_pension_amount: req.body.targetRetirementCorpus
    };

    const pensionData = new PensionData(transformedData);
    const savedData = await pensionData.save();

    // Log data creation
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'CREATE_PENSION_DATA',
      targetRecordId: savedData.id,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: savedData.toJSON(),
      message: 'Pension data created successfully'
    });

  } catch (error) {
    console.error('Error creating pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create pension data',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/pension-data/{id}:
 *   get:
 *     summary: Get pension data by ID
 *     description: Retrieve a specific pension data record by ID
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pension data record ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pension data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PensionData'
 *       404:
 *         description: Pension data not found
 *   put:
 *     summary: Update pension data
 *     description: Update an existing pension data record
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pension data record ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PensionData'
 *     responses:
 *       200:
 *         description: Pension data updated successfully
 *       404:
 *         description: Pension data not found
 *   delete:
 *     summary: Delete pension data
 *     description: Delete a pension data record by ID
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pension data record ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pension data deleted successfully
 *       404:
 *         description: Pension data not found
 */

// GET /api/pension-data/:id - Get specific pension data
router.get('/:id', authorize([PERMISSIONS.MEMBER_DATA_READ_ALL]), async (req, res) => {
  try {
    const { id } = req.params;
    const pensionData = await PensionData.findById(parseInt(id));

    if (!pensionData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pension data not found',
          status: 404
        }
      });
    }

    // Log data access
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'VIEW_PENSION_DATA',
      targetRecordId: id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: pensionData.toJSON()
    });

  } catch (error) {
    console.error('Error fetching pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch pension data',
        status: 500
      }
    });
  }
});

// PUT /api/pension-data/:id - Update pension data
router.put('/:id', authorize([PERMISSIONS.MEMBER_DATA_UPDATE]), async (req, res) => {
  try {
    const { id } = req.params;
    const pensionData = await PensionData.findById(parseInt(id));

    if (!pensionData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pension data not found',
          status: 404
        }
      });
    }

    // Transform API request format to database format - only include provided fields
    const transformedData = {};
    
    if (req.body.memberId !== undefined) transformedData.user_id = req.body.memberId;
    if (req.body.age !== undefined) transformedData.age = req.body.age;
    if (req.body.gender !== undefined) transformedData.gender = req.body.gender;
    if (req.body.country !== undefined) transformedData.country = req.body.country;
    if (req.body.employmentStatus !== undefined) transformedData.employment_status = req.body.employmentStatus;
    if (req.body.maritalStatus !== undefined) transformedData.marital_status = req.body.maritalStatus;
    if (req.body.annualIncome !== undefined) transformedData.annual_income = req.body.annualIncome;
    if (req.body.currentBalance !== undefined || req.body.currentSavings !== undefined) {
      transformedData.current_savings = req.body.currentBalance || req.body.currentSavings;
    }
    if (req.body.targetRetirementAge !== undefined) transformedData.retirement_age_goal = req.body.targetRetirementAge;
    if (req.body.riskTolerance !== undefined) transformedData.risk_tolerance = req.body.riskTolerance;
    if (req.body.pensionType !== undefined) transformedData.pension_type = req.body.pensionType;
    if (req.body.monthlyContribution !== undefined) transformedData.contribution_amount = req.body.monthlyContribution;
    if (req.body.contributionFrequency !== undefined) transformedData.contribution_frequency = req.body.contributionFrequency;
    if (req.body.targetRetirementCorpus !== undefined) transformedData.projected_pension_amount = req.body.targetRetirementCorpus;

    // Only update fields that are provided
    Object.keys(transformedData).forEach(key => {
      pensionData[key] = transformedData[key];
    });

    const updatedData = await pensionData.save();

    // Log data modification
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'UPDATE_PENSION_DATA',
      targetRecordId: id,
      changes: req.body,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: updatedData.toJSON(),
      message: 'Pension data updated successfully'
    });

  } catch (error) {
    console.error('Error updating pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update pension data',
        status: 500
      }
    });
  }
});

// DELETE /api/pension-data/:id - Delete pension data
router.delete('/:id', authorize([PERMISSIONS.MEMBER_DATA_DELETE]), async (req, res) => {
  try {
    const { id } = req.params;
    const pensionData = await PensionData.findById(parseInt(id));

    if (!pensionData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pension data not found',
          status: 404
        }
      });
    }

    await pensionData.delete();

    // Log data deletion
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'DELETE_PENSION_DATA',
      targetRecordId: id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pension data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete pension data',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/pension-data/stats/overview:
 *   get:
 *     summary: Get pension data statistics
 *     description: Retrieve comprehensive statistics about the pension data
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total_records:
 *                       type: integer
 *                     countries:
 *                       type: integer
 *                     avg_age:
 *                       type: number
 *                     avg_income:
 *                       type: number
 *                     suspicious_records:
 *                       type: integer
 *                     oldest_record:
 *                       type: string
 *                       format: date-time
 *                     newest_record:
 *                       type: string
 *                       format: date-time
 */

// GET /api/pension-data/stats/overview - Get statistics
router.get('/stats/overview', authorize([PERMISSIONS.ANALYTICS_READ]), async (req, res) => {
  try {
    const stats = await PensionData.getStatistics();

    // Log analytics access
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'VIEW_PENSION_STATS',
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching pension data statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch statistics',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/pension-data/bulk:
 *   post:
 *     summary: Bulk create pension data records
 *     description: Create multiple pension data records in a single transaction
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PensionData'
 *     responses:
 *       201:
 *         description: Bulk data created successfully
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
 *                     $ref: '#/components/schemas/PensionData'
 *                 message:
 *                   type: string
 *   delete:
 *     summary: Bulk delete pension data records
 *     description: Delete multiple pension data records by IDs
 *     tags: [Pension Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Bulk deletion completed successfully
 */

// POST /api/pension-data/bulk - Bulk create
router.post('/bulk', authorize([PERMISSIONS.MEMBER_DATA_CREATE]), async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Data array is required and cannot be empty',
          status: 400
        }
      });
    }

    const createdData = await PensionData.bulkCreate(data);

    // Log bulk creation
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'BULK_CREATE_PENSION_DATA',
      recordCount: createdData.length,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: createdData.map(item => item.toJSON()),
      message: `Successfully created ${createdData.length} pension data records`
    });

  } catch (error) {
    console.error('Error bulk creating pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to bulk create pension data',
        status: 500
      }
    });
  }
});

// DELETE /api/pension-data/bulk - Bulk delete
router.delete('/bulk', authorize([PERMISSIONS.MEMBER_DATA_DELETE]), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'IDs array is required and cannot be empty',
          status: 400
        }
      });
    }

    const deletedCount = await PensionData.bulkDelete(ids);

    // Log bulk deletion
    await AuditService.logDataAccess({
      userId: req.user.id,
      action: 'BULK_DELETE_PENSION_DATA',
      recordCount: deletedCount,
      deletedIds: ids,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} pension data records`
    });

  } catch (error) {
    console.error('Error bulk deleting pension data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to bulk delete pension data',
        status: 500
      }
    });
  }
});

export default router;
