/**
 * Chatbot request validation middleware
 */
import { body, validationResult } from 'express-validator';
import { MemberData } from '../models/MemberData.js';

export const validateChatbotRequest = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message too long'),
  
  body('memberId')
    .optional()
    .isString()
    .trim()
    .custom(async (memberId, { req }) => {
      if (memberId) {
        const member = await MemberData.findByMemberId(memberId);
        if (!member) {
          throw new Error('Invalid member ID');
        }
      }
      return true;
    }),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const handleRoleBasedAccess = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const user = req.user;

    // If memberId is provided, validate access
    if (memberId) {
      const isAdvisor = user.permissions.includes('advisor');
      const isOwnData = user.memberId === memberId;

      if (!isAdvisor && !isOwnData) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied: You can only access your own data',
            status: 403
          }
        });
      }
    }

    // Add role context to request
    req.userContext = {
      isAdvisor: user.permissions.includes('advisor'),
      memberId: memberId || user.memberId
    };

    next();
  } catch (error) {
    console.error('Role-based access error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};
