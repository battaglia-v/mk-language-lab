/**
 * Onboarding Screen
 * 
 * Multi-step wizard for new users to set their learning preferences
 * Mirrors PWA's app/[locale]/(auth)/onboarding/page.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see app/[locale]/(auth)/onboarding/page.tsx (PWA implementation)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Heart,
  MessageCircle,
  Plane,
  Check,
  Sparkles,
  Clock,
  Rocket,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptic } from '../lib/haptics';
import { apiFetch } from '../lib/api';
import { trackEvent } from '../lib/analytics';
import { updateDailyGoal } from '../lib/gamification';

const ONBOARDING_COMPLETE_KEY = 'mkll:onboarding-complete';

// Goal options
type Goal = 'conversation' | 'travel' | 'culture' | 'reading' | 'professional';
type Level = 'beginner' | 'intermediate' | 'advanced';

const GOALS: { id: Goal; icon: React.ComponentType<any>; label: string; description: string }[] = [
  { id: 'conversation', icon: MessageCircle, label: 'Conversation', description: 'Chat with native speakers' },
  { id: 'travel', icon: Plane, label: 'Travel', description: 'Navigate your trip' },
  { id: 'culture', icon: Heart, label: 'Culture', description: 'Connect with heritage' },
  { id: 'reading', icon: BookOpen, label: 'Reading', description: 'Read books & news' },
  { id: 'professional', icon: Briefcase, label: 'Professional', description: 'Work & business' },
];

const LEVELS: { id: Level; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', description: 'Know some basics' },
  { id: 'advanced', label: 'Advanced', description: 'Ready to refine' },
];

const DAILY_GOALS = [
  { minutes: 5, label: 'Casual', description: '5 min/day' },
  { minutes: 10, label: 'Regular', description: '10 min/day' },
  { minutes: 15, label: 'Serious', description: '15 min/day' },
  { minutes: 20, label: 'Intensive', description: '20 min/day' },
];

type WizardData = {
  goal: Goal | null;
  level: Level | null;
  dailyGoalMinutes: number;
};

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({
    goal: null,
    level: null,
    dailyGoalMinutes: 10,
  });

  useEffect(() => {
    trackEvent('onboarding_started', {});
  }, []);

  const handleGoalSelect = (goal: Goal) => {
    haptic.selection();
    setData({ ...data, goal, level: data.level || 'beginner' });
    trackEvent('onboarding_goal_selected', { goal });
  };

  const handleLevelSelect = (level: Level) => {
    haptic.selection();
    setData({ ...data, level });
    trackEvent('onboarding_level_selected', { level });
  };

  const handleDailyGoalSelect = (minutes: number) => {
    haptic.selection();
    setData({ ...data, dailyGoalMinutes: minutes });
    trackEvent('onboarding_daily_goal_selected', { minutes });
  };

  const handleNext = () => {
    if (step === 1 && (!data.goal || !data.level)) return;
    haptic.light();
    
    if (step < 3) {
      trackEvent('onboarding_step_completed', { step });
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      haptic.light();
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!data.goal || !data.level) return;

    setIsSubmitting(true);
    haptic.medium();

    try {
      // Try to sync with server (will fail if not authenticated)
      try {
        await apiFetch('/api/missions/setup', {
          method: 'POST',
          body: {
            goal: data.goal,
            level: data.level,
            dailyGoalMinutes: data.dailyGoalMinutes,
            reminderWindows: [],
            questSeeds: [],
          },
        });
      } catch {
        // Ignore server errors - save locally anyway
      }

      // Save preferences locally
      await AsyncStorage.setItem(
        'mkll:user-preferences',
        JSON.stringify({
          goal: data.goal,
          level: data.level,
          dailyGoalMinutes: data.dailyGoalMinutes,
        })
      );

      // Update daily goal in gamification
      await updateDailyGoal(data.dailyGoalMinutes * 10); // Convert minutes to XP

      // Mark onboarding as complete
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');

      trackEvent('onboarding_completed', {
        goal: data.goal,
        level: data.level,
        dailyGoalMinutes: data.dailyGoalMinutes,
      });

      haptic.success();
      router.replace('/(tabs)/learn');
    } catch (error) {
      console.error('[Onboarding] Failed:', error);
      trackEvent('onboarding_failed', { error: String(error) });
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    haptic.light();
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    router.replace('/(tabs)/learn');
  };

  const canProceed = (step === 1 && data.goal && data.level) || step === 2 || step === 3;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={step > 1 ? handleBack : handleSkip}
          style={styles.headerButton}
        >
          {step > 1 ? (
            <ArrowLeft size={24} color="#f7f8fb" />
          ) : (
            <Text style={styles.skipText}>Skip</Text>
          )}
        </TouchableOpacity>
        
        {/* Progress dots */}
        <View style={styles.progressDots}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.dot,
                s === step && styles.dotActive,
                s < step && styles.dotComplete,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Goal & Level */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Sparkles size={32} color="#f6d83b" />
              <Text style={styles.stepTitle}>What&apos;s your goal?</Text>
              <Text style={styles.stepSubtitle}>
                Help us personalize your learning experience
              </Text>
            </View>

            {/* Goals */}
            <View style={styles.optionsGrid}>
              {GOALS.map((goal) => {
                const isSelected = data.goal === goal.id;
                const Icon = goal.icon;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                    onPress={() => handleGoalSelect(goal.id)}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? '#f6d83b' : 'rgba(247,248,251,0.6)'}
                    />
                    <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                      {goal.label}
                    </Text>
                    <Text style={styles.goalDesc}>{goal.description}</Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Check size={14} color="#06060b" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Level Selection (shows after goal selected) */}
            {data.goal && (
              <View style={styles.levelSection}>
                <Text style={styles.sectionTitle}>Your level</Text>
                <View style={styles.levelOptions}>
                  {LEVELS.map((level) => {
                    const isSelected = data.level === level.id;
                    return (
                      <TouchableOpacity
                        key={level.id}
                        style={[styles.levelOption, isSelected && styles.levelOptionSelected]}
                        onPress={() => handleLevelSelect(level.id)}
                      >
                        <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Step 2: Daily Goal */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Clock size={32} color="#f6d83b" />
              <Text style={styles.stepTitle}>Daily commitment</Text>
              <Text style={styles.stepSubtitle}>
                How much time can you dedicate each day?
              </Text>
            </View>

            <View style={styles.dailyGoalOptions}>
              {DAILY_GOALS.map((option) => {
                const isSelected = data.dailyGoalMinutes === option.minutes;
                return (
                  <TouchableOpacity
                    key={option.minutes}
                    style={[styles.dailyGoalCard, isSelected && styles.dailyGoalCardSelected]}
                    onPress={() => handleDailyGoalSelect(option.minutes)}
                  >
                    <Text style={[styles.dailyGoalMinutes, isSelected && styles.dailyGoalMinutesSelected]}>
                      {option.minutes}
                    </Text>
                    <Text style={styles.dailyGoalUnit}>min</Text>
                    <Text style={[styles.dailyGoalLabel, isSelected && styles.dailyGoalLabelSelected]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Check size={14} color="#06060b" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Ready to Start */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Rocket size={48} color="#f6d83b" />
              <Text style={styles.stepTitle}>You&apos;re all set!</Text>
              <Text style={styles.stepSubtitle}>
                Let&apos;s start your Macedonian journey
              </Text>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Goal</Text>
                <Text style={styles.summaryValue}>
                  {GOALS.find((g) => g.id === data.goal)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Level</Text>
                <Text style={styles.summaryValue}>
                  {LEVELS.find((l) => l.id === data.level)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Daily goal</Text>
                <Text style={styles.summaryValue}>{data.dailyGoalMinutes} min/day</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#06060b" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Start Learning' : 'Continue'}
              </Text>
              <ArrowRight size={20} color="#06060b" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerButton: {
    width: 60,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.6)',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: '#f6d83b',
    width: 24,
  },
  dotComplete: {
    backgroundColor: '#22c55e',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8fb',
    marginTop: 16,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  goalCard: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: '#f6d83b',
    backgroundColor: 'rgba(246,216,59,0.1)',
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
    marginTop: 10,
  },
  goalLabelSelected: {
    color: '#f6d83b',
  },
  goalDesc: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 4,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f6d83b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  levelOptions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  levelOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#333',
  },
  levelOptionSelected: {
    borderColor: '#f6d83b',
    backgroundColor: 'rgba(246,216,59,0.15)',
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.7)',
  },
  levelLabelSelected: {
    color: '#f6d83b',
  },
  dailyGoalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  dailyGoalCard: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dailyGoalCardSelected: {
    borderColor: '#f6d83b',
    backgroundColor: 'rgba(246,216,59,0.1)',
  },
  dailyGoalMinutes: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  dailyGoalMinutesSelected: {
    color: '#f6d83b',
  },
  dailyGoalUnit: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    marginTop: -4,
  },
  dailyGoalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.7)',
    marginTop: 8,
  },
  dailyGoalLabelSelected: {
    color: '#f6d83b',
  },
  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.6)',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#06060b',
  },
});
