import { NextResponse } from 'next/server';
import practiceVocabulary from '@/data/practice-vocabulary.json';
import practiceAudio from '@/data/practice-audio.json';
import type { PracticeItem, PracticeAudioClip } from '@mk/api-client';

type PracticeAudioRecord = {
  promptId: string;
  cdnUrl: string;
  slowUrl?: string | null;
  waveform?: number[];
  duration?: number;
  autoplay?: boolean;
  speaker?: string;
  sourceType?: 'human' | 'tts' | 'unknown';
};

const audioIndex = (practiceAudio as PracticeAudioRecord[]).reduce<Record<string, PracticeAudioClip>>(
  (acc, clip) => {
    acc[clip.promptId] = {
      url: clip.cdnUrl,
      slowUrl: clip.slowUrl ?? undefined,
      waveform: clip.waveform ?? undefined,
      duration: clip.duration ?? undefined,
      autoplay: clip.autoplay ?? true,
      speaker: clip.speaker ?? undefined,
      sourceType: clip.sourceType ?? 'human',
    };
    return acc;
  },
  {}
);

const prompts = (practiceVocabulary as PracticeItem[]).map((item, index) => {
  const id = item.id ?? `prompt-${index + 1}`;
  return {
    ...item,
    id,
    audioClip: audioIndex[id] ?? null,
  };
});

export async function GET() {
  return NextResponse.json(prompts);
}
