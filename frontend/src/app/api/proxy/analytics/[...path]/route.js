import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { SignJWT } from "jose"; // ✅ ESM-compatible

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function createBackendToken(token) {
  const payload = {
    sub: token.sub,
    email: token.email,
    name: token.name,
    username: token.username,
    role: token.role,
    roleData: token.roleData,
  };

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
    }

    const backendToken = await createBackendToken(token);

    const { path } = params;
    const endpoint = path ? `/${path.join('/')}` : '';
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/analytics${endpoint}${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Analytics proxy GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
    }

    const backendToken = await createBackendToken(token);

    const { path } = params;
    const endpoint = path ? `/${path.join('/')}` : '';
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/analytics${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    
    const requestBody = await request.text();

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Analytics proxy POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
