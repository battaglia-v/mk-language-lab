import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useMissionStatusQuery, getLocalMissionStatus, type MissionStatus } from '@mk/api-client';
import {
  MissionHeroCard,
  CoachTipsCarousel,
  SmartReviewRail,
  CommunityHighlights,
  type MissionStats,
  type CoachTip,
  type ReviewCluster,
  type CommunityHighlight,
} from '../../features/home';
import { useNotifications } from '../../lib/notifications';

export default function HomeScreen() {
  const router = useRouter();
  const { data } = useMissionStatusQuery();
  const mission = data ?? getLocalMissionStatus();
  const { scheduleMissionReminder } = useNotifications();

  const missionStats = mapMissionToHeroStats(mission);
  const coachTips: CoachTip[] = mission.coachTips;
  const reviewClusters: ReviewCluster[] = mission.reviewClusters.map((cluster) => ({
    ...cluster,
    accuracy: Math.round(cluster.accuracy * 100),
  }));
  const communityHighlights: CommunityHighlight[] = mission.communityHighlights;

  useEffect(() => {
    void scheduleMissionReminder(mission);
  }, [mission.missionId, mission.cycle?.endsAt, scheduleMissionReminder]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.container}>
          <HomeAppBar />
          <MissionHeroCard
            stats={missionStats}
            onContinue={() => router.push('/(tabs)/practice')}
            onOpenPracticeSettings={() => router.push('/(modals)/practice-settings')}
            onOpenTranslatorHistory={() => router.push('/(modals)/translator-history')}
            onOpenMissionSettings={() => router.push('/(modals)/mission-settings')}
          />

          <View style={styles.section}>
            <CoachTipsCarousel tips={coachTips} />
          </View>

          <View style={styles.section}>
            <SmartReviewRail clusters={reviewClusters} onSelectCluster={() => router.push('/(tabs)/practice')} />
          </View>

          <View style={styles.section}>
            <CommunityHighlights items={communityHighlights} />
          </View>
        </ScrollView>
        <FloatingContinuePill onPress={() => router.push('/(tabs)/practice')} />
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
    backgroundColor: brandColors.creamLight,
  },
  page: {
    flex: 1,
  },
  container: {
    padding: spacingScale.xl,
    gap: spacingScale.xl,
    paddingBottom: spacingScale['3xl'],
  },
  section: {
    gap: spacingScale.sm,
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
    backgroundColor: brandColors.red,
    shadowColor: brandColors.redDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingPillText: {
    color: brandColors.cream,
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
};

function FloatingContinuePill({ onPress }: FloatingContinuePillProps) {
  return (
    <Pressable style={styles.floatingPill} onPress={onPress} accessibilityRole="button">
      <Ionicons name="play" size={18} color={brandColors.cream} />
      <NativeTypography variant="body" style={styles.floatingPillText}>
        Continue
      </NativeTypography>
    </Pressable>
  );
}
