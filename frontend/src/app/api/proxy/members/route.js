import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../auth/[...nextauth]/route";
import jwt from "jsonwebtoken"; // ✅ ESM import

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

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

    const { path } = params;
    const endpoint = path ? `/${path.join('/')}` : '';
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/members${endpoint}${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Members backend error ${response.status}:`, errorText);
      return NextResponse.json({ error: `Backend request failed: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics proxy error:', error);
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

    const { path } = params;
    const endpoint = path ? `/${path.join('/')}` : '';
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/analytics${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    
    const requestBody = await request.text();

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Analytics backend error ${response.status}:`, errorText);
      return NextResponse.json({ error: `Backend request failed: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
