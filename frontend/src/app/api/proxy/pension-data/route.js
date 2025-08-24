import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../auth/[...nextauth]/route";

// Force Node.js runtime for jsonwebtoken compatibility
export const runtime = 'nodejs';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function proxyRequest(request, method = 'GET') {
  try {
    console.log('🔍 Pension data proxy request:', method, request.url);
    
    const session = await getServerSession(authOptions);
    console.log('📋 Session status:', session ? 'authenticated' : 'not authenticated');
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Since we have custom JWT encode/decode, we'll use the session data directly
    let backendToken;
    try {
      const jwt = await import('jsonwebtoken');
      
      // Use the tokenData from session which contains all the necessary fields
      const tokenData = session.tokenData || {
        sub: session.user.id,
        email: session.user.email,
        name: session.user.name,
        username: session.user.username,
        role: session.user.role,
        roleData: session.user.roleData
      };
      
      backendToken = jwt.default.sign({
        ...tokenData,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
      }, process.env.NEXTAUTH_SECRET);
      
      console.log('🔐 JWT token created successfully from session data');
    } catch (jwtError) {
      console.error('❌ JWT creation error:', jwtError);
      return NextResponse.json(
        { error: "Failed to create JWT token", details: jwtError.message },
        { status: 500 }
      );
    }

    // Extract query parameters and path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/api/proxy/pension-data')[1] || '';
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/pension-data${pathSegments}${queryParams ? `?${queryParams}` : ''}`;
    
    console.log('🎯 Backend URL:', backendUrl);

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

    console.log('📡 Making request to backend...');
    const response = await fetch(backendUrl, options);
    console.log('📥 Backend response status:', response.status);
    
    const data = await response.json();
    console.log('📊 Backend response data type:', Array.isArray(data?.data) ? `array with ${data.data.length} items` : typeof data);

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('❌ Pension data proxy error:', error);
    return NextResponse.json(
      { error: "Proxy request failed", details: error.message },
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
