import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import connectDB from './mongodb'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          await connectDB()
          // Dynamic import avoids edge-runtime issues
          const UserModel = (await import('@/models/User')).default
          const user = await UserModel.findOne({
            email: (credentials.email as string).toLowerCase(),
            active: true,
          })
          if (user) {
            const ok = await user.comparePassword(credentials.password as string)
            if (!ok) return null
            return { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
          }
          // Fallback: .env admin (used before first DB user created)
          const adminEmail    = process.env.ADMIN_EMAIL
          const adminPassword = process.env.ADMIN_PASSWORD
          if (adminEmail && adminPassword &&
              credentials.email === adminEmail &&
              credentials.password === adminPassword) {
            return { id: 'env-admin', name: 'Admin', email: adminEmail, role: 'admin' }
          }
          return null
        } catch (e) {
          console.error('Auth error:', e)
          return null
        }
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.sub
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isDashboard) return isLoggedIn
      return true
    },
  },
  session: { strategy: 'jwt' },
})
