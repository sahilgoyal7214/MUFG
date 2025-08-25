import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { authOptions } from "../../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function createJWT(session) {
  if (!session || !session.user) {
    return null;
  }

  // Convert role to permissions using the backend permission format
  let permissions = [];
  if (session.user.role === 'advisor') {
    permissions = [
      'member_data:read:assigned',
      'ai:insights:client'  // Required for graph insights
    ];
  } else if (session.user.role === 'member') {
    permissions = [
      'member_data:read:own',
      'ai:insights:personal'  // Required for graph insights
    ];
  } else if (session.user.role === 'regulator') {
    permissions = [
      'member_data:read:all',
      'analytics:view:all',
      'ai:insights:client'  // Regulators can view client insights
    ];
  }

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
  return jwt.sign(tokenPayload, JWT_SECRET);
}

export async function POST(request) {
  try {
    console.log('🔍 GRAPH-INSIGHTS PROXY: Starting analysis request...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 GRAPH-INSIGHTS PROXY: Session:', session ? 'EXISTS' : 'NULL');
    console.log('🔍 GRAPH-INSIGHTS PROXY: User role:', session?.user?.role);
    
    if (!session) {
      console.log('❌ GRAPH-INSIGHTS PROXY: No session found');
      return NextResponse.json(
        { error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const token = await createJWT(session);
    console.log('🔍 GRAPH-INSIGHTS PROXY: JWT token created:', token ? 'SUCCESS' : 'FAILED');
    if (!token) {
      console.log('❌ GRAPH-INSIGHTS PROXY: Failed to create JWT token');
      return NextResponse.json(
        { error: { message: "Failed to generate authentication token" } },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('🔍 GRAPH-INSIGHTS PROXY: Request body keys:', Object.keys(body));
    console.log('🔍 GRAPH-INSIGHTS PROXY: Base64 image length:', body.base64Image?.length || 0);

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

    console.log('🔍 GRAPH-INSIGHTS PROXY: Proxying request to:', backendUrl);

    const response = await fetch(backendUrl, options);
    console.log('🔍 GRAPH-INSIGHTS PROXY: Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GRAPH-INSIGHTS PROXY: Backend error:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: `Backend error: ${response.status}` } };
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('🔍 GRAPH-INSIGHTS PROXY: Response received:', data.success ? 'Success' : 'Failed');

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('❌ GRAPH-INSIGHTS PROXY: Error occurred:', error);
    console.error('❌ GRAPH-INSIGHTS PROXY: Error stack:', error.stack);
    return NextResponse.json(
      { error: { message: "Graph insights service temporarily unavailable" } },
      { status: 500 }
    );
  }
}
