// @ts-nocheck
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fallbackMissionStatus from '@/data/mission-status.json';
import type { MissionStatus, MissionChecklistItem, MissionCoachTip, MissionCommunityHighlight } from '@mk/api-client';
import type { ExerciseAttempt, GameProgress, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const FALLBACK_MISSION = fallbackMissionStatus as MissionStatus;
const XP_PER_REVIEW = 12;
const MIN_XP_TARGET = 300;

export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const payload = await buildMissionPayload(session.user.id);
    return NextResponse.json(payload, {
      headers: {
        'x-mission-source': 'prisma',
      },
    });
  } catch (error) {
    console.error('[api.missions.current] Falling back to fixture payload', error);
    const fallbackPayload: MissionStatus = {
      ...FALLBACK_MISSION,
      missionId: `${FALLBACK_MISSION.missionId}-fallback`,
    };
    return NextResponse.json(fallbackPayload, {
      headers: {
        'x-mission-source': 'fallback',
      },
    });
  }
}

async function buildMissionPayload(userId: string): Promise<MissionStatus> {
  const now = new Date();
  const todayStart = startOfDay(now);

  const [gameProgress, journeys, lessonProgress, exerciseAttempts] = await Promise.all<[
    GameProgress | null,
    Array<
      Prisma.JourneyProgressGetPayload<{
        include: { currentLesson: { include: { module: true } }; currentModule: true };
      }>
    >,
    Array<
      Prisma.UserLessonProgressGetPayload<{
        include: { lesson: { include: { module: true } } };
      }>
    >,
    ExerciseAttempt[],
  ]>([
    prisma.gameProgress.findUnique({ where: { userId } }),
    prisma.journeyProgress.findMany({
      where: { userId },
      include: {
        currentLesson: { include: { module: true } },
        currentModule: true,
      },
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    }),
    prisma.userLessonProgress.findMany({
      where: { userId },
      include: { lesson: { include: { module: true } } },
    }),
    prisma.exerciseAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'desc' },
      take: 120,
      include: {
        exercise: {
          include: {
            lesson: {
              include: { module: true },
            },
          },
        },
      },
    }),
  ]);

  const activeJourney = journeys.find((journey) => journey.isActive) ?? journeys[0] ?? null;
  const nextLesson = activeJourney?.currentLesson ?? lessonProgress[0]?.lesson ?? null;

  const attemptsToday = exerciseAttempts.filter((attempt) => {
    if (!attempt.attemptedAt) {
      return false;
    }
    return attempt.attemptedAt >= todayStart;
  });

  const xpEarned = attemptsToday.length * XP_PER_REVIEW;
  const dailyGoalMinutes = activeJourney?.dailyGoalMinutes ?? 20;
  const xpTarget = Math.max(MIN_XP_TARGET, dailyGoalMinutes * XP_PER_REVIEW);

  const reviewClusters = extractReviewClusters(exerciseAttempts);
  const checklist = buildChecklist({ nextLesson, lessonProgress, xpEarned, xpTarget });
  const coachTips = buildCoachTips({
    nextLesson,
    xpEarned,
    xpTarget,
    reviewClusters,
    cycleEnd: computeCycleEnd(now),
  });
  const communityHighlights = buildCommunityHighlights({
    streak: gameProgress?.streak ?? 0,
    hearts: gameProgress?.hearts ?? 5,
    journeys,
    reviewClusters,
  });

  return {
    missionId: buildMissionId(userId, todayStart),
    name: nextLesson?.title ?? (activeJourney ? `${titleize(activeJourney.journeyId)} mission` : FALLBACK_MISSION.name),
    cycle: {
      type: 'daily',
      endsAt: computeCycleEnd(now),
    },
    xp: {
      earned: xpEarned,
      target: xpTarget,
    },
    streakDays: gameProgress?.streak ?? 0,
    heartsRemaining: gameProgress?.hearts ?? 5,
    translatorDirection: journeyTranslatorDirection(activeJourney?.journeyId),
    checklist: checklist.length ? checklist : FALLBACK_MISSION.checklist,
    coachTips: coachTips.length ? coachTips : FALLBACK_MISSION.coachTips,
    reviewClusters: reviewClusters.length ? reviewClusters : FALLBACK_MISSION.reviewClusters,
    communityHighlights: communityHighlights.length ? communityHighlights : FALLBACK_MISSION.communityHighlights,
    links: {
      practice: '/practice',
      translatorInbox: '/translator/history',
      settings: '/practice/settings',
    },
  };
}

