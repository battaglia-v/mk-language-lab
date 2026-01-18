import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Settings, LogOut, Flame, Zap, BookOpen, Dumbbell, Trophy, Target, Award, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { fetchProfileStats, ProfileStats } from '../../lib/profile';
import { useRequireAuth } from '../../hooks/useAuthGuard';
import { getGamificationSummary } from '../../lib/gamification';
import { FeedbackBanner } from '../../components/ui/FeedbackBanner';

export default function ProfileScreen() {
  // Require authentication for this screen
  const { isLoading: authLoading } = useRequireAuth();

  const { user, signOut } = useAuthStore();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [gamification, setGamification] = useState<{
    totalXP: number;
    todayXP: number;
    dailyGoal: number;
    goalComplete: boolean;
    currentStreak: number;
    level: number;
    levelProgress: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [profileData, gamificationData] = await Promise.all([
        fetchProfileStats(),
        getGamificationSummary(),
      ]);
      setStats(profileData);
      setGamification(gamificationData);
    } catch (error) {
      console.error('[Profile] Failed to load stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadStats();
  }, [loadStats]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  // Get user initials for avatar
  const getInitials = (email: string | undefined) => {
    if (!email) return '?';
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#f6d83b" />
        }
      >
        {/* Feedback Banner */}
        <FeedbackBanner />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Settings size={22} color="#f7f8fb" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.email)}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f6d83b" />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCard
                icon={<Zap size={24} color="#22c55e" />}
                label="Total XP"
                value={stats?.xpTotal.toLocaleString() ?? '0'}
                accentColor="rgba(34,197,94,0.15)"
                borderColor="rgba(34,197,94,0.3)"
              />
              <StatCard
                icon={<Flame size={24} color="#f59e0b" />}
                label="Streak"
                value={`${stats?.streakDays ?? 0} days`}
                accentColor="rgba(245,158,11,0.15)"
                borderColor="rgba(245,158,11,0.3)"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon={<BookOpen size={24} color="#3b82f6" />}
                label="Lessons"
                value={stats?.lessonsCompleted.toString() ?? '0'}
                accentColor="rgba(59,130,246,0.15)"
                borderColor="rgba(59,130,246,0.3)"
              />
              <StatCard
                icon={<Dumbbell size={24} color="#a855f7" />}
                label="Practice"
                value={stats?.practiceSessionsCompleted.toString() ?? '0'}
                accentColor="rgba(168,85,247,0.15)"
                borderColor="rgba(168,85,247,0.3)"
              />
            </View>
          </View>
        )}

        {/* Achievements Link */}
        <TouchableOpacity 
          style={styles.achievementsButton} 
          onPress={() => router.push('/achievements')}
          activeOpacity={0.7}
        >
          <View style={styles.achievementsLeft}>
            <View style={styles.achievementsIcon}>
              <Award size={20} color="#f6d83b" />
            </View>
            <View>
              <Text style={styles.achievementsTitle}>Achievements</Text>
              <Text style={styles.achievementsSubtitle}>View badges and progress</Text>
            </View>
          </View>
          <ChevronRight size={20} color="rgba(247,248,251,0.4)" />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
  accentColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: accentColor, borderColor }]}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7f8fb',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0b0b12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222536',
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(246,216,59,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(246,216,59,0.4)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f6d83b',
  },
  email: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.7)',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7f8fb',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 4,
    fontWeight: '500',
  },
  achievementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222536',
  },
  achievementsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  achievementsSubtitle: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  signOutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
});
