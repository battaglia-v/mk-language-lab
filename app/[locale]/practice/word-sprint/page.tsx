import { WordSprintSession } from '@/components/practice/word-sprint/WordSprintSession';
import type { Difficulty, SessionLength } from '@/components/practice/word-sprint/types';

type WordSprintPageProps = {
  searchParams?: {
    difficulty?: string;
    length?: string;
  };
};

const parseDifficulty = (value?: string): Difficulty | undefined => {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }
  return undefined;
};

const parseLength = (value?: string): SessionLength | undefined => {
  if (value === '10') return 10;
  if (value === '20') return 20;
  return undefined;
};

export default function WordSprintPage({ searchParams }: WordSprintPageProps) {
  const initialDifficulty = parseDifficulty(searchParams?.difficulty);
  const initialCount = parseLength(searchParams?.length);
  return <WordSprintSession initialDifficulty={initialDifficulty} initialCount={initialCount ?? 10} />;
}
