import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeButton, NativeCard, NativeProgressRing, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';

export type MissionStats = {
  missionName: string;
  xpEarned: number;
  xpTarget: number;
  streakDays: number;
  heartsRemaining: number;
  translatorDirection: string;
  checklist: string[];
};

export type CoachTip = {
  id: string;
  title: string;
  body: string;
  tag: string;
};

export type ReviewCluster = {
  id: string;
  label: string;
  accuracy: number;
};

export type CommunityHighlight = {
  id: string;
  title: string;
  detail: string;
  accent: 'gold' | 'green' | 'red';
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  onPress: () => void;
  accent?: 'primary' | 'secondary';
  disabled?: boolean;
};

type QuickActionsGridProps = {
  actions: QuickAction[];
  isLoading?: boolean;
};

export function QuickActionsGrid({ actions, isLoading }: QuickActionsGridProps) {
  if (isLoading && !actions.length) {
    return (
      <NativeCard style={styles.warningCard}>
        <NativeTypography variant="body" style={styles.warningText}>
          Loading shortcuts…
        </NativeTypography>
      </NativeCard>
    );
  }
  if (!actions.length) {
    return null;
  }

  return (
    <View style={styles.quickActionsGrid}>
      {actions.map((action) => (
        <NativeCard
          key={action.id}
          style={[
            styles.quickActionCard,
            action.accent === 'secondary' && styles.quickActionSecondaryCard,
            action.disabled && styles.quickActionDisabled,
          ]}
        >
          <View style={styles.quickActionIcon}>{action.icon}</View>
          <View style={styles.quickActionBody}>
            <NativeTypography variant="title" style={styles.quickActionTitle}>
              {action.title}
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.quickActionDescription}>
              {action.description}
            </NativeTypography>
          </View>
          <NativeButton
            variant="ghost"
            disabled={action.disabled}
            onPress={action.onPress}
            style={styles.quickActionButton}
          >
            <NativeTypography variant="body" style={styles.quickActionButtonText}>
              Open
            </NativeTypography>
          </NativeButton>
        </NativeCard>
      ))}
    </View>
  );
}

type MissionHeroCardProps = {
  stats: MissionStats;
  onContinue: () => void;
  onOpenPracticeSettings: () => void;
  onOpenTranslatorHistory: () => void;
  onOpenMissionSettings: () => void;
};

export function MissionHeroCard({
  stats,
  onContinue,
  onOpenPracticeSettings,
  onOpenTranslatorHistory,
  onOpenMissionSettings,
}: MissionHeroCardProps) {
  const progress = stats.xpTarget === 0 ? 0 : stats.xpEarned / stats.xpTarget;
  const [showChecklist, setShowChecklist] = useState(false);

  return (
    <Pressable onLongPress={() => setShowChecklist((prev) => !prev)} delayLongPress={220}>
      <NativeCard style={styles.heroCard}>
        <NativeTypography variant="eyebrow" style={styles.heroEyebrow}>
          Daily mission
        </NativeTypography>
        <NativeTypography variant="hero" style={styles.heroTitle}>
          {stats.missionName}
        </NativeTypography>
        <NativeTypography variant="body" style={styles.heroDescription}>
          Hit your XP goal, protect the {stats.streakDays}-day streak, and clear today’s tasks.
        </NativeTypography>

        <View style={styles.heroStatsRow}>
          <NativeProgressRing
            progress={progress}
            value={`${stats.xpEarned}/${stats.xpTarget} XP`}
            label="Goal"
            style={{ backgroundColor: 'transparent' }}
          />
          <View style={styles.heroBadges}>
            <NativeStatPill label="Streak" value={`${stats.streakDays} days`} accent="gold" />
            <NativeStatPill label="Hearts" value={`${stats.heartsRemaining} left`} accent="red" />
            <NativeStatPill label="Translator" value={stats.translatorDirection} accent="green" />
          </View>
        </View>

        <View style={styles.heroChecklist}>
          {showChecklist
            ? stats.checklist.map((item) => (
                <View key={item} style={styles.checklistItem}>
                  <View style={styles.checklistDot} />
                  <NativeTypography variant="body" style={styles.checklistText}>
                    {item}
                  </NativeTypography>
                </View>
              ))
            : (
              <NativeTypography variant="caption" style={styles.checklistHint}>
                Long press this card to reveal today’s checklist
              </NativeTypography>
            )}
        </View>

        <View style={styles.heroActions}>
          <NativeButton onPress={onContinue} style={{ flex: 1 }}>
            <NativeTypography variant="body" style={styles.primaryButtonText}>
              Continue mission
            </NativeTypography>
          </NativeButton>
          <NativeButton variant="secondary" onPress={onOpenPracticeSettings} style={{ flex: 1 }}>
            <NativeTypography variant="body" style={styles.secondaryButtonText}>
              Session settings
            </NativeTypography>
          </NativeButton>
        </View>
        <View style={styles.heroLinks}>
          <NativeButton variant="ghost" onPress={onOpenTranslatorHistory} style={{ flex: 1 }}>
            <NativeTypography variant="body" style={styles.linkText}>
              Translator inbox
            </NativeTypography>
          </NativeButton>
          <NativeButton variant="ghost" onPress={onOpenMissionSettings} style={{ flex: 1 }}>
            <NativeTypography variant="body" style={styles.linkText}>
              Mission reminders
            </NativeTypography>
          </NativeButton>
        </View>
      </NativeCard>
    </Pressable>
  );
}

