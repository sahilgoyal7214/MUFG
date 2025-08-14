import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { fullName, email } = req.body;
    
    // In a real app, update the database
    const updatedUser = {
      ...req.user,
      fullName: fullName || req.user.fullName,
      email: email || req.user.email
    };

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error updating profile'
    });
  }
});

// Get user statistics based on role
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const { role } = req.user;

    let stats = {};

    switch (role) {
      case 'member':
        stats = req.user.memberData || {};
        break;
      case 'advisor':
        stats = req.user.advisorData || {};
        break;
      case 'regulator':
        stats = req.user.regulatorData || {};
        break;
      default:
        stats = {};
    }

    res.json({
      role,
      stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching user statistics'
    });
  }
});

export default router;
