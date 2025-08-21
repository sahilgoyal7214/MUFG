# NextAuth Frontend-Backend Integration Guide

## Overview

This backend is designed to work with NextAuth running on your frontend application. Here's how to set up the integration:

## Backend Setup (This API)

1. **Environment Variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Set the same NEXTAUTH_SECRET as your frontend
   NEXTAUTH_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:3000
   ```

2. **Available Endpoints**
   - `POST /api/auth/verify` - Verify NextAuth token
   - `GET /api/auth/me` - Get current user data
   - `POST /api/auth/refresh` - Refresh session data

## Frontend NextAuth Setup

1. **Install NextAuth**
   ```bash
   npm install next-auth
   ```

2. **NextAuth Configuration** (`pages/api/auth/[...nextauth].js` or `app/api/auth/[...nextauth]/route.js`)
   ```javascript
   import NextAuth from 'next-auth'
   import GoogleProvider from 'next-auth/providers/google'
   
   export default NextAuth({
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       })
       // Add other providers as needed
     ],
     
     // IMPORTANT: Use JWT strategy
     session: {
       strategy: 'jwt',
       maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     
     jwt: {
       secret: process.env.NEXTAUTH_SECRET, // MUST match backend
       maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     
     callbacks: {
       async jwt({ token, user, account }) {
         // Add user role and other data to token
         if (user) {
           token.role = user.role || 'guest'
           token.memberId = user.memberId
         }
         return token
       },
       
       async session({ session, token }) {
         // Add token data to session
         session.user.role = token.role
         session.user.memberId = token.memberId
         session.accessToken = token.accessToken
         return session
       }
     }
   })
   ```

3. **Frontend API Calls**
   ```javascript
   import { getSession } from 'next-auth/react'
   
   // Get session with token
   const session = await getSession()
   
   // Make API calls to backend
   const response = await fetch('/api/members', {
     headers: {
       'Authorization': `Bearer ${session.accessToken}`,
       'Content-Type': 'application/json'
     }
   })
   ```

4. **Frontend Environment Variables** (`.env.local`)
   ```bash
   NEXTAUTH_SECRET=your-secret-key-here  # MUST match backend
   NEXTAUTH_URL=http://localhost:3000
   
   # OAuth providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

## Authentication Flow

1. **Login**: User logs in via NextAuth on frontend
2. **Token**: NextAuth generates JWT token
3. **API Calls**: Frontend sends token to backend in Authorization header
4. **Verification**: Backend verifies token and extracts user data
5. **Authorization**: Backend checks user role/permissions
6. **Response**: Backend returns data or error

## User Roles

The backend supports these roles for the pension system:
- `regulator` - Regulatory authorities with full oversight access
- `advisor` - Financial advisors who can access assigned clients' data
- `member` - Individual pension scheme members (own data only)

## Example Frontend Hook

```javascript
// hooks/useApiCall.js
import { useSession } from 'next-auth/react'

export const useApiCall = () => {
  const { data: session } = useSession()
  
  const apiCall = async (endpoint, options = {}) => {
    if (!session?.accessToken) {
      throw new Error('Not authenticated')
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      throw new Error('API call failed')
    }
    
    return response.json()
  }
  
  return { apiCall }
}
```

## Testing the Integration

1. Start the backend: `npm run dev` (port 4000)
2. Start the frontend: `npm run dev` (port 3000)
3. Login via NextAuth on frontend
4. Make API calls to backend endpoints
5. Check that tokens are properly verified

## Security Notes

- **Never expose NEXTAUTH_SECRET** in client-side code
- Use **HTTPS in production**
- Set **secure cookie settings** in production
- Implement **proper CORS configuration**
- Use **rate limiting** for API endpoints
