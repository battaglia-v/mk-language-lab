import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { PracticeAudio } from '@prisma/client';

type PracticeAudioResponse = {
  id: string;
  promptId: string;
  language: string;
  speaker: string | null;
  speed: string | null;
  variant: string | null;
  duration: number | null;
  status: PracticeAudio['status'];
  sourceType: PracticeAudio['sourceType'];
  cdnUrl: string;
  slowUrl: string | null;
  waveform: number[] | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
};

const FALLBACK_AUDIO: PracticeAudioResponse[] = [];

function serializeRecord(record: PracticeAudio): PracticeAudioResponse {
  return {
    id: record.id,
    promptId: record.promptId,
    language: record.language ?? 'mk',
    speaker: record.speaker ?? null,
    speed: record.speed ?? null,
    variant: record.variant ?? null,
    duration: record.duration ?? null,
    status: record.status,
    sourceType: record.sourceType,
    cdnUrl: record.cdnUrl,
    slowUrl: record.slowUrl ?? null,
    waveform: (record.waveform as number[] | null) ?? null,
    notes: record.notes ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt ?? null,
  };
}

export async function GET(request: NextRequest) {
  const includeAll = request.nextUrl.searchParams.get('all') === '1';
  try {
    const clips = await prisma.practiceAudio.findMany({
      where: includeAll ? undefined : { status: 'published' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!clips.length) {
      return NextResponse.json(FALLBACK_AUDIO);
    }

    return NextResponse.json(clips.map(serializeRecord));
  } catch (error) {
    console.error('[PracticeAudioAPI] Failed to fetch clips', error);
    return NextResponse.json(FALLBACK_AUDIO, { status: 200 });
  }
}
