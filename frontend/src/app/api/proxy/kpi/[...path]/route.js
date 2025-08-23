import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { authOptions } from "../../../auth/[...nextauth]/route";

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

async function proxyRequest(request, method = 'GET', params) {
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

    // Build the backend URL with the path
    const pathSegments = params.path ? `/${params.path.join('/')}` : '';
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/kpi${pathSegments}${queryParams ? `?${queryParams}` : ''}`;

    console.log('🔍 KPI Dynamic Proxy:', {
      frontendPath: url.pathname,
      backendUrl,
      pathSegments,
      method
    });

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
    console.error('KPI dynamic proxy error:', error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  return proxyRequest(request, 'GET', params);
}

export async function POST(request, { params }) {
  return proxyRequest(request, 'POST', params);
}

export async function PUT(request, { params }) {
  return proxyRequest(request, 'PUT', params);
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, 'DELETE', params);
}
