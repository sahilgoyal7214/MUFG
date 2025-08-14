import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock pension data
const mockPensionData = [
  { memberId: 'M001', age: 25, salary: 35000, contribution: 280, balance: 15000, riskLevel: 'Low', employment: 'Full-time' },
  { memberId: 'M002', age: 28, salary: 52000, contribution: 416, balance: 28900, riskLevel: 'High', employment: 'Full-time' },
  { memberId: 'M003', age: 32, salary: 48000, contribution: 384, balance: 42000, riskLevel: 'Medium', employment: 'Part-time' },
  { memberId: 'M004', age: 34, salary: 65000, contribution: 520, balance: 45200, riskLevel: 'Medium', employment: 'Full-time' },
  { memberId: 'M005', age: 38, salary: 72000, contribution: 576, balance: 67000, riskLevel: 'High', employment: 'Full-time' },
  { memberId: 'M006', age: 42, salary: 85000, contribution: 680, balance: 89000, riskLevel: 'Low', employment: 'Full-time' },
  { memberId: 'M007', age: 45, salary: 78000, contribution: 624, balance: 127450, riskLevel: 'Medium', employment: 'Part-time' },
  { memberId: 'M008', age: 48, salary: 95000, contribution: 760, balance: 156000, riskLevel: 'High', employment: 'Full-time' },
  { memberId: 'M009', age: 52, salary: 88000, contribution: 704, balance: 198000, riskLevel: 'Medium', employment: 'Full-time' },
  { memberId: 'M010', age: 55, salary: 92000, contribution: 736, balance: 234000, riskLevel: 'Low', employment: 'Part-time' },
  { memberId: 'M011', age: 58, salary: 98000, contribution: 784, balance: 267000, riskLevel: 'High', employment: 'Full-time' },
  { memberId: 'M012', age: 62, salary: 105000, contribution: 840, balance: 312000, riskLevel: 'Medium', employment: 'Full-time' }
];

// Get pension data (member-specific or all for advisors/regulators)
router.get('/pension-data', authenticateToken, (req, res) => {
  try {
    const { role, username } = req.user;
    const { page = 1, limit = 10, filter } = req.query;

    let data = [...mockPensionData];

    // Filter data based on role
    if (role === 'member') {
      // Members see only their own data
      data = data.filter(record => record.memberId === req.user.memberData?.memberId);
    }

    // Apply filters if provided
    if (filter) {
      const filterObj = JSON.parse(filter);
      if (filterObj.ageMin) data = data.filter(d => d.age >= filterObj.ageMin);
      if (filterObj.ageMax) data = data.filter(d => d.age <= filterObj.ageMax);
      if (filterObj.riskLevel) data = data.filter(d => d.riskLevel === filterObj.riskLevel);
      if (filterObj.employment) data = data.filter(d => d.employment === filterObj.employment);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = data.slice(startIndex, endIndex);

    res.json({
      data: paginatedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(data.length / limit),
        totalRecords: data.length,
        hasNext: endIndex < data.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Error fetching pension data:', error);
    res.status(500).json({
      error: 'Error fetching pension data'
    });
  }
});

// Upload pension data (for file uploads)
router.post('/upload', authenticateToken, (req, res) => {
  try {
    const { data, filename } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Invalid data format'
      });
    }

    // In a real application, you would:
    // 1. Validate the data structure
    // 2. Save to database
    // 3. Process the data for insights

    const uploadId = uuidv4();
    const processedRecords = data.length;

    res.json({
      message: 'Data uploaded successfully',
      uploadId,
      filename: filename || 'uploaded_data.csv',
      recordsProcessed: processedRecords,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({
      error: 'Error uploading data'
    });
  }
});

// Get data insights
router.get('/insights', authenticateToken, (req, res) => {
  try {
    const { role } = req.user;
    
    // Calculate insights from mock data
    const insights = {
      totalMembers: mockPensionData.length,
      averageAge: Math.round(mockPensionData.reduce((sum, d) => sum + d.age, 0) / mockPensionData.length),
      averageBalance: Math.round(mockPensionData.reduce((sum, d) => sum + d.balance, 0) / mockPensionData.length),
      averageContribution: Math.round(mockPensionData.reduce((sum, d) => sum + d.contribution, 0) / mockPensionData.length),
      riskDistribution: {
        Low: mockPensionData.filter(d => d.riskLevel === 'Low').length,
        Medium: mockPensionData.filter(d => d.riskLevel === 'Medium').length,
        High: mockPensionData.filter(d => d.riskLevel === 'High').length
      },
      employmentDistribution: {
        'Full-time': mockPensionData.filter(d => d.employment === 'Full-time').length,
        'Part-time': mockPensionData.filter(d => d.employment === 'Part-time').length
      }
    };

    res.json({
      insights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      error: 'Error generating insights'
    });
  }
});

export default router;