function buildMissionId(userId: string, todayStart: Date): string {
  const datePart = todayStart.toISOString().slice(0, 10);
  const suffix = userId.slice(-6);
  return `daily-${datePart}-${suffix}`;
}

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function computeCycleEnd(reference: Date): string {
  const end = new Date(reference);
  end.setUTCHours(5, 0, 0, 0);
  if (end <= reference) {
    end.setUTCDate(end.getUTCDate() + 1);
  }
  return end.toISOString();
}

function journeyTranslatorDirection(journeyId?: string | null): string {
  switch (journeyId) {
    case 'travel':
      return 'En → Mk';
    case 'culture':
      return 'Mk ↔ En';
    default:
      return 'Mk → En';
  }
}

type ChecklistContext = {
  nextLesson: {
    id: string;
    title: string;
    module?: { title: string | null } | null;
  } | null;
  lessonProgress: Array<{
    lessonId: string;
    status: string;
  }>;
  xpEarned: number;
  xpTarget: number;
};

function buildChecklist(context: ChecklistContext): MissionChecklistItem[] {
  const items: MissionChecklistItem[] = [];
  const progressMap = new Map(context.lessonProgress.map((progress) => [progress.lessonId, progress.status]));

  if (context.nextLesson) {
    items.push({
      id: `lesson-${context.nextLesson.id}`,
      label: `Complete “${context.nextLesson.title}”`,
      status: normalizeProgressStatus(progressMap.get(context.nextLesson.id)),
    });
  }

  const remainingXp = Math.max(context.xpTarget - context.xpEarned, 0);
  items.push({
    id: 'xp-goal',
    label: remainingXp > 0 ? `Earn ${context.xpTarget} XP today` : 'Daily XP goal complete',
    status: remainingXp === 0 ? 'completed' : context.xpEarned > context.xpTarget * 0.4 ? 'in_progress' : 'pending',
  });

  const reviewLabel = context.nextLesson?.module?.title ?? 'Quick Practice deck';
  items.push({
    id: 'review-drill',
    label: `Review the ${reviewLabel.toLowerCase()}`,
    status: context.xpEarned > 0 ? 'in_progress' : 'pending',
  });

  return items;
}

function normalizeProgressStatus(status?: string): MissionChecklistItem['status'] {
  if (status === 'completed') {
    return 'completed';
  }
  if (status === 'in_progress') {
    return 'in_progress';
  }
  return 'pending';
}

type CoachTipContext = {
  nextLesson: {
    id: string;
    title: string;
    summary: string | null;
    module?: { title: string | null } | null;
  } | null;
  xpEarned: number;
  xpTarget: number;
  reviewClusters: MissionStatus['reviewClusters'];
  cycleEnd: string;
};

