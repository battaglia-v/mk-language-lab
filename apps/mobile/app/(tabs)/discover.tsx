import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeCard, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import {
  useDiscoverFeedQuery,
  getLocalDiscoverFeed,
  useNewsFeedQuery,
  getLocalNewsFeed,
  type DiscoverCard,
  type DiscoverEvent,
  type DiscoverLinkTarget,
} from '@mk/api-client';
import { DiscoverFilterRow, DiscoverCardList, UpcomingEvents } from '../../features/discover';
import { HeadlinesSection } from '../../features/news/HeadlinesSection';
import { getApiBaseUrl } from '../../lib/api';
import { useQueryHydration } from '../../lib/queryClient';
import { authenticatedFetch } from '../../lib/auth';

export default function DiscoverScreen() {
  const router = useRouter();
  const apiBaseUrl = getApiBaseUrl();
  const isApiConfigured = Boolean(apiBaseUrl);
  const { isHydrated } = useQueryHydration();
  const {
    data,
    error: discoverError,
  } = useDiscoverFeedQuery({
    baseUrl: apiBaseUrl ?? undefined,
    enabled: isApiConfigured,
    fetcher: authenticatedFetch,
  });
  const feed = useMemo(
    () => data ?? (!isApiConfigured ? getLocalDiscoverFeed() : { categories: [], events: [] }),
    [data, isApiConfigured]
  );
  const categories = useMemo(() => feed.categories ?? [], [feed]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? 'culture');

  useEffect(() => {
    if (!categories.some((category) => category.id === selectedCategoryId) && categories[0]) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === selectedCategoryId) ?? categories[0];
  }, [categories, selectedCategoryId]);

  const events = useMemo(() => feed.events ?? [], [feed]);
  const {
    data: newsData,
    isLoading: isNewsLoading,
    error: newsError,
    refetch: refetchNews,
  } = useNewsFeedQuery({
    baseUrl: apiBaseUrl ?? undefined,
    enabled: isApiConfigured,
    fetcher: authenticatedFetch,
  });
  const newsItems = newsData ?? (!isApiConfigured ? getLocalNewsFeed() : []);
  const isRestoring = isApiConfigured && !isHydrated && !data;
  const handleRefreshNews = isApiConfigured ? () => void refetchNews() : undefined;
  const openTarget = useCallback(
    (target?: DiscoverLinkTarget, url?: string | null) => {
      switch (target) {
        case 'practice':
          router.push('/(tabs)/practice');
          return;
        case 'translator':
          router.push('/(modals)/translator-history');
          return;
        case 'profile':
          router.push('/(tabs)/profile');
          return;
        case 'discover':
          router.push('/(tabs)/discover');
          return;
        case 'mission-settings':
          router.push('/(modals)/mission-settings');
          return;
        case 'external':
          if (url) {
            void Linking.openURL(url);
          }
          return;
        default:
          if (url) {
            if (url.startsWith('http')) {
              void Linking.openURL(url);
            } else {
              router.push(mapWebPathToAppRoute(url));
            }
          } else {
            router.push('/(tabs)/practice');
          }
      }
    },
    [router]
  );

  const handleCardAction = useCallback(
    (card: DiscoverCard) => {
      openTarget(card.ctaTarget, card.ctaUrl);
    },
    [openTarget]
  );

  const handleEventAction = useCallback(
    (event: DiscoverEvent) => {
      openTarget(event.ctaTarget, event.ctaUrl);
    },
    [openTarget]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          Discover
        </NativeTypography>
        <NativeTypography variant="body" style={styles.body}>
          Curated drops from professors, journalists, and study groups. Tap a filter to shape your queue.
        </NativeTypography>
        {!isApiConfigured ? (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.warningText}>
              Configure `EXPO_PUBLIC_API_BASE_URL` to pull Discover + News content from the Next.js API. Fixture data is shown for preview only.
            </NativeTypography>
          </NativeCard>
        ) : null}
        {isRestoring ? (
          <NativeTypography variant="caption" style={styles.hydrationNotice}>
            Restoring cached discover data…
          </NativeTypography>
        ) : null}
        {discoverError ? (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.warningText}>
              Unable to load Discover content: {discoverError.message}
            </NativeTypography>
          </NativeCard>
        ) : null}

        {categories.length > 0 ? (
          <DiscoverFilterRow
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        ) : (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.warningText}>
              Discover cards will appear once lessons are synced from the CMS.
            </NativeTypography>
          </NativeCard>
        )}

        {selectedCategory ? (
          <View style={styles.section}>
            <NativeTypography variant="title" style={styles.sectionTitle}>
              {selectedCategory.label}
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.sectionSummary}>
              {selectedCategory.summary}
            </NativeTypography>
            <DiscoverCardList cards={selectedCategory.cards} onSelectCard={handleCardAction} />
          </View>
        ) : null}

        <View style={styles.section}>
          <NativeTypography variant="title" style={styles.sectionTitle}>
            Upcoming events
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.sectionSummary}>
            Live study groups, AMAs, and quests from the next two weeks.
          </NativeTypography>
          <UpcomingEvents
            events={events}
            formatter={new Intl.DateTimeFormat(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
            onSelectEvent={handleEventAction}
          />
        </View>

        <View style={styles.section}>
          <NativeTypography variant="title" style={styles.sectionTitle}>
            Headlines
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.sectionSummary}>
            Bite-size coverage from Time.mk and Meta.mk with quick links to the full stories.
          </NativeTypography>
          {newsError ? (
            <NativeTypography variant="caption" style={styles.hydrationNotice}>
              Unable to fetch headlines: {newsError.message}
            </NativeTypography>
          ) : null}
          <HeadlinesSection
            items={newsItems}
            isLoading={isNewsLoading}
            emptyMessage={
              !isApiConfigured
                ? 'Headlines use local fixtures until EXPO_PUBLIC_API_BASE_URL is configured.'
                : 'Headlines arrive as soon as the newsroom updates.'
            }
            onRefresh={handleRefreshNews}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.creamLight },
  container: { flexGrow: 1, padding: spacingScale.xl, gap: spacingScale.lg },
  hero: { color: brandColors.navy },
  body: { color: 'rgba(16,24,40,0.85)' },
  hydrationNotice: { color: 'rgba(16,24,40,0.6)' },
  warningCard: { gap: spacingScale.xs },
  warningText: { color: brandColors.navy },
  section: { gap: spacingScale.sm },
  sectionTitle: { color: brandColors.navy },
  sectionSummary: { color: 'rgba(16,24,40,0.7)' },
});

function mapWebPathToAppRoute(path: string): string {
  switch (path) {
    case '/practice':
      return '/(tabs)/practice';
    case '/translator/history':
      return '/(modals)/translator-history';
    case '/mission/settings':
      return '/(modals)/mission-settings';
    case '/profile':
    case '/profile/badges':
      return '/(tabs)/profile';
    default:
      return path.startsWith('/') ? path : `/${path}`;
  }
}
