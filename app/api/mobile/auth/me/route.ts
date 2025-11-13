import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';

export async function GET(request: NextRequest) {
  const session = await auth().catch(() => null);
  if (session?.user) {
    return NextResponse.json({ user: session.user });
  }

  const mobileSession = await getMobileSessionFromRequest(request);
  if (!mobileSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user: mobileSession.user });
}
