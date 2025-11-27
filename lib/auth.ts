import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
const facebookClientId = process.env.AUTH_FACEBOOK_ID ?? process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.AUTH_FACEBOOK_SECRET ?? process.env.FACEBOOK_CLIENT_SECRET;
let authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === 'production' ? undefined : 'development-auth-secret');

function reportAuthConfigurationIssue(message: string, extra?: Record<string, unknown>) {
  const details = extra ? { extra } : undefined;

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[AUTH CONFIG]', message, extra ?? '');
  } else {
    console.error('[AUTH CONFIG]', message, extra ?? '');
  }

  try {
    Sentry.captureMessage(message, {
      level: 'error',
      ...details,
    });
  } catch (error) {
    console.error('[AUTH CONFIG] Failed to report issue to Sentry', error);
  }
}

const providers = [];

const googleConfigReady = Boolean(googleClientId && googleClientSecret);
if (googleConfigReady) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  );
} else {
  reportAuthConfigurationIssue('Google provider is not fully configured.', {
    googleClientIdPresent: Boolean(googleClientId),
    googleClientSecretPresent: Boolean(googleClientSecret),
  });
}

const facebookConfigReady = Boolean(facebookClientId && facebookClientSecret);
if (facebookClientId || facebookClientSecret) {
  if (facebookConfigReady) {
    providers.push(
      Facebook({
        clientId: facebookClientId,
        clientSecret: facebookClientSecret,
      })
    );
  } else {
    reportAuthConfigurationIssue('Facebook provider is not fully configured.', {
      facebookClientIdPresent: Boolean(facebookClientId),
      facebookClientSecretPresent: Boolean(facebookClientSecret),
    });
  }
}

providers.push(
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      } catch (error) {
        console.error('[AUTH] Credentials authorize error:', error);
        return null;
      }
    },
  })
);

if (!authSecret && process.env.NODE_ENV === 'production' && process.env.CI) {
  authSecret = crypto.randomBytes(32).toString('hex');
  reportAuthConfigurationIssue(
    'Authentication secret is missing. Generated a temporary secret for build-time checks. Set AUTH_SECRET or NEXTAUTH_SECRET.',
    { fallbackGenerated: true }
  );
}

if (!authSecret) {
  reportAuthConfigurationIssue('Authentication secret is missing. Set AUTH_SECRET or NEXTAUTH_SECRET.');

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Authentication secret is required in production environments.');
  }
}

if (!providers.length) {
  const error = new Error('No authentication providers are configured.');
  reportAuthConfigurationIssue(error.message);
  throw error;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers,
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
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
  secret: authSecret,
  debug: process.env.NODE_ENV === 'development', // Enable debug mode only in development
  events: {
    async signIn({ user, account }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH EVENT] Sign in successful:', { userId: user.id, provider: account?.provider });
      }
    },
    async createUser({ user }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH EVENT] User created:', { userId: user.id });
      }
    },
    async linkAccount({ user, account }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH EVENT] Account linked:', { userId: user.id, provider: account.provider });
      }
    },
  },
  logger: {
    error(error) {
      console.error('[AUTH ERROR]', error.name, error.message);
      console.error('[AUTH ERROR STACK]', error.stack);

      try {
        Sentry.captureException(error);
      } catch (captureError) {
        console.error('[AUTH LOGGER] Failed to capture error in Sentry', captureError);
      }
    },
    warn(code) {
      console.warn('[AUTH WARN]', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH DEBUG]', code, metadata);
      }
    },
  },
});
