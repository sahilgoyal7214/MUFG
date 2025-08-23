import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { authOptions } from "../[...nextauth]/route";

/**
 * API endpoint to generate JWT token for backend authentication
 * This ensures JWT signing happens server-side with proper security
 */
export async function GET(request) {
  return generateToken(request);
}

export async function POST(request) {
  return generateToken(request);
}

async function generateToken(request) {
  try {
    // In App Router, we need to pass the request context
    const session = await getServerSession(authOptions);
    
    console.log('🔍 DEBUG: Session data:', JSON.stringify(session, null, 2));
    
    if (!session || !session.user) {
      console.log('🔍 DEBUG: No session found');
      console.log('🔍 DEBUG: Session status:', session ? 'exists but no user' : 'null');
      
      // Check if we have request headers
      const cookies = request?.headers?.get('cookie');
      console.log('🔍 DEBUG: Request has cookies:', !!cookies);
      
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Create JWT payload
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

    console.log('🔍 DEBUG: Token payload:', JSON.stringify(tokenPayload, null, 2));
    console.log('🔍 DEBUG: NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET?.substring(0, 20) + '...');

    // Sign JWT with NextAuth secret
    const token = jwt.sign(tokenPayload, process.env.NEXTAUTH_SECRET);
    
    console.log('🔍 DEBUG: Generated token:', token?.substring(0, 50) + '...');
    console.log('🔍 DEBUG: Token length:', token?.length);
    console.log('🔍 DEBUG: Token parts:', token?.split('.').length);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate token", details: error.message },
      { status: 500 }
    );
  }
}
