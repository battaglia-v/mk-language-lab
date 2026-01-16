import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import { getA1Path, getA2Path, getB1Path } from '@/lib/learn/curriculum-path';

export async function GET(request: NextRequest) {
  const mobileSession = await getMobileSessionFromRequest(request);
  if (!mobileSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = mobileSession.user.id;

  // Fetch all curriculum paths with user progress
  const [a1Path, a2Path, b1Path] = await Promise.all([
    getA1Path(userId),
    getA2Path(userId),
    getB1Path(userId),
  ]);

  return NextResponse.json({
    paths: {
      a1: a1Path,
      a2: a2Path,
      b1: b1Path,
    },
  });
}
