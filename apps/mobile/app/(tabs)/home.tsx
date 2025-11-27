import { useCallback, useEffect, useMemo } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeCard, NativeTypography } from '@mk/ui';
import { brandColors, semanticColors, spacingScale } from '@mk/tokens';
import {
  useMissionStatusQuery,
  getLocalMissionStatus,
  type MissionStatus,
  useDiscoverFeedQuery,
  getLocalDiscoverFeed,
  useNewsFeedQuery,
  getLocalNewsFeed,
  type DiscoverCard,
  type DiscoverEvent,
} from '@mk/api-client';
import {
  MissionHeroCard,
  CoachTipsCarousel,
  SmartReviewRail,
  CommunityHighlights,
  QuickActionsGrid,
  type MissionStats,
  type CoachTip,
  type ReviewCluster,
  type CommunityHighlight,
} from '../../features/home';
import { DiscoverCardList, UpcomingEvents } from '../../features/discover';
import { HeadlinesSection } from '../../features/news/HeadlinesSection';
import { getApiBaseUrl } from '../../lib/api';
import { useNotifications } from '../../lib/notifications';
import { useQueryHydration } from '../../lib/queryClient';
import { authenticatedFetch } from '../../lib/auth';
import { openDiscoverTarget } from '../../lib/deepLinks';

