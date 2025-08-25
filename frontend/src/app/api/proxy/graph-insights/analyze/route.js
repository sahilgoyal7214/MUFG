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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const token = await createJWT(session);
    if (!token) {
      return NextResponse.json(
        { error: { message: "Failed to generate authentication token" } },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();

    // Prepare backend request
    const backendUrl = `${BACKEND_URL}/api/graph-insights/analyze`;
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    };

    console.log('Proxying graph insights request to:', backendUrl);
    console.log('Request body keys:', Object.keys(body));
    console.log('Base64 image length:', body.base64Image?.length || 0);

    const response = await fetch(backendUrl, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response error:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: `Backend error: ${response.status}` } };
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Graph insights response received:', data.success ? 'Success' : 'Failed');

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Graph insights proxy error:', error);
    return NextResponse.json(
      { error: { message: "Graph insights service temporarily unavailable" } },
      { status: 500 }
    );
  }
}
