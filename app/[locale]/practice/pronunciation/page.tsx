'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import pronunciationSessionsData from '@/data/pronunciation-sessions.json';

// Match actual JSON structure
interface PronunciationWord {
  id: string;
  macedonian: string;
  transliteration: string;
  english: string;
  phonetic: string;
  audioUrl: string;
}

interface PronunciationSessionData {
  id: string;
  title: string;
  titleMk: string;
  description: string;
  descriptionMk: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  words: PronunciationWord[];
}

// Lazy load the actual session component
import dynamic from 'next/dynamic';
const PronunciationSession = dynamic(
  () => import('@/components/practice/PronunciationSession').then(mod => mod.PronunciationSession),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    ),
  }
);

export default function PronunciationPracticePage() {
  const t = useTranslations('pronunciation');
  const navT = useTranslations('nav');
  const locale = useLocale() as 'en' | 'mk';
  const [activeSession, setActiveSession] = useState<PronunciationSessionData | null>(null);

  const sessions = pronunciationSessionsData as PronunciationSessionData[];

  const difficultyColors = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  const handleStartSession = (session: PronunciationSessionData) => {
    setActiveSession(session);
  };

  const handleEndSession = () => {
    setActiveSession(null);
  };

  const handleComplete = (results: { 
    totalWords: number; 
    completedWords: number; 
    skippedWords: number;
    xpEarned: number;
    averageScore: number;
  }) => {
    // Could save results to database here
    console.log('Session completed:', results);
    setActiveSession(null);
  };

  // Translations for the PronunciationSession component
  const sessionTranslations = useMemo(() => ({
    sessionTitle: (locale === 'mk' ? activeSession?.titleMk : activeSession?.title) ?? '',
    progress: t('exerciseProgress', { current: '{current}', total: '{total}' }),
    listenFirst: t('howItWorks.step1.description'),
    tapToListen: t('listenNative'),
    nowYourTurn: t('howItWorks.step2.title'),
    holdToRecord: t('startRecording'),
    recording: t('stopRecording'),
    releaseTo: t('stopRecording'),
    yourRecording: t('playRecording'),
    playYours: t('playRecording'),
    playReference: t('listenNative'),
    tryAgain: t('tryAgain'),
    soundsGood: t('nextPhrase'),
    skip: navT('skip', { default: 'Skip' }),
    next: t('nextPhrase'),
    micPermissionDenied: 'Microphone permission denied',
    micNotSupported: 'Microphone not supported',
    sessionComplete: t('sessionComplete'),
    greatJob: t('greatWork'),
    wordsCompleted: 'Words Completed',
    wordsSkipped: 'Words Skipped',
    xpEarned: 'XP Earned',
    restart: t('tryAgain'),
    home: t('backToSessions'),
    practiceAgain: t('tryAgain'),
    backToHome: t('backToPractice'),
    perfectScore: t('sessionComplete'),
    keepPracticing: t('greatWork'),
  }), [activeSession, locale, t, navT]);

  // If a session is active, show the full session UI
  if (activeSession) {
    // Convert words to the format expected by PronunciationSession
    const wordsForSession = activeSession.words.map(word => ({
      id: word.id,
      macedonian: word.macedonian,
      transliteration: word.transliteration,
      english: word.english,
      audioUrl: word.audioUrl,
    }));

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-24 sm:pb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndSession}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToSessions')}
          </Button>
        </div>

        <PronunciationSession
          words={wordsForSession}
          title={locale === 'mk' ? activeSession.titleMk : activeSession.title}
          xpPerWord={Math.floor(activeSession.xpReward / activeSession.words.length)}
          onComplete={handleComplete}
          onRestart={() => setActiveSession(activeSession)}
          onHome={handleEndSession}
          t={sessionTranslations}
        />
      </div>
    );
  }

  // Session selection view
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/practice`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backToPractice')}
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* How It Works */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="h-4 w-4 text-accent" />
            {t('howItWorks.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span><strong>{t('howItWorks.step1.title')}</strong> - {t('howItWorks.step1.description')}</span>
          </div>
          <div className="flex items-start gap-2">
            <Mic className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span><strong>{t('howItWorks.step2.title')}</strong> - {t('howItWorks.step2.description')}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 shrink-0 text-center text-accent">▶</span>
            <span><strong>{t('howItWorks.step3.title')}</strong> - {t('howItWorks.step3.description')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('selectSession')}</h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={cn(
                'cursor-pointer border-white/8 bg-white/5 transition-all',
                'hover:border-accent/30 hover:bg-white/8 hover:shadow-lg',
                'active:scale-[0.98]'
              )}
              onClick={() => handleStartSession(session)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    {locale === 'mk' ? session.titleMk : session.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 text-xs', difficultyColors[session.difficulty])}
                  >
                    {t(`difficulty.${session.difficulty}`)}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {locale === 'mk' ? session.descriptionMk : session.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{session.words.length} {t('phrases')}</span>
                  <span>~{Math.ceil(session.words.length * 1.5)} {t('minutes')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="border-white/8 bg-white/5">
        <CardHeader>
          <CardTitle className="text-base">{t('tips.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• {t('tips.tip1')}</p>
          <p>• {t('tips.tip2')}</p>
          <p>• {t('tips.tip3')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
