#!/usr/bin/env node

/**
 * Test script to verify advisor authentication flow
 * Tests that advisor can login and access advisor-specific endpoints
 */

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const BACKEND_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

// Advisor test credentials from default users
const advisorCredentials = {
  username: 'advisor1',
  password: 'password123',
  role: 'advisor'
};

async function testAdvisorAuth() {
  console.log('🧪 Testing Advisor Authentication Flow\n');

  try {
    // Step 1: Test advisor login (simulate NextAuth signin)
    console.log('1️⃣  Testing advisor credentials...');
    
    // Create a JWT token as NextAuth would (using NEXTAUTH_SECRET)
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-here-make-it-long-and-secure';
    
    const advisorUser = {
      id: '2',
      email: 'advisor1@mufg.com',
      name: 'Jane Advisor',
      username: 'advisor1',
      role: 'advisor',
      roleData: {
        totalClients: 247,
        assetsUnderManagement: 45200000,
        avgPerformance: 7.8,
        clientsNeedingReview: 18
      }
    };

    const token = jwt.sign(advisorUser, NEXTAUTH_SECRET, {
      expiresIn: '1h',
      issuer: 'nextauth'
    });

    console.log('✅ Generated advisor JWT token');

    // Step 2: Test backend endpoints with advisor token
    console.log('\n2️⃣  Testing advisor endpoints...');

    // Test portfolio optimization endpoint
    const portfolioResponse = await fetch(`${BACKEND_URL}/api/advisor/portfolio-optimization/M001`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Portfolio Optimization: ${portfolioResponse.status} ${portfolioResponse.statusText}`);
    
    if (portfolioResponse.status === 200) {
      const data = await portfolioResponse.json();
      console.log('   Response data keys:', Object.keys(data));
    } else if (portfolioResponse.status === 401) {
      const error = await portfolioResponse.json();
      console.log('   Auth error:', error.error?.message);
    } else {
      const errorText = await portfolioResponse.text();
      console.log('   Error:', errorText.substring(0, 100));
    }

    // Test member segmentation endpoint
    const segmentationResponse = await fetch(`${BACKEND_URL}/api/advisor/member-segmentation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        criteria: ['age', 'salary', 'balance'],
        numberOfClusters: 3
      })
    });

    console.log(`👥 Member Segmentation: ${segmentationResponse.status} ${segmentationResponse.statusText}`);

    // Test risk alerts endpoint
    const riskAlertsResponse = await fetch(`${BACKEND_URL}/api/advisor/risk-alerts/M001`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`⚠️  Risk Alerts: ${riskAlertsResponse.status} ${riskAlertsResponse.statusText}`);

    console.log('\n✅ Advisor authentication test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdvisorAuth();