export default function HomeScreen() {
  const router = useRouter();
  const apiBaseUrl = getApiBaseUrl();
  const isApiConfigured = Boolean(apiBaseUrl);
  const { isHydrated } = useQueryHydration();
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useMissionStatusQuery({ baseUrl: apiBaseUrl ?? undefined, enabled: isApiConfigured, fetcher: authenticatedFetch });
  const mission = data ?? (!isApiConfigured ? getLocalMissionStatus() : null);
  const { scheduleMissionReminder } = useNotifications();
  const isRestoring = isApiConfigured && !isHydrated && !data;
  const {
    data: discoverData,
    error: discoverError,
    isLoading: isDiscoverLoading,
    isFetching: isDiscoverFetching,
    refetch: refetchDiscover,
  } = useDiscoverFeedQuery({ baseUrl: apiBaseUrl ?? undefined, enabled: isApiConfigured, fetcher: authenticatedFetch });
  const discoverFallback = useMemo(() => getLocalDiscoverFeed(), []);
  const discoverFeed = discoverData ?? (!isApiConfigured || discoverError ? discoverFallback : null);
  const spotlightCategory = discoverFeed?.categories?.[0];
  const spotlightCards = spotlightCategory?.cards?.slice(0, 2) ?? [];
  const spotlightEvents = discoverFeed?.events?.slice(0, 2) ?? [];
  const discoverNotice = !discoverData && discoverFeed === discoverFallback ? 'Using cached Discover cards until the API responds.' : undefined;
  const {
    data: newsData,
    error: newsError,
    isLoading: isNewsLoading,
    isFetching: isNewsFetching,
    refetch: refetchNews,
  } = useNewsFeedQuery({ baseUrl: apiBaseUrl ?? undefined, enabled: isApiConfigured, fetcher: authenticatedFetch });
  const newsFallback = useMemo(() => getLocalNewsFeed(), []);
  const newsItems = newsData ?? (!isApiConfigured || newsError ? newsFallback : []);
  const newsNotice = !newsData && newsItems === newsFallback ? 'Headlines fall back to fixtures until the newsroom syncs.' : undefined;
  const discoverEventFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    []
  );

  const missionStats = mission ? mapMissionToHeroStats(mission) : null;
  const coachTips: CoachTip[] = mission?.coachTips ?? [];
  const reviewClusters: ReviewCluster[] = (mission?.reviewClusters ?? []).map((cluster) => ({
    ...cluster,
    accuracy: Math.round(cluster.accuracy * 100),
  }));
  const communityHighlights: CommunityHighlight[] = mission?.communityHighlights ?? [];
  const openPractice = useCallback(() => router.push('/(tabs)/practice'), [router]);
  const openPracticeSettings = useCallback(() => router.push('/(modals)/practice-settings'), [router]);
  const openTranslatorHistory = useCallback(() => router.push('/(modals)/translator-history'), [router]);
  const openMissionSettings = useCallback(() => router.push('/(modals)/mission-settings'), [router]);
  const quickActions = useMemo(
    () =>
      mission
        ? [
            {
              id: 'continue',
              title: 'Continue mission',
              description: 'Jump back into your Quick Practice deck.',
              icon: <Ionicons name="play" size={22} color={brandColors.red} />,
              onPress: openPractice,
              accent: 'primary' as const,
              disabled: isLoading || isFetching,
            },
            {
              id: 'translator',
              title: 'Translator inbox',
              description: 'Review saved phrases and weak vocab.',
              icon: <Ionicons name="chatbubble-ellipses-outline" size={22} color={brandColors.navy} />,
              onPress: openTranslatorHistory,
              accent: 'secondary' as const,
            },
            {
              id: 'reminders',
              title: 'Reminder windows',
              description: 'Adjust streak nudges and deadlines.',
              icon: <Ionicons name="notifications-outline" size={22} color={brandColors.goldDark} />,
              onPress: openMissionSettings,
              accent: 'secondary' as const,
            },
          ]
        : [],
    [mission, isFetching, isLoading, openMissionSettings, openPractice, openTranslatorHistory]
  );

  useEffect(() => {
    if (mission) {
      void scheduleMissionReminder(mission);
    }
  }, [mission, scheduleMissionReminder]);

  const handleDiscoverCard = useCallback(
    (card: DiscoverCard) => {
      openDiscoverTarget(router, card.ctaTarget, card.ctaUrl);
    },
    [router]
  );

  const handleDiscoverEvent = useCallback(
    (event: DiscoverEvent) => {
      openDiscoverTarget(router, event.ctaTarget, event.ctaUrl);
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.container}>
          <HomeAppBar />
          {!isApiConfigured ? (
            <NativeCard style={styles.warningCard}>
              <NativeTypography variant="body" style={styles.warningText}>
                Configure `EXPO_PUBLIC_API_BASE_URL` to load your live mission data. Fixture content is shown for preview only.
              </NativeTypography>
            </NativeCard>
          ) : null}
          {isRestoring ? (
            <NativeTypography variant="caption" style={styles.hydrationNotice}>
              Restoring cached mission data…
            </NativeTypography>
          ) : null}
          {error ? (
            <NativeCard style={styles.warningCard}>
              <NativeTypography variant="body" style={styles.warningText}>
                Unable to load mission data: {error.message}
              </NativeTypography>
            </NativeCard>
          ) : null}
          {missionStats ? (
            <MissionHeroCard
              stats={missionStats}
              onContinue={openPractice}
              onOpenPracticeSettings={openPracticeSettings}
              onOpenTranslatorHistory={openTranslatorHistory}
              onOpenMissionSettings={openMissionSettings}
            />
          ) : (
            <NativeCard style={styles.warningCard}>
              <NativeTypography variant="body" style={styles.warningText}>
                Mission data will appear once the API responds. Pull to refresh if the issue persists.
              </NativeTypography>
            </NativeCard>
          )}

          <View style={styles.section}>
            <QuickActionsGrid actions={quickActions} isLoading={isLoading} />
          </View>

          <View style={styles.section}>
            <CoachTipsCarousel tips={coachTips} />
          </View>

          <View style={styles.section}>
            <SmartReviewRail clusters={reviewClusters} onSelectCluster={() => router.push('/(tabs)/practice')} />
          </View>

          <View style={styles.section}>
            <CommunityHighlights items={communityHighlights} />
          </View>

          <View style={styles.section}>
            <NativeTypography variant="eyebrow" style={styles.sectionEyebrow}>
              Discover spotlight
            </NativeTypography>
            {discoverNotice ? (
              <NativeTypography variant="caption" style={styles.sectionCaption}>
                {discoverNotice}
              </NativeTypography>
            ) : null}
            {isDiscoverLoading && !discoverFeed ? (
              <NativeTypography variant="caption" style={styles.sectionCaption}>
                Loading curated drops…
              </NativeTypography>
            ) : null}
            {spotlightCards.length ? (
              <>
                <DiscoverCardList cards={spotlightCards} onSelectCard={handleDiscoverCard} />
                <UpcomingEvents
                  events={spotlightEvents}
                  formatter={discoverEventFormatter}
                  onSelectEvent={handleDiscoverEvent}
                />
                {isDiscoverFetching ? (
                  <NativeTypography variant="caption" style={styles.sectionCaption}>
                    Refreshing…
                  </NativeTypography>
                ) : null}
              </>
            ) : (
              <NativeCard style={styles.warningCard}>
                <NativeTypography variant="body" style={styles.warningText}>
                  Discover cards will surface here once the feed syncs.
                </NativeTypography>
                {isApiConfigured ? (
                  <Pressable onPress={() => void refetchDiscover()}>
                    <NativeTypography variant="caption" style={styles.sectionCaption}>
                      Retry now
                    </NativeTypography>
                  </Pressable>
                ) : null}
              </NativeCard>
            )}
          </View>

          <View style={styles.section}>
            <NativeTypography variant="eyebrow" style={styles.sectionEyebrow}>
              Headlines
            </NativeTypography>
            {newsNotice ? (
              <NativeTypography variant="caption" style={styles.sectionCaption}>
                {newsNotice}
              </NativeTypography>
            ) : null}
            {newsError && isApiConfigured ? (
              <NativeTypography variant="caption" style={styles.sectionCaption}>
                Unable to refresh headlines: {newsError.message}
              </NativeTypography>
            ) : null}
            <HeadlinesSection
              items={newsItems}
              isLoading={isNewsLoading}
              onRefresh={isApiConfigured ? () => void refetchNews() : undefined}
              emptyMessage="Headlines appear here as soon as the newsroom updates."
            />
            {isNewsFetching ? (
              <NativeTypography variant="caption" style={styles.sectionCaption}>
                Checking for new stories…
              </NativeTypography>
            ) : null}
          </View>
        </ScrollView>
        <FloatingContinuePill
          onPress={() => router.push('/(tabs)/practice')}
          disabled={!mission || isLoading || isFetching}
        />
      </View>
    </SafeAreaView>
  );
}

