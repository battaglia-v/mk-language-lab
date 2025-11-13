import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeButton, NativeCard, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import type { DiscoverCategory, DiscoverCard, DiscoverEvent } from '@mk/api-client';

type FilterRowProps = {
  categories: DiscoverCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function DiscoverFilterRow({ categories, selectedId, onSelect }: FilterRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <NativeButton
            key={category.id}
            variant={isSelected ? 'primary' : 'secondary'}
            onPress={() => onSelect(category.id)}
            style={styles.filterButton}
          >
            <NativeTypography
              variant="body"
              style={[styles.filterLabel, !isSelected && styles.filterLabelUnselected]}
            >
              {category.label}
            </NativeTypography>
          </NativeButton>
        );
      })}
    </ScrollView>
  );
}

type CardListProps = {
  cards: DiscoverCard[];
  onSelectCard?: (card: DiscoverCard) => void;
};

const accentBackgrounds: Record<DiscoverCard['accent'], string> = {
  plum: brandColors.plum,
  gold: brandColors.gold,
  navy: brandColors.navy,
  mint: brandColors.mint,
  red: brandColors.red,
};

export function DiscoverCardList({ cards, onSelectCard }: CardListProps) {
  return (
    <View style={styles.cardList}>
      {cards.map((card) => {
        const backgroundColor = accentBackgrounds[card.accent] ?? brandColors.navy;
        const lightText = card.accent === 'mint';
        return (
          <NativeCard key={card.id} style={[styles.editorialCard, { backgroundColor }]}>
            <NativeTypography variant="eyebrow" style={[styles.cardTag, lightText && styles.darkTagText]}>
              {card.tag}
            </NativeTypography>
            <NativeTypography variant="title" style={[styles.cardTitle, lightText && styles.darkTitleText]}>
              {card.title}
            </NativeTypography>
            <NativeTypography variant="body" style={styles.cardSummary}>
              {card.summary}
            </NativeTypography>
            <View style={styles.cardMetaRow}>
              <NativeTypography variant="caption" style={styles.cardDuration}>
                {card.duration}
              </NativeTypography>
              <NativeButton variant="ghost" onPress={() => onSelectCard?.(card)}>
                <NativeTypography variant="body" style={styles.cardCta}>
                  {card.cta}
                </NativeTypography>
              </NativeButton>
            </View>
          </NativeCard>
        );
      })}
    </View>
  );
}

type UpcomingEventsProps = {
  events: DiscoverEvent[];
  formatter: Intl.DateTimeFormat;
  onSelectEvent?: (event: DiscoverEvent) => void;
};

export function UpcomingEvents({ events, formatter, onSelectEvent }: UpcomingEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <NativeCard style={styles.eventsCard}>
      <NativeTypography variant="title" style={styles.eventsTitle}>
        Upcoming sessions
      </NativeTypography>
      <View style={styles.eventsList}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <View style={{ flex: 1, gap: spacingScale.xs }}>
              <NativeTypography variant="body" style={styles.eventTitle}>
                {event.title}
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.eventMeta}>
                {event.host} · {event.location}
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.eventMeta}>
                {formatter.format(new Date(event.startAt))}
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.eventDescription}>
                {event.description}
              </NativeTypography>
            </View>
            <NativeButton
              variant="secondary"
              style={styles.eventButton}
              onPress={() => onSelectEvent?.(event)}
            >
              <NativeTypography variant="body" style={styles.eventButtonText}>
                {event.cta}
              </NativeTypography>
            </NativeButton>
          </View>
        ))}
      </View>
    </NativeCard>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: spacingScale.sm,
    paddingVertical: spacingScale.sm,
  },
  filterButton: {
    paddingHorizontal: spacingScale.md,
  },
  filterLabel: {
    color: '#fff',
  },
  filterLabelUnselected: {
    color: brandColors.navy,
  },
  cardList: {
    gap: spacingScale.md,
  },
  editorialCard: {
    gap: spacingScale.sm,
    borderWidth: 0,
  },
  cardTag: {
    color: 'rgba(255,255,255,0.85)',
  },
  cardTitle: {
    color: '#fff',
  },
  darkTitleText: {
    color: brandColors.navy,
  },
  darkTagText: {
    color: brandColors.navy,
  },
  cardSummary: {
    color: 'rgba(255,255,255,0.92)',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDuration: {
    color: 'rgba(255,255,255,0.85)',
  },
  cardCta: {
    color: '#fff',
  },
  eventsCard: {
    gap: spacingScale.md,
  },
  eventsTitle: {
    color: brandColors.navy,
  },
  eventsList: {
    gap: spacingScale.md,
  },
  eventRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(16,24,40,0.1)',
    paddingBottom: spacingScale.sm,
  },
  eventTitle: {
    color: brandColors.navy,
  },
  eventMeta: {
    color: 'rgba(16,24,40,0.65)',
  },
  eventDescription: {
    color: 'rgba(16,24,40,0.8)',
  },
  eventButton: {
    alignSelf: 'flex-start',
  },
  eventButtonText: {
    color: brandColors.navy,
  },
});
