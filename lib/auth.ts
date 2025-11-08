import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  // Temporarily comment out custom pages to debug redirect issue
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error',
  // },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On initial sign-in, create/update user in database
      if (user && account && profile) {
        try {
          // Find or create user
          const dbUser = await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: profile.email_verified ? new Date() : null,
            },
          });

          // Create or update OAuth account link
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              token_type: account.token_type,
              scope: account.scope,
            },
            create: {
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              token_type: account.token_type,
              scope: account.scope,
            },
          });

          // Store database user ID and role in token
          token.userId = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.role = dbUser.role;

          console.log('[AUTH] User persisted to database:', { userId: dbUser.id, email: dbUser.email });
        } catch (error) {
          console.error('[AUTH] Error persisting user to database:', error);
          // Continue with sign-in even if database write fails
          token.userId = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
          token.role = 'user'; // Default to user role if database write fails
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from JWT to session
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = (token.role as string) || 'user';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // JWT sessions for serverless compatibility
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
