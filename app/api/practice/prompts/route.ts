import { NextResponse } from 'next/server';
import practiceVocabulary from '@/data/practice-vocabulary.json';
import practiceAudio from '@/data/practice-audio.json';
import prisma from '@/lib/prisma';
import type { PracticeItem, PracticeAudioClip } from '@mk/api-client';
import type { PracticeAudio } from '@prisma/client';

type PracticeAudioFixture = {
  promptId: string;
  cdnUrl: string;
  slowUrl?: string | null;
  waveform?: number[];
  duration?: number;
  autoplay?: boolean;
  speaker?: string;
  sourceType?: 'human' | 'tts' | 'unknown';
};

function clipFromRecord(
  clip: PracticeAudioFixture | PracticeAudio
): PracticeAudioClip {
  return {
    url: clip.cdnUrl,
    slowUrl: clip.slowUrl ?? undefined,
    waveform: (clip.waveform as number[] | undefined) ?? undefined,
    duration: clip.duration ?? undefined,
    autoplay: 'autoplay' in clip ? clip.autoplay ?? true : true,
    speaker: clip.speaker ?? undefined,
    sourceType:
      clip.sourceType && clip.sourceType !== 'human'
        ? (clip.sourceType as PracticeAudioClip['sourceType'])
        : 'human',
  };
}

const FALLBACK_AUDIO_INDEX = (practiceAudio as PracticeAudioFixture[]).reduce<
  Record<string, PracticeAudioClip>
>((acc, clip) => {
  acc[clip.promptId] = clipFromRecord(clip);
  return acc;
}, {});

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
  const prompts = (practiceVocabulary as PracticeItem[]).map((item, index) => {
    const id = item.id ?? `prompt-${index + 1}`;
    return {
      ...item,
      id,
      audioClip: audioIndex[id] ?? null,
    };
  });
  return NextResponse.json(prompts);
}
