/**
 * Rate Limiting Utilities
 * Provides API rate limiting functionality
 */

import { tooManyRequestsResponse } from './responseHandler.js';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Generic rate limiter
 */
export const createRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create rate limit record
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }
    
    const requests = rateLimitStore.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return tooManyRequestsResponse(res, message);
    }
    
    // Add current request
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - validRequests.length),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

/**
 * API rate limiter (general API endpoints)
 */
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests, please try again later'
});

/**
 * Authentication rate limiter (stricter for auth endpoints)
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => `${req.ip}-auth`,
  message: 'Too many authentication attempts, please try again later'
});

/**
 * Chatbot rate limiter
 */
export const chatbotRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 10,
  keyGenerator: (req) => `${req.user?.id || req.ip}-chatbot`,
  message: 'Too many chatbot requests, please slow down'
});

/**
 * Analytics rate limiter
 */
export const analyticsRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,
  keyGenerator: (req) => `${req.user?.id || req.ip}-analytics`,
  message: 'Too many analytics requests, please try again later'
});

/**
 * Export rate limiter (very restrictive)
 */
export const exportRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  keyGenerator: (req) => `${req.user?.id || req.ip}-export`,
  message: 'Export limit reached, please try again in an hour'
});

/**
 * Clean up old rate limit entries (should be called periodically)
 */
export const cleanupRateLimitStore = () => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(time => now - time < maxAge);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
};

// Cleanup every hour
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
