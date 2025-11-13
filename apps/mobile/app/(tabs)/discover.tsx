import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import {
  useDiscoverFeedQuery,
  getLocalDiscoverFeed,
  useNewsFeedQuery,
  getLocalNewsFeed,
} from '@mk/api-client';
import { DiscoverFilterRow, DiscoverCardList, UpcomingEvents } from '../../features/discover';
import { HeadlinesSection } from '../../features/news/HeadlinesSection';
import { getApiBaseUrl } from '../../lib/api';

export default function DiscoverScreen() {
  const apiBaseUrl = getApiBaseUrl();
  const { data } = useDiscoverFeedQuery({ baseUrl: apiBaseUrl ?? undefined });
  const feed = data ?? getLocalDiscoverFeed();
  const categories = useMemo(() => feed.categories ?? [], [feed]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? 'culture'
  );

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
    refetch: refetchNews,
  } = useNewsFeedQuery({ baseUrl: apiBaseUrl ?? undefined });
  const newsItems = newsData ?? getLocalNewsFeed();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          Discover
        </NativeTypography>
        <NativeTypography variant="body" style={styles.body}>
          Curated drops from professors, journalists, and study groups. Tap a filter to shape your queue.
        </NativeTypography>

        {categories.length > 0 ? (
          <DiscoverFilterRow
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        ) : null}

        {selectedCategory ? (
          <View style={styles.section}>
            <NativeTypography variant="title" style={styles.sectionTitle}>
              {selectedCategory.label}
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.sectionSummary}>
              {selectedCategory.summary}
            </NativeTypography>
            <DiscoverCardList cards={selectedCategory.cards} />
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
          />
        </View>

        <View style={styles.section}>
          <NativeTypography variant="title" style={styles.sectionTitle}>
            Headlines
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.sectionSummary}>
            Bite-size coverage from Time.mk and Meta.mk with quick links to the full stories.
          </NativeTypography>
          <HeadlinesSection items={newsItems} isLoading={isNewsLoading} onRefresh={() => void refetchNews()} />
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
  section: { gap: spacingScale.sm },
  sectionTitle: { color: brandColors.navy },
  sectionSummary: { color: 'rgba(16,24,40,0.7)' },
});
