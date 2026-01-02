import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      paywallEnabled: process.env.ENABLE_PAYWALL === 'true',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

