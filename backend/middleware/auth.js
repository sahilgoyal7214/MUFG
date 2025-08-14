import jwt from 'jsonwebtoken';

// Mock users database (same as in auth.js)
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

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
