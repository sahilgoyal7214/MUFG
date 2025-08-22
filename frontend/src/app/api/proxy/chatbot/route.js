import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { authOptions } from "../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function createJWT(session) {
  if (!session || !session.user) {
    return null;
  }

  const tokenPayload = {
    sub: session.user.id || session.user.email,
    email: session.user.email,
    name: session.user.name,
    username: session.user.username,
    role: session.user.role || 'member',
    roleData: session.user.roleData || {},
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };

  const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  return jwt.sign(tokenPayload, JWT_SECRET);
}

async function proxyRequest(request, method = 'GET') {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = await createJWT(session);
    if (!token) {
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: 500 }
      );
    }

    // Extract query parameters and path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/api/proxy/chatbot')[1] || '';
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/chatbot${pathSegments}${queryParams ? `?${queryParams}` : ''}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
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
    console.error('Chatbot proxy error:', error);
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
