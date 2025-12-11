import { NextResponse } from 'next/server';
import practiceVocabulary from '@/data/practice-vocabulary.json';
import prisma from '@/lib/prisma';
import type { PracticeItem, PracticeAudioClip } from '@mk/api-client';
import type { PracticeAudio } from '@prisma/client';

function clipFromRecord(clip: PracticeAudio): PracticeAudioClip {
  return {
    url: clip.cdnUrl,
    slowUrl: clip.slowUrl ?? undefined,
    waveform: (clip.waveform as number[] | null) ?? undefined,
    duration: clip.duration ?? undefined,
    autoplay: true,
    speaker: clip.speaker ?? undefined,
    sourceType:
      clip.sourceType && clip.sourceType !== 'human'
        ? (clip.sourceType as PracticeAudioClip['sourceType'])
        : 'human',
  };
}

const FALLBACK_AUDIO_INDEX: Record<string, PracticeAudioClip> = {};

async function getAudioIndex(): Promise<Record<string, PracticeAudioClip>> {
  try {
    const clips = await prisma.practiceAudio.findMany({
      where: { status: 'published' },
      orderBy: { updatedAt: 'desc' },
    });
    if (!clips.length) {
      return FALLBACK_AUDIO_INDEX;
    }
    return clips.reduce<Record<string, PracticeAudioClip>>((acc, clip) => {
      acc[clip.promptId] = clipFromRecord(clip);
      return acc;
    }, {});
  } catch (error) {
    console.error('[PracticePromptsAPI] Failed to fetch audio metadata', error);
    return FALLBACK_AUDIO_INDEX;
  }
}

export async function GET() {
  const audioIndex = await getAudioIndex();

  try {
    // Fetch all active vocabulary from database
    const vocabItems = await prisma.practiceVocabulary.findMany({
      where: { isActive: true },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    // Map database items to PracticeItem format
    const prompts: PracticeItem[] = vocabItems.map((item) => {
      const id = item.id;
      return {
        id,
        macedonian: item.macedonian,
        english: item.english,
        category: item.category ?? undefined,
        difficulty: item.difficulty ?? 'mixed',
        audioClip: audioIndex[id] ?? null,
      };
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('[PracticePromptsAPI] Failed to fetch vocabulary from database, using fallback', error);
    // Fallback to static JSON if database query fails
    const prompts = (practiceVocabulary as PracticeItem[]).map((item, index) => {
      const id = item.id ?? `prompt-${index + 1}`;
      return {
        ...item,
        id,
        difficulty: item.difficulty ?? 'mixed',
        audioClip: audioIndex[id] ?? null,
      };
    });
    return NextResponse.json(prompts);
  }
}
// @ts-nocheck
