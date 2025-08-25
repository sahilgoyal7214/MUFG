import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function proxyRequest(request, method = 'GET') {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the JWT token directly from NextAuth JWE
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { error: "Failed to get token" },
        { status: 500 }
      );
    }

    // Create a JWT token that the backend expects
    const jwt = require('jsonwebtoken');
    const backendToken = jwt.sign({
      sub: token.sub,
      email: token.email,
      name: token.name,
      username: token.username,
      role: token.role,
      roleData: token.roleData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    }, process.env.NEXTAUTH_SECRET);

    // Extract query parameters and path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/api/proxy/pension-data')[1] || '';
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/pension-data${pathSegments}${queryParams ? `?${queryParams}` : ''}`;

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

    const response = await fetch(backendUrl, options);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Pension data proxy error:', error);
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