type CoachTipsCarouselProps = {
  tips: CoachTip[];
};

export function CoachTipsCarousel({ tips }: CoachTipsCarouselProps) {
  return (
    <View>
      <NativeTypography variant="eyebrow" style={styles.sectionEyebrow}>
        Coach tips
      </NativeTypography>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {tips.map((tip) => (
          <NativeCard key={tip.id} style={styles.tipCard}>
            <NativeTypography variant="caption" style={styles.tipTag}>
              {tip.tag}
            </NativeTypography>
            <NativeTypography variant="body" style={styles.tipTitle}>
              {tip.title}
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.tipBody}>
              {tip.body}
            </NativeTypography>
          </NativeCard>
        ))}
      </ScrollView>
    </View>
  );
}

type SmartReviewRailProps = {
  clusters: ReviewCluster[];
  onSelectCluster: (cluster: ReviewCluster) => void;
};

export function SmartReviewRail({ clusters, onSelectCluster }: SmartReviewRailProps) {
  return (
    <View>
      <NativeTypography variant="eyebrow" style={styles.sectionEyebrow}>
        Smart review
      </NativeTypography>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewRail}>
        {clusters.map((cluster) => (
          <NativeCard key={cluster.id} style={styles.reviewChip}>
            <NativeTypography variant="body" style={styles.reviewLabel}>
              {cluster.label}
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.reviewMeta}>
              {cluster.accuracy}% accuracy
            </NativeTypography>
            <NativeButton variant="ghost" onPress={() => onSelectCluster(cluster)}>
              <NativeTypography variant="body" style={styles.reviewLink}>
                Resume drill
              </NativeTypography>
            </NativeButton>
          </NativeCard>
        ))}
      </ScrollView>
    </View>
  );
}

type CommunityHighlightsProps = {
  items: CommunityHighlight[];
};

export function CommunityHighlights({ items }: CommunityHighlightsProps) {
  return (
    <View>
      <NativeTypography variant="eyebrow" style={styles.sectionEyebrow}>
        Community
      </NativeTypography>
      <NativeCard style={styles.communityCard}>
        {items.map((item) => (
          <View key={item.id} style={styles.communityRow}>
            <View style={{ flex: 1 }}>
              <NativeTypography variant="body" style={styles.communityTitle}>
                {item.title}
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.communityDetail}>
                {item.detail}
              </NativeTypography>
            </View>
            <NativeStatPill label="Action" value="View" accent={item.accent} />
          </View>
        ))}
      </NativeCard>
    </View>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    gap: spacingScale.xs,
  },
  warningText: {
    color: brandColors.text,
  },
  heroCard: {
    gap: spacingScale.md,
    backgroundColor: brandColors.panel,
    borderColor: brandColors.border,
  },
  heroEyebrow: {
    color: brandColors.accentEmphasis,
  },
  heroTitle: {
    color: brandColors.text,
  },
  heroDescription: {
    color: brandColors.textMuted,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacingScale.lg,
    alignItems: 'center',
  },
  heroBadges: {
    flex: 1,
    gap: spacingScale.sm,
  },
  heroChecklist: {
    gap: spacingScale.xs,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.xs,
  },
  checklistDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: brandColors.accent,
  },
  checklistText: {
    color: brandColors.text,
  },
  checklistHint: {
    color: brandColors.textMuted,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  heroLinks: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: brandColors.text,
  },
  linkText: {
    color: brandColors.accentGreen,
  },
  quickActionsGrid: {
    gap: spacingScale.sm,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.sm,
  },
  quickActionSecondaryCard: {
    backgroundColor: brandColors.surface,
  },
  quickActionDisabled: {
    opacity: 0.6,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${brandColors.borderSoft}40`,
  },
  quickActionBody: {
    flex: 1,
    gap: spacingScale.xs / 2,
  },
  quickActionTitle: {
    color: brandColors.text,
  },
  quickActionDescription: {
    color: brandColors.textMuted,
  },
  quickActionButton: {
    paddingHorizontal: spacingScale.sm,
  },
  quickActionButtonText: {
    color: brandColors.accentEmphasis,
  },
  sectionEyebrow: {
    marginBottom: spacingScale.xs,
    color: brandColors.accent,
  },
  carousel: {
    gap: spacingScale.sm,
  },
  tipCard: {
    width: 220,
    gap: spacingScale.xs,
    backgroundColor: brandColors.panel,
  },
  tipTag: {
    color: brandColors.accentEmphasis,
  },
  tipTitle: {
    color: brandColors.text,
  },
  tipBody: {
    color: brandColors.textMuted,
  },
  reviewRail: {
    gap: spacingScale.sm,
  },
  reviewChip: {
    width: 200,
    gap: spacingScale.xs,
    backgroundColor: brandColors.surfaceRaised,
  },
  reviewLabel: {
    color: brandColors.text,
  },
  reviewMeta: {
    color: brandColors.textMuted,
  },
  reviewLink: {
    color: brandColors.accentEmphasis,
  },
  communityCard: {
    gap: spacingScale.sm,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.sm,
  },
  communityTitle: {
    color: brandColors.text,
  },
  communityDetail: {
    color: brandColors.textMuted,
  },
});
