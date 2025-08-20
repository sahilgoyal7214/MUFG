#!/usr/bin/env node

import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Simple auth middleware for testing
const testAuth = (req, res, next) => {
    try {
        console.log('Raw Authorization header:', req.headers.authorization);
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log('Extracted token:', token ? `${token.substring(0, 50)}...` : 'NO TOKEN');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token verified successfully, user:', decoded.email);
        
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
};

app.get('/test', testAuth, (req, res) => {
    res.json({ message: 'Success!', user: req.user });
});

const port = 4001;
app.listen(port, () => {
    console.log(`Test server running on http://localhost:${port}`);
    console.log('Test with: curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4001/test');
});
