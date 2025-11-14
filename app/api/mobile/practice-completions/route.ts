import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';

const completionEventSchema = z.object({
  id: z.string().min(1),
  deckId: z.string().min(1),
  category: z.string(),
  mode: z.enum(['typing', 'cloze', 'listening', 'multipleChoice']),
  direction: z.enum(['mkToEn', 'enToMk']),
  difficulty: z.enum(['casual', 'focus', 'blitz']).optional(),
  correctCount: z.number().int().min(0),
  totalAttempts: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  streakDelta: z.number().int(),
  xpEarned: z.number().int().min(0),
  heartsRemaining: z.number().int().min(0),
  completedAt: z.string().datetime(),
});

const requestSchema = z.object({
  events: z.array(completionEventSchema).min(1),
  deviceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth().catch(() => null);
  const mobileSession = session?.user ? null : await getMobileSessionFromRequest(request);

  if (!session?.user && !mobileSession?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id ?? mobileSession?.user?.id;

  try {
    const payload = await request.json();
    const { events, deviceId } = requestSchema.parse(payload);

    console.info('[practice-completions] received batch', {
      userId,
      deviceId: deviceId ?? 'unknown',
      count: events.length,
      lastCompletedAt: events[events.length - 1]?.completedAt,
    });

    return NextResponse.json(
      {
        ok: true,
        accepted: events.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[practice-completions] failed to handle batch', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'Failed to record practice completion' }, { status: 500 });
  }
}
