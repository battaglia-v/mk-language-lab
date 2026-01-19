import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { fetchProgress, UserProgress } from '../../lib/progress';
import { BookOpen, Flame, Zap } from 'lucide-react-native';
import { WeeklyProgressCard } from '../../components/gamification/WeeklyProgressCard';
import { StreakRecoveryCard } from '../../components/gamification/StreakRecoveryCard';
import { MilestoneCelebration } from '../../components/gamification/MilestoneCelebration';
import { 
  getGamificationSummary, 
  isStreakFreezeAvailable,
  type GamificationSummary,
} from '../../lib/gamification';
import { 
  checkNewMilestones, 
  getEarnedMilestones,
  saveEarnedMilestones,
  type Milestone,
} from '../../lib/milestones';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);
  const [streakState, setStreakState] = useState<'protected' | 'lost' | 'at-risk' | 'freeze-ready' | 'healthy'>('healthy');

  const loadProgress = async () => {
    try {
      const [progressData, gamificationData, earnedIds] = await Promise.all([
        fetchProgress(),
        getGamificationSummary(),
        getEarnedMilestones(),
      ]);
      setProgress(progressData);
      setGamification(gamificationData);

      // Determine streak state
      if (gamificationData.streakSavedByFreeze) {
        setStreakState('protected');
      } else if (gamificationData.isGoalComplete) {
        setStreakState('healthy');
      } else if (gamificationData.currentStreak > 0 && gamificationData.todayXP === 0) {
        setStreakState('at-risk');
      } else if (gamificationData.streakFreezeAvailable && gamificationData.currentStreak >= 2) {
        setStreakState('freeze-ready');
      } else {
        setStreakState('healthy');
      }

      // Check for new milestones
      const newMilestones = checkNewMilestones({
        totalXP: gamificationData.totalXP,
        currentStreak: gamificationData.currentStreak,
        longestStreak: gamificationData.longestStreak,
        wordsLearned: 0, // TODO: fetch from server
        lessonsCompleted: progressData.lessonsCompleted,
        grammarTopicsMastered: 0, // TODO: fetch from server
        readersCompleted: 0, // TODO: fetch from server
        perfectLessons: 0, // TODO: fetch from server
        weeklyGoalStreak: 0, // TODO: fetch from server
      }, earnedIds);

      if (newMilestones.length > 0) {
        const updatedIds = new Set(earnedIds);
        newMilestones.forEach(m => updatedIds.add(m.id));
        await saveEarnedMilestones(updatedIds);
        setPendingMilestone(newMilestones[0]);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      // Use mock data for development
      setProgress({
        currentLevel: 'A1',
        currentLesson: 3,
        lessonsCompleted: 2,
        totalLessons: 10,
        streak: 5,
        xp: 150,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadProgress();
  };

  const firstName = user?.name?.split(' ')[0] || 'Learner';

  return (
    <SafeAreaView style={styles.container}>
      {/* Milestone Celebration Modal */}
      {pendingMilestone && (
        <MilestoneCelebration
          milestone={pendingMilestone}
          onClose={() => setPendingMilestone(null)}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#f6d83b"
          />
        }
      >
        {/* Streak Recovery Card */}
        {streakState !== 'healthy' && gamification && (
          <View style={styles.streakRecoveryContainer}>
            <StreakRecoveryCard
              state={streakState}
              streak={gamification.currentStreak}
              freezeAvailable={gamification.streakFreezeAvailable}
              onStartPractice={() => router.push('/learn')}
            />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{firstName}</Text>
        </View>

        {/* Stats Row */}
        {progress && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Flame size={16} color="#f6d83b" />
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <Text style={styles.statValue}>{gamification?.currentStreak || progress.streak}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Zap size={16} color="#f6d83b" />
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <Text style={styles.statValue}>{gamification?.totalXP || progress.xp}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <BookOpen size={16} color="#f6d83b" />
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <Text style={styles.statValue}>{progress.currentLevel}</Text>
            </View>
          </View>
        )}

        {/* Weekly Progress Card */}
        {gamification && (
          <View style={styles.weeklyProgressContainer}>
            <WeeklyProgressCard
              weeklyXP={gamification.todayXP}
              weeklyGoal={gamification.dailyGoal * 7}
              streak={gamification.currentStreak}
              daysActive={gamification.isGoalComplete ? 1 : 0}
              compact
            />
          </View>
        )}

        {/* Continue Learning Card */}
        {progress && (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() => router.push('/learn')}
          >
            <Text style={styles.continueLabel}>Continue Learning</Text>
            <Text style={styles.continueTitle}>
              {progress.currentLevel} • Lesson {progress.currentLesson}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(progress.lessonsCompleted / progress.totalLessons) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.lessonsCompleted} of {progress.totalLessons} lessons complete
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/practice')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>💪</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Practice</Text>
              <Text style={styles.actionSubtitle}>Review vocabulary & grammar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/reader')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>📚</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Reader</Text>
              <Text style={styles.actionSubtitle}>Read graded stories</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/translator')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>🔤</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Translator</Text>
              <Text style={styles.actionSubtitle}>Translate any text</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    padding: 24,
  },
  streakRecoveryContainer: {
    marginBottom: 16,
  },
  weeklyProgressContainer: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.72)',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7f8fb',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.72)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f7f8fb',
  },
  continueCard: {
    backgroundColor: 'rgba(246,216,59,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f6d83b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  continueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(6,6,11,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.72)',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(246,216,59,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.72)',
  },
});
