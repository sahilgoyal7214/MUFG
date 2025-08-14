import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock user database (in production, use a real database)
const users = [
  {
    id: 1,
    username: 'member1',
    password: '$2a$10$XT.7kx4Z8Xx8xF4vLcJGt.tClhPf.gxC6LnGVDKP7yKF8QrGVL2Ka', // password123
    role: 'member',
    email: 'member1@mufg.com',
    fullName: 'John Member',
    memberData: {
      memberId: 'M001',
      age: 34,
      salary: 65000,
      contribution: 520,
      balance: 45200,
      riskLevel: 'Medium',
      employment: 'Full-time'
    }
  },
  {
    id: 2,
    username: 'advisor1',
    password: '$2a$10$XT.7kx4Z8Xx8xF4vLcJGt.tClhPf.gxC6LnGVDKP7yKF8QrGVL2Ka', // password123
    role: 'advisor',
    email: 'advisor1@mufg.com',
    fullName: 'Jane Advisor',
    advisorData: {
      totalClients: 247,
      assetsUnderManagement: 45200000,
      avgPerformance: 7.8,
      clientsNeedingReview: 18
    }
  },
  {
    id: 3,
    username: 'regulator1',
    password: '$2a$10$XT.7kx4Z8Xx8xF4vLcJGt.tClhPf.gxC6LnGVDKP7yKF8QrGVL2Ka', // password123
    role: 'regulator',
    email: 'regulator1@mufg.com',
    fullName: 'Robert Regulator',
    regulatorData: {
      totalSchemes: 1247,
      complianceRate: 94.2,
      pendingReviews: 73,
      riskAlerts: 12
    }
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      valid: true,
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

// Logout endpoint (for completeness, mainly handled on frontend)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

export default router;
