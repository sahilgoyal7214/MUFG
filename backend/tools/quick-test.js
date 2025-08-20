#!/usr/bin/env node

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNRU0wMDEiLCJlbWFpbCI6Im1lbWJlckBtdWZnLmNvbSIsInJvbGUiOiJNRU1CRVIiLCJuYW1lIjoiQm9iIE1lbWJlciIsInBlcm1pc3Npb25zIjpbIkFOQUxZVElDU19WSUVXX09XTiIsIk1FTUJFUl9EQVRBX1JFQURfT1dOIiwiQ0hBVEJPVF9BQ0NFU1MiXSwiaWF0IjoxNzU1NTEwNTcyLCJleHAiOjE3NTU1OTY5NzIsImlzcyI6Im11ZmctcGVuc2lvbi1pbnNpZ2h0cyIsImF1ZCI6Im11ZmctYXBpIn0.VKwf0RITna89vkd3RWwv8UXqKpz3NzWOQkjuphD6Ff0";

console.log('Testing token verification...');

// Test 1: Direct JWT verification
console.log('\n1. Direct JWT verification:');
try {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded = jwt.verify(token, secret);
    console.log('✅ Direct verification successful');
    console.log('User:', decoded.email, 'Role:', decoded.role);
} catch (error) {
    console.log('❌ Direct verification failed:', error.message);
}

// Test 2: NextAuth config verification
console.log('\n2. NextAuth config verification:');
try {
    import('./src/config/nextauth.js').then(async ({ extractUserFromToken }) => {
        try {
            const user = await extractUserFromToken(token);
            console.log('✅ NextAuth verification successful');
            console.log('User:', user.email, 'Role:', user.role);
        } catch (error) {
            console.log('❌ NextAuth verification failed:', error.message);
        }
    });
} catch (error) {
    console.log('❌ NextAuth import failed:', error.message);
}