function buildCoachTips(context: CoachTipContext): MissionCoachTip[] {
  const tips: MissionCoachTip[] = [];
  const weakestCluster = [...context.reviewClusters].sort((a, b) => a.accuracy - b.accuracy)[0];
  const deadlineLabel = new Date(context.cycleEnd).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (context.nextLesson) {
    tips.push({
      id: `coach-${context.nextLesson.id}`,
      title: context.nextLesson.module?.title ?? 'Coach Jana',
      body:
        context.nextLesson.summary ??
        `Skim the key phrases before jumping into “${context.nextLesson.title}”.`,
      tag: 'Lesson',
    });
  }

  if (weakestCluster) {
    tips.push({
      id: `cluster-${weakestCluster.id}`,
      title: `${weakestCluster.label} refresh`,
      body: `You’re at ${Math.round(weakestCluster.accuracy * 100)}% accuracy. Re-run the drill with focused listening.`,
      tag: 'Review',
    });
  }

  tips.push({
    id: 'streak-tip',
    title: 'Streak saver',
    body: context.xpEarned >= context.xpTarget
      ? 'Great work! Keep stacking extra XP to climb the leaderboard.'
      : `Bank the remaining ${Math.max(context.xpTarget - context.xpEarned, 0)} XP before ${deadlineLabel} to protect the streak.`,
    tag: 'Streak',
  });

  return tips;
}

type CommunityContext = {
  streak: number;
  hearts: number;
  journeys: Array<{
    id: string;
    journeyId: string;
    isActive: boolean;
    totalMinutes: number;
  }>;
  reviewClusters: MissionStatus['reviewClusters'];
};

function buildCommunityHighlights(context: CommunityContext): MissionCommunityHighlight[] {
  const highlights: MissionCommunityHighlight[] = [];
  const activeJourney = context.journeys.find((journey) => journey.isActive) ?? context.journeys[0];
  const strongestCluster = [...context.reviewClusters].sort((a, b) => b.accuracy - a.accuracy)[0];

  highlights.push({
    id: 'streak',
    title: context.streak > 0 ? `${context.streak}-day streak intact` : 'Streak reset today',
    detail:
      context.streak > 0
        ? 'Finish the XP goal to keep the flame burning.'
        : 'Complete a lesson today to start a new streak.',
    accent: context.streak > 0 ? 'gold' : 'green',
  });

  if (activeJourney) {
    highlights.push({
      id: `journey-${activeJourney.id}`,
      title: `${titleize(activeJourney.journeyId)} journey active`,
      detail: `Logged ${activeJourney.totalMinutes} total minutes so far.`,
      accent: 'green',
    });
  } else {
    highlights.push({
      id: 'journey',
      title: 'Pick a learning journey',
      detail: 'Select Family, Travel, or Culture to unlock guided missions.',
      accent: 'green',
    });
  }

  if (strongestCluster) {
    highlights.push({
      id: `highlight-${strongestCluster.id}`,
      title: `${strongestCluster.label} on a roll`,
      detail: `${Math.round(strongestCluster.accuracy * 100)}% accuracy—share it with your squad.`,
      accent: 'gold',
    });
  } else {
    highlights.push({
      id: 'hearts',
      title: `${context.hearts} hearts remaining`,
      detail: context.hearts === 5 ? 'Full energy—tackle a harder drill.' : 'Refill by finishing a review session.',
      accent: context.hearts > 2 ? 'green' : 'red',
    });
  }

  return highlights.slice(0, 3);
}

function extractReviewClusters(
  attempts: Array<{
    exercise: {
      lesson: {
        module: {
          id: string;
          title: string;
        } | null;
      } | null;
    } | null;
    isCorrect: boolean;
  }>
): MissionStatus['reviewClusters'] {
  const stats = new Map<
    string,
    {
      label: string;
      total: number;
      correct: number;
    }
  >();

  attempts.forEach((attempt) => {
    const lessonModule = attempt.exercise?.lesson?.module;
    if (!lessonModule) {
      return;
    }

    const entry = stats.get(lessonModule.id) ?? { label: lessonModule.title, total: 0, correct: 0 };
    entry.total += 1;
    if (attempt.isCorrect) {
      entry.correct += 1;
    }
    stats.set(lessonModule.id, entry);
  });

  return [...stats.entries()]
    .map(([id, value]) => ({
      id,
      label: value.label,
      accuracy: value.total === 0 ? 0 : value.correct / value.total,
    }))
    .filter((cluster) => cluster.label)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
}

function titleize(value?: string | null): string {
  if (!value) {
    return '';
  }
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
// @ts-nocheck
