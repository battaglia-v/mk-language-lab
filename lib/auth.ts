import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // TEMPORARILY DISABLED: Testing without Prisma adapter to isolate issue
  // adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      // With JWT strategy, we get token instead of user
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // CHANGED: Using JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true, // Enable debug mode to capture detailed errors
  events: {
    async signIn({ user, account }) {
      console.log('[AUTH EVENT] Sign in successful:', { userId: user.id, provider: account?.provider });
    },
    async createUser({ user }) {
      console.log('[AUTH EVENT] User created:', { userId: user.id });
    },
    async linkAccount({ user, account }) {
      console.log('[AUTH EVENT] Account linked:', { userId: user.id, provider: account.provider });
    },
  },
  logger: {
    error(error) {
      console.error('[AUTH ERROR]', error.name, error.message);
      console.error('[AUTH ERROR STACK]', error.stack);
    },
    warn(code) {
      console.warn('[AUTH WARN]', code);
    },
    debug(code, metadata) {
      console.log('[AUTH DEBUG]', code, metadata);
    },
  },
});
