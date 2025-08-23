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

export async function GET(request) {
  try {
    console.log('🔍 KPI Advisor Static Proxy: GET /api/proxy/kpi/advisor');
    
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

    const backendUrl = `${BACKEND_URL}/api/kpi/advisor`;
    console.log('🔍 Proxying to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('🔍 Backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('KPI advisor proxy error:', error);
    return NextResponse.json(
      { error: "Proxy request failed", details: error.message },
      { status: 500 }
    );
  }
}
