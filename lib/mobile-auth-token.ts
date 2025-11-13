import { encode } from 'next-auth/jwt';

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type MobileAuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
};

export async function issueMobileAuthToken(user: MobileAuthUser) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured.');
  }

  const token = await encode({
    token: {
      sub: user.id,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      picture: user.image ?? undefined,
      role: user.role ?? undefined,
    },
    secret,
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  const expiresAt = new Date(Date.now() + TOKEN_MAX_AGE_SECONDS * 1000).toISOString();
  return { token, expiresAt };
}

export { TOKEN_MAX_AGE_SECONDS };
