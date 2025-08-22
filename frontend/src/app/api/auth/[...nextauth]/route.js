import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { userService } from "../../../../lib/userService"
import initializeDatabase from "../../../../lib/initDb"

// Initialize database on startup
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      await userService.initializeDefaultUsers();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter username" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Ensure database is initialized
          await ensureDbInitialized();

          // Find user by username
          const user = await userService.getUserByUsername(credentials.username);
          if (!user) {
            return null;
          }

          // Verify password
          const isPasswordValid = await userService.verifyPassword(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          // Return user object (password will be excluded)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.full_name,
            username: user.username,
            role: user.role,
            roleData: user.role_data
          }
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    // Force unencrypted JWT instead of encrypted JWE
    encode: async ({ secret, token }) => {
      const jwt = require('jsonwebtoken');
      return jwt.sign(token, secret);
    },
    decode: async ({ secret, token }) => {
      const jwt = require('jsonwebtoken');
      try {
        return jwt.verify(token, secret);
      } catch (error) {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user role and other data in the token
      if (user) {
        token.role = user.role
        token.username = user.username
        token.roleData = user.roleData
      }
      return token
    },
    async session({ session, token }) {
      // Send user role and other data to the client
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.username = token.username
        session.user.roleData = token.roleData
        
        // Store the raw token data for frontend to create JWT
        session.tokenData = {
          sub: token.sub,
          email: token.email,
          name: token.name,
          username: token.username,
          role: token.role,
          roleData: token.roleData
        };
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions }
