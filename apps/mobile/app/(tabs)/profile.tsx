import { useCallback } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeTypography, NativeCard, NativeStatPill, NativeButton } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useProfileSummaryQuery, getLocalProfileSummary } from '@mk/api-client';
import { getApiBaseUrl } from '../../lib/api';
import { useQueryHydration } from '../../lib/queryClient';
import { useAuth, authenticatedFetch } from '../../lib/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const apiBaseUrl = getApiBaseUrl();
  const isApiConfigured = Boolean(apiBaseUrl);
  const { isHydrated } = useQueryHydration();
  const {
    data,
    isLoading,
    error,
  } = useProfileSummaryQuery({
    baseUrl: apiBaseUrl ?? undefined,
    enabled: isApiConfigured,
    fetcher: authenticatedFetch,
  });
  const profile = data ?? (!isApiConfigured ? getLocalProfileSummary() : null);
  const badges = profile?.badges ?? [];
  const isRestoring = isApiConfigured && !isHydrated && !data;
  const { status: authStatus, user: authUser, signOut, isWorking: authWorking } = useAuth();
  const isAuthenticated = authStatus === 'authenticated';
  const handleBadgePress = useCallback(
    (badgeId: string) => {
      switch (badgeId) {
        case 'streak-guardian':
          router.push('/(modals)/mission-settings');
          break;
        case 'journey-lead':
          router.push('/(tabs)/discover');
          break;
        case 'xp-ranger':
        case 'weekly-warrior':
        default:
          router.push('/(tabs)/practice');
          break;
      }
    },
    [router]
  );

  const handleManageBadges = useCallback(() => {
    router.push('/(modals)/mission-settings');
  }, [router]);

  const handleOpenAdmin = useCallback(async () => {
    const adminUrl = 'https://mk-language-lab.vercel.app/admin';
    const canOpen = await Linking.canOpenURL(adminUrl);
    if (canOpen) {
      await Linking.openURL(adminUrl);
    } else {
      Alert.alert('Error', 'Unable to open admin panel');
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          {profile?.name ?? 'Profile'}
        </NativeTypography>
        {!isApiConfigured ? (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.warningText}>
              Configure `EXPO_PUBLIC_API_BASE_URL` to load live XP/streak stats. Fixture data is shown for preview only.
            </NativeTypography>
          </NativeCard>
        ) : null}
        {isRestoring ? (
          <NativeTypography variant="caption" style={styles.helperText}>
            Restoring cached profile data…
          </NativeTypography>
        ) : null}
        {isLoading && isApiConfigured && !data ? (
          <NativeTypography variant="body" style={styles.body}>
            Loading profile summary…
          </NativeTypography>
        ) : null}
        {error ? (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.errorText}>
              Unable to fetch profile summary: {error.message}
            </NativeTypography>
          </NativeCard>
        ) : null}

        <NativeCard style={styles.accountCard}>
          <NativeTypography variant="title" style={styles.accountTitle}>
            Account
          </NativeTypography>
          {isAuthenticated ? (
            <>
              <NativeTypography variant="body" style={styles.body}>
                Signed in as {authUser?.email ?? 'unknown'}
              </NativeTypography>
              <NativeButton
                variant="ghost"
                onPress={() => {
                  void signOut();
                }}
                disabled={authWorking}
              >
                <NativeTypography variant="body" style={styles.badgesLink}>
                  {authWorking ? 'Signing out…' : 'Sign out'}
                </NativeTypography>
              </NativeButton>
            </>
          ) : (
            <>
              <NativeTypography variant="body" style={styles.body}>
                Sign in to sync XP, streaks, and reminders across devices.
              </NativeTypography>
              <NativeButton
                onPress={() => {
                  router.push('/sign-in');
                }}
              >
                <NativeTypography variant="body" style={styles.signInCta}>
                  Sign in
                </NativeTypography>
              </NativeButton>
            </>
          )}
        </NativeCard>

        {profile ? (
          <>
            <NativeCard style={styles.statCard}>
              <View style={styles.statRow}>
                <NativeStatPill label="XP" value={`${profile.xp.total.toLocaleString()} total`} accent="green" />
                <NativeStatPill label="Weekly XP" value={`${profile.xp.weekly}`} accent="gold" />
              </View>
              <View style={styles.statRow}>
                <NativeStatPill label="Level" value={profile.level} />
                <NativeStatPill label="Streak" value={`${profile.streakDays} days`} accent="red" />
              </View>
              <View style={styles.statRow}>
                <NativeStatPill label="Quests active" value={`${profile.quests.active}`} />
                <NativeStatPill label="Completed this week" value={`${profile.quests.completedThisWeek}`} accent="gold" />
              </View>
            </NativeCard>

            <View style={styles.badgesSection}>
              <View style={styles.badgesHeader}>
                <NativeTypography variant="title" style={styles.badgesTitle}>
                  Badges
                </NativeTypography>
            <NativeButton variant="ghost" onPress={handleManageBadges}>
              <NativeTypography variant="body" style={styles.badgesLink}>
                Manage
              </NativeTypography>
            </NativeButton>
          </View>
              {badges.length === 0 ? (
                <NativeTypography variant="body" style={styles.body}>
                  Earn badges by completing missions and quests.
                </NativeTypography>
              ) : (
                <View style={styles.badgeList}>
                  {badges.map((badge) => (
                    <Pressable
                      key={badge.id}
                      style={styles.badgePressable}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${badge.label} badge`}
                      onPress={() => handleBadgePress(badge.id)}
                    >
                      <NativeCard style={styles.badgeCard}>
                        <NativeTypography variant="body" style={styles.badgeLabel}>
                          {badge.label}
                        </NativeTypography>
                        <NativeTypography variant="caption" style={styles.badgeDescription}>
                          {badge.description}
                        </NativeTypography>
                        <NativeTypography variant="caption" style={styles.badgeMeta}>
                          {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'In progress'}
                        </NativeTypography>
                      </NativeCard>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {authUser?.role === 'admin' && (
              <NativeCard style={styles.adminCard}>
                <View style={styles.adminHeader}>
                  <NativeTypography variant="title" style={styles.adminTitle}>
                    Admin Panel
                  </NativeTypography>
                </View>
                <NativeTypography variant="body" style={styles.body}>
                  Access the admin dashboard to manage content, vocabulary, and user data.
                </NativeTypography>
                <NativeButton onPress={handleOpenAdmin}>
                  <View style={styles.adminButtonContent}>
                    <NativeTypography variant="body" style={styles.adminButtonText}>
                      Open Admin Panel
                    </NativeTypography>
                    <NativeTypography variant="body" style={styles.externalLinkIcon}>
                      →
                    </NativeTypography>
                  </View>
                </NativeButton>
              </NativeCard>
            )}
          </>
        ) : (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.warningText}>
              Profile stats will appear once the API responds. Pull to refresh if you recently created an account.
            </NativeTypography>
          </NativeCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.background },
  container: { flexGrow: 1, padding: spacingScale.xl, gap: spacingScale.lg },
  hero: { color: brandColors.text },
  body: { color: brandColors.textMuted },
  helperText: { color: brandColors.textMuted },
  warningCard: { gap: spacingScale.xs },
  warningText: { color: brandColors.text },
  errorText: { color: brandColors.red },
  accountCard: { gap: spacingScale.sm },
  accountTitle: { color: brandColors.text },
  signInCta: { color: brandColors.accent },
  statCard: { gap: spacingScale.sm },
  statRow: { flexDirection: 'row', gap: spacingScale.sm, flexWrap: 'wrap' },
  badgesSection: { gap: spacingScale.sm },
  badgesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgesTitle: { color: brandColors.text },
  badgesLink: { color: brandColors.accent },
  badgeList: { gap: spacingScale.sm },
  badgePressable: { borderRadius: spacingScale.md },
  badgeCard: { gap: spacingScale.xs },
  badgeLabel: { color: brandColors.text },
  badgeDescription: { color: 'rgba(16,24,40,0.7)' },
  badgeMeta: { color: 'rgba(16,24,40,0.6)' },
  adminCard: { gap: spacingScale.sm },
  adminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminTitle: { color: brandColors.navy },
  adminButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacingScale.xs },
  adminButtonText: { color: brandColors.cream },
  externalLinkIcon: { color: brandColors.cream, fontSize: 18 },
});
