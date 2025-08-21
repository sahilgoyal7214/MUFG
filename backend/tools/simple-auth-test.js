#!/usr/bin/env node

import express from 'express';
import { extractUserFromToken } from './src/config/nextauth.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Simplified auth middleware without AuditService
const simpleAuth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: { message: 'Access token required', status: 401 } });
    }
    
    console.log('Token found, verifying...');
    const user = await extractUserFromToken(token);
    console.log('Token verified, user:', user.email);
    
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth failed:', error.message);
    return res.status(401).json({ error: { message: 'Invalid or expired token', status: 401 } });
  }
};

app.get('/api/auth/me', simpleAuth, (req, res) => {
  console.log('Route handler called for user:', req.user.email);
  res.json({
    success: true,
    data: req.user
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

const port = 4002;
app.listen(port, () => {
  console.log(`Simplified test server running on http://localhost:${port}`);
  console.log('Test auth: curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4002/api/auth/me');
});
