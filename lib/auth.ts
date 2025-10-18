import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { JWT } from 'next-auth/jwt';

type ExtendedToken = JWT & {
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  user?: {
    id: string;
  };
  error?: string;
};

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('NEXTAUTH_SECRET is not set. Generate one and add it to your environment variables.');
}

const refreshGoogleAccessToken = async (token: ExtendedToken) => {
  try {
    const url = 'https://oauth2.googleapis.com/token';

    if (!token.refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    } satisfies ExtendedToken;
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const extendedToken = token as ExtendedToken;

      // Initial sign in
      if (account && user) {
        return {
          ...extendedToken,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          refreshToken: account.refresh_token,
          user: { id: user.id ?? extendedToken.user?.id ?? '' },
        } satisfies ExtendedToken;
      }

      if (!extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      // Return previous token if the access token has not expired yet
      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      // Access token has expired, try to update it
      return refreshGoogleAccessToken(extendedToken);
    },
    async session({ session, token }) {
      if (session.user) {
        const extendedToken = token as ExtendedToken;
        session.user.id = extendedToken.user?.id ?? '';
        session.user.accessToken = extendedToken.accessToken;
        session.user.error = extendedToken.error;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
