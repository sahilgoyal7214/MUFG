import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Mock user database - in production, replace with real database
const users = [
  {
    id: "1",
    username: "member1",
    email: "member1@mufg.com",
    password: "password123", // In production, this would be hashed
    role: "member",
    name: "John Member",
    memberData: {
      memberId: "M001",
      age: 34,
      salary: 65000,
      contribution: 520,
      balance: 45200,
      riskLevel: "Medium",
      employment: "Full-time"
    }
  },
  {
    id: "2",
    username: "advisor1", 
    email: "advisor1@mufg.com",
    password: "password123",
    role: "advisor",
    name: "Jane Advisor",
    advisorData: {
      totalClients: 247,
      assetsUnderManagement: 45200000,
      avgPerformance: 7.8,
      clientsNeedingReview: 18
    }
  },
  {
    id: "3",
    username: "regulator1",
    email: "regulator1@mufg.com", 
    password: "password123",
    role: "regulator",
    name: "Robert Regulator",
    regulatorData: {
      totalSchemes: 1247,
      complianceRate: 94.2,
      pendingReviews: 73,
      riskAlerts: 12
    }
  }
]

const handler = NextAuth({
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

        // Find user by username
        const user = users.find(
          u => u.username === credentials.username && u.password === credentials.password
        )

        if (!user) {
          return null
        }

        // Return user object (password will be excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          memberData: user.memberData,
          advisorData: user.advisorData,
          regulatorData: user.regulatorData,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user role and other data in the token
      if (user) {
        token.role = user.role
        token.username = user.username
        token.memberData = user.memberData
        token.advisorData = user.advisorData
        token.regulatorData = user.regulatorData
      }
      return token
    },
    async session({ session, token }) {
      // Send user role and other data to the client
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.username = token.username
        session.user.memberData = token.memberData
        session.user.advisorData = token.advisorData
        session.user.regulatorData = token.regulatorData
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
