import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/currency - Get user's currency balance
 */
export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // Fetch or create currency record
    const currency = await prisma.currency.upsert({
      where: { userId: session.user.id },
      update: {},
      create: {
        userId: session.user.id,
        gems: 0,
        coins: 0,
        lifetimeGemsEarned: 0,
      },
    });

    // Get recent transactions
    const recentTransactions: Awaited<ReturnType<typeof prisma.currencyTransaction.findMany>> = await prisma.currencyTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      currency: {
        gems: currency.gems,
        coins: currency.coins,
        lifetimeGemsEarned: currency.lifetimeGemsEarned,
      },
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        currencyType: tx.currencyType,
        amount: tx.amount,
        reason: tx.reason,
        createdAt: tx.createdAt.toISOString(),
        metadata: tx.metadata ? JSON.parse(tx.metadata) : null,
      })),
    });
  } catch (error) {
    console.error('[api.currency] Failed to fetch currency', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency' },
      { status: 500 }
    );
  }
}
