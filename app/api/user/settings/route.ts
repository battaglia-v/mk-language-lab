import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const settingsSchema = z.object({
  locale: z.enum(['en', 'mk']).optional(),
  dailyGoal: z.number().min(10).max(100).optional(),
});

/**
 * GET /api/user/settings
 *
 * Get the current user's settings (locale, dailyGoal)
 */
export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        locale: true,
        dailyGoal: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      locale: user.locale ?? 'en',
      dailyGoal: user.dailyGoal ?? 20,
    });
  } catch (error) {
    console.error('[api.user.settings] Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/settings
 *
 * Update the current user's settings
 */
export async function PATCH(request: Request) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = settingsSchema.parse(body);

    // Only update fields that were provided
    const updateData: { locale?: string; dailyGoal?: number } = {};
    if (data.locale !== undefined) {
      updateData.locale = data.locale;
    }
    if (data.dailyGoal !== undefined) {
      updateData.dailyGoal = data.dailyGoal;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No settings to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        locale: true,
        dailyGoal: true,
      },
    });

    return NextResponse.json({
      success: true,
      locale: user.locale ?? 'en',
      dailyGoal: user.dailyGoal ?? 20,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[api.user.settings] Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