function mapMissionToHeroStats(mission: MissionStatus): MissionStats {
  return {
    missionName: mission.name,
    xpEarned: mission.xp.earned,
    xpTarget: mission.xp.target,
    streakDays: mission.streakDays,
    heartsRemaining: mission.heartsRemaining,
    translatorDirection: mission.translatorDirection,
    checklist: mission.checklist.map((item) => item.label),
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brandColors.background,
  },
  page: {
    flex: 1,
  },
  container: {
    padding: spacingScale.xl,
    gap: spacingScale.xl,
    paddingBottom: spacingScale['3xl'],
  },
  hydrationNotice: {
    color: brandColors.textMuted,
  },
  warningCard: {
    gap: spacingScale.xs,
  },
  warningText: {
    color: brandColors.text,
  },
  section: {
    gap: spacingScale.sm,
  },
  sectionEyebrow: {
    color: brandColors.red,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionCaption: {
    color: 'rgba(16,24,40,0.6)',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarEyebrow: {
    color: brandColors.goldDark,
  },
  appBarTitle: {
    color: brandColors.navy,
  },
  appBarActions: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingPill: {
    position: 'absolute',
    bottom: spacingScale.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.xs,
    paddingHorizontal: spacingScale['2xl'],
    paddingVertical: spacingScale.sm,
    borderRadius: 999,
    backgroundColor: brandColors.accent,
    shadowColor: brandColors.accentEmphasis,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingPillText: {
    color: semanticColors.textOnPrimary,
  },
  floatingPillDisabled: {
    opacity: 0.4,
  },
});

function HomeAppBar() {
  return (
    <View style={styles.appBar}>
      <View>
        <NativeTypography variant="eyebrow" style={styles.appBarEyebrow}>
          Добредојде назад
        </NativeTypography>
        <NativeTypography variant="title" style={styles.appBarTitle}>
          Nova
        </NativeTypography>
      </View>
      <View style={styles.appBarActions}>
        <IconButton label="Switch locale" icon="globe-outline" />
        <IconButton label="Inbox" icon="mail-unread-outline" />
      </View>
    </View>
  );
}

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function IconButton({ icon, label }: IconButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.iconButton}>
      <Ionicons name={icon} size={18} color={brandColors.navy} />
    </Pressable>
  );
}

type FloatingContinuePillProps = {
  onPress: () => void;
  disabled?: boolean;
};

function FloatingContinuePill({ onPress, disabled }: FloatingContinuePillProps) {
  return (
    <Pressable
      style={[styles.floatingPill, disabled && styles.floatingPillDisabled]}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      disabled={disabled}
    >
      <Ionicons name="play" size={18} color={brandColors.cream} />
      <NativeTypography variant="body" style={styles.floatingPillText}>
        Continue
      </NativeTypography>
    </Pressable>
  );
}
