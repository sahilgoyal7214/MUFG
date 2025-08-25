import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function proxyRequest(request, method = 'GET') {
  try {
    console.log('🔍 PENSION-DATA PROXY: Starting request...');
    console.log('🔍 PENSION-DATA PROXY: Method:', method);
    console.log('🔍 PENSION-DATA PROXY: URL:', request.url);
    
    const session = await getServerSession(authOptions);
    console.log('🔍 PENSION-DATA PROXY: Session:', session ? 'EXISTS' : 'NULL');
    console.log('🔍 PENSION-DATA PROXY: Session user:', session?.user);
    
    if (!session || !session.user) {
      console.log('❌ PENSION-DATA PROXY: No session found');
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Create JWT token using the same method as the working advisor/clients route
    console.log('🔍 PENSION-DATA PROXY: Creating JWT token...');
    console.log('🔍 PENSION-DATA PROXY: User role:', session.user.role);
    
    // Convert role to permissions using the backend permission format
    let permissions = [];
    if (session.user.role === 'advisor') {
      permissions = ['member_data:read:assigned'];
    } else if (session.user.role === 'member') {
      permissions = ['member_data:read:own'];
    } else if (session.user.role === 'regulator') {
      permissions = ['member_data:read:all', 'analytics:view:all'];
    }
    
    console.log('🔍 PENSION-DATA PROXY: Permissions assigned:', permissions);
    
    const tokenPayload = {
      sub: session.user.id || session.user.email,
      email: session.user.email,
      name: session.user.name,
      username: session.user.username,
      role: session.user.role || 'member',
      roleData: session.user.roleData || {},
      permissions: permissions, // Add permissions in correct format
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };

    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    const jwt = require('jsonwebtoken');
    const backendToken = jwt.sign(tokenPayload, JWT_SECRET);

    console.log('🔍 PENSION-DATA PROXY: Backend token created (first 50 chars):', backendToken?.substring(0, 50) + '...');

    // Extract query parameters and path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/api/proxy/pension-data')[1] || '';
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/pension-data${pathSegments}${queryParams ? `?${queryParams}` : ''}`;

    console.log('🔍 PENSION-DATA PROXY: Backend URL:', backendUrl);

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      }
    };

    // Add body for POST/PUT requests
    if (method !== 'GET' && method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    console.log('🔍 PENSION-DATA PROXY: Making request to backend...');
    const response = await fetch(backendUrl, options);
    console.log('🔍 PENSION-DATA PROXY: Backend response status:', response.status);
    
    const data = await response.json();
    console.log('🔍 PENSION-DATA PROXY: Backend response data type:', typeof data);
    console.log('🔍 PENSION-DATA PROXY: Backend response success:', data.success);

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('❌ PENSION-DATA PROXY: Error occurred:', error);
    console.error('❌ PENSION-DATA PROXY: Error stack:', error.stack);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return proxyRequest(request, 'GET');
}

export async function POST(request) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request) {
  return proxyRequest(request, 'DELETE');
}
