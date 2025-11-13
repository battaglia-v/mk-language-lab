import { Linking, StyleSheet, View } from 'react-native';
import { NativeButton, NativeCard, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import type { NewsItem } from '@mk/api-client';

type HeadlinesSectionProps = {
  items: NewsItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
};

export function HeadlinesSection({ items, isLoading, onRefresh, emptyMessage }: HeadlinesSectionProps) {
  if (!items.length) {
    return (
      <NativeCard style={styles.emptyCard}>
        <NativeTypography variant="body" style={styles.emptyText}>
          {isLoading ? 'Loading the latest headlines…' : emptyMessage ?? 'Headlines arrive once the newsroom updates.'}
        </NativeTypography>
        {onRefresh ? (
          <NativeButton variant="ghost" onPress={onRefresh}>
            <NativeTypography variant="body" style={styles.refreshText}>
              Refresh
            </NativeTypography>
          </NativeButton>
        ) : null}
      </NativeCard>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <NativeCard key={item.id} style={styles.card}>
          <View style={styles.metaRow}>
            <NativeTypography variant="caption" style={styles.sourceLabel}>
              {item.sourceName}
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.timeLabel}>
              {new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(item.publishedAt))}
            </NativeTypography>
          </View>
          <NativeTypography variant="title" style={styles.title}>
            {item.title}
          </NativeTypography>
          <NativeTypography variant="body" style={styles.summary}>
            {item.description}
          </NativeTypography>
          <NativeButton variant="ghost" style={styles.linkButton} onPress={() => openLink(item.link)}>
            <NativeTypography variant="body" style={styles.linkText}>
              Read article
            </NativeTypography>
          </NativeButton>
        </NativeCard>
      ))}
    </View>
  );
}

function openLink(url: string) {
  void Linking.openURL(url);
}

const styles = StyleSheet.create({
  list: {
    gap: spacingScale.sm,
  },
  card: {
    gap: spacingScale.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sourceLabel: {
    color: brandColors.goldDark,
  },
  timeLabel: {
    color: 'rgba(16,24,40,0.6)',
  },
  title: {
    color: brandColors.navy,
  },
  summary: {
    color: 'rgba(16,24,40,0.85)',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  linkText: {
    color: brandColors.red,
  },
  emptyCard: {
    gap: spacingScale.xs,
  },
  emptyText: {
    color: 'rgba(16,24,40,0.7)',
  },
  refreshText: {
    color: brandColors.navy,
  },
});
