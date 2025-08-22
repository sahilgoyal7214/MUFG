/**
 * Debug Auth Middleware
 * Logs detailed token validation process
 */

import { extractUserFromToken } from '../config/nextauth.js';
import jwt from 'jsonwebtoken';

export const debugAuthenticate = async (req, res, next) => {
  console.log('\n🔍 Debug Authentication Process');
  console.log('================================');
  
  try {
    const authHeader = req.headers.authorization;
    console.log('1. Auth Header:', authHeader ? authHeader.substring(0, 50) + '...' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('2. Extracted Token:', token ? token.substring(0, 50) + '...' : 'Missing');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        error: { message: 'Access token required', status: 401 }
      });
    }

    // Try to decode without verification first
    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('3. Token Structure:', JSON.stringify(decoded, null, 2));
    } catch (e) {
      console.log('3. Token decode error:', e.message);
    }

    // Try verification with different secrets
    const secrets = [
      process.env.NEXTAUTH_SECRET,
      process.env.JWT_SECRET,
      'your-super-secret-jwt-key-change-this-in-production'
    ];

    for (let i = 0; i < secrets.length; i++) {
      try {
        const verified = jwt.verify(token, secrets[i]);
        console.log(`4. Verification SUCCESS with secret ${i + 1}:`, verified);
        break;
      } catch (e) {
        console.log(`4. Verification FAILED with secret ${i + 1}:`, e.message);
      }
    }

    // Try the extractUserFromToken function
    try {
      const user = await extractUserFromToken(token);
      console.log('5. User extraction SUCCESS:', user);
      req.user = user;
      next();
    } catch (error) {
      console.log('5. User extraction FAILED:', error.message);
      return res.status(401).json({
        error: { message: 'Invalid or expired token', status: 401, debug: error.message }
      });
    }

  } catch (error) {
    console.log('❌ Debug auth error:', error);
    return res.status(401).json({
      error: { message: 'Authentication error', status: 401, debug: error.message }
    });
  }
};

export default debugAuthenticate;
