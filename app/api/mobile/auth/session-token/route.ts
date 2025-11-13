import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { issueMobileAuthToken } from '@/lib/mobile-auth-token';

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, expiresAt } = await issueMobileAuthToken({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: session.user.role,
  });

  return NextResponse.json({ token, expiresAt });
}
