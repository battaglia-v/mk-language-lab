import { useCallback } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Modal, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { brandColors, spacingScale } from '@mk/tokens';
import {
  NativeButton,
  NativeCard,
  NativeTypography,
} from '@mk/ui';
import { CardStack } from '../../features/practice/components';
import {
  useMobileQuickPracticeSession,
  type QuickPracticeCompletionSummary,
} from '../../features/practice/useMobileQuickPracticeSession';
import { getPracticeDifficultyPreset } from '@mk/practice';
import { usePracticeCompletionQueue } from '../../features/practice/usePracticeCompletionQueue';
import { SESSION_TARGET } from '@mk/practice';
import { useQueryHydration } from '../../lib/queryClient';

const HEART_SLOTS = 5;
const XP_PER_CARD = 12;

export default function PracticeScreen() {
  const router = useRouter();
  const completionQueue = usePracticeCompletionQueue();
  const { isHydrated } = useQueryHydration();
  const handleSessionComplete = useCallback(
    (summary: QuickPracticeCompletionSummary) => {
      const preset = getPracticeDifficultyPreset(summary.difficulty);
      const xpEarned = summary.correctCount * XP_PER_CARD * preset.xpMultiplier;
      const streakDelta = summary.correctCount >= SESSION_TARGET ? 1 : 0;
      void completionQueue.queueCompletion({
        deckId: summary.deckId,
        category: summary.category,
        direction: summary.direction,
        mode: summary.practiceMode,
        difficulty: summary.difficulty,
        correctCount: summary.correctCount,
        totalAttempts: summary.totalAttempts,
        accuracy: summary.accuracy,
        heartsRemaining: summary.heartsRemaining,
        xpEarned,
        streakDelta,
      });
    },
    [completionQueue]
  );

  const {
    isLoading,
    category,
    direction,
    setDirection,
    practiceMode,
    difficulty,
    currentCard,
    handleResult,
    evaluateAnswer,
    skipCard,
    hearts,
    correctCount,
    totalAttempts,
    accuracy,
    showCompletionModal,
    setShowCompletionModal,
    showGameOverModal,
    setShowGameOverModal,
    handleReset,
    handleContinue,
  } = useMobileQuickPracticeSession({ onSessionComplete: handleSessionComplete });
  const difficultyPreset = getPracticeDifficultyPreset(difficulty);
  const isRestoring = !isHydrated && isLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Simplified Header */}
        <View style={styles.headerRow}>
          <NativeTypography variant="hero" style={styles.hero}>
            Practice
          </NativeTypography>
          <NativeButton
            variant="ghost"
            style={styles.settingsButton}
            onPress={() => router.push('/(modals)/practice-settings')}
          >
            <Ionicons name="settings-outline" size={24} color={brandColors.navy} />
          </NativeButton>
        </View>

        {isRestoring ? (
          <NativeTypography variant="caption" style={styles.syncNotice}>
            Restoring cached practice data…
          </NativeTypography>
        ) : null}

        {completionQueue.hasPending ? (
          <SyncBanner
            pendingCount={completionQueue.pendingCount}
            isSyncing={completionQueue.isSyncing}
            lastError={completionQueue.lastError}
            onSync={() => completionQueue.flushPending()}
          />
        ) : null}

        {/* Simplified Progress Card - Only Essential Info */}
        <NativeCard style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressInfo}>
              <NativeTypography variant="title" style={styles.progressValue}>
                {correctCount} / {SESSION_TARGET}
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.progressLabel}>
                Correct answers
              </NativeTypography>
            </View>
            <View style={styles.heartsContainer}>
              {Array.from({ length: HEART_SLOTS }, (_, index) => (
                <Ionicons
                  key={index}
                  name="heart"
                  size={24}
                  color={index < hearts ? brandColors.red : 'rgba(247,248,251,0.15)'}
                />
              ))}
            </View>
          </View>
          {accuracy > 0 && (
            <NativeTypography variant="caption" style={styles.accuracyHint}>
              {accuracy}% accuracy • {totalAttempts} attempts
            </NativeTypography>
          )}
        </NativeCard>

        {/* Direction Toggle - Only Essential Control */}
        <View style={styles.directionToggle}>
          <NativeButton
            variant={direction === 'enToMk' ? 'primary' : 'secondary'}
            style={styles.directionButton}
            onPress={() => setDirection('enToMk')}
          >
            <NativeTypography variant="body" style={styles.toggleText}>
              EN → MK
            </NativeTypography>
          </NativeButton>
          <NativeButton
            variant={direction === 'mkToEn' ? 'primary' : 'secondary'}
            style={styles.directionButton}
            onPress={() => setDirection('mkToEn')}
          >
            <NativeTypography variant="body" style={styles.toggleText}>
              MK → EN
            </NativeTypography>
          </NativeButton>
        </View>

        {/* Current Settings Hint */}
        <NativeTypography variant="caption" style={styles.settingsHint}>
          {practiceMode} • {difficultyPreset.label} • {category === 'all' ? 'All topics' : category}
        </NativeTypography>

        <View style={styles.cardSection}>
          <CardStack
            card={currentCard}
            isLoading={isLoading}
            onResult={handleResult}
            onEvaluateAnswer={evaluateAnswer}
          />
          <View style={styles.cardActions}>
            <NativeButton variant="ghost" onPress={skipCard}>
              <NativeTypography variant="body" style={styles.secondaryText}>
                Skip card
              </NativeTypography>
            </NativeButton>
            <NativeButton variant="ghost" onPress={handleReset}>
              <NativeTypography variant="body" style={styles.secondaryText}>
                Reset session
              </NativeTypography>
            </NativeButton>
          </View>
        </View>
      </ScrollView>

      <ResultModal
        visible={showCompletionModal}
        title="Mission complete!"
        description="You hit your target. Keep the streak alive or start a new run."
        primaryLabel="Continue"
        secondaryLabel="Reset"
        onPrimary={handleContinue}
        onSecondary={handleReset}
        onClose={() => setShowCompletionModal(false)}
      />

      <ResultModal
        visible={showGameOverModal}
        title="Out of hearts"
        description="Review your answers and try again."
        primaryLabel="Reset"
        onPrimary={() => {
          handleReset();
          setShowGameOverModal(false);
        }}
        onClose={() => setShowGameOverModal(false)}
      />
    </SafeAreaView>
  );
}

type ResultModalProps = {
  visible: boolean;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onClose: () => void;
};

function ResultModal({
  visible,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}: ResultModalProps) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <NativeCard style={styles.modalCard}>
          <NativeTypography variant="title" style={{ color: brandColors.navy }}>
            {title}
          </NativeTypography>
          <NativeTypography variant="body" style={{ color: 'rgba(247,248,251,0.8)' }}>
            {description}
          </NativeTypography>
          <NativeButton style={styles.modalButton} onPress={onPrimary}>
            <NativeTypography variant="body" style={styles.primaryText}>
              {primaryLabel}
            </NativeTypography>
          </NativeButton>
          {secondaryLabel && onSecondary ? (
            <NativeButton variant="ghost" onPress={onSecondary}>
              <NativeTypography variant="body" style={styles.secondaryText}>
                {secondaryLabel}
              </NativeTypography>
            </NativeButton>
          ) : null}
        </NativeCard>
      </View>
    </Modal>
  );
}

type SyncBannerProps = {
  pendingCount: number;
  isSyncing: boolean;
  lastError?: string | null;
  onSync: () => void;
};

function SyncBanner({ pendingCount, isSyncing, lastError, onSync }: SyncBannerProps) {
  return (
    <NativeCard style={styles.syncBanner}>
      <View style={{ flex: 1, gap: spacingScale.xs }}>
        <NativeTypography variant="body" style={styles.syncText}>
          {isSyncing ? 'Syncing offline XP…' : `Offline XP ready to sync (${pendingCount})`}
        </NativeTypography>
        {lastError ? (
          <NativeTypography variant="caption" style={styles.syncError}>
            {lastError}
          </NativeTypography>
        ) : null}
      </View>
      <NativeButton variant="secondary" onPress={onSync} disabled={isSyncing}>
        <NativeTypography variant="body" style={styles.syncButtonText}>
          {isSyncing ? 'Syncing' : 'Sync now'}
        </NativeTypography>
      </NativeButton>
    </NativeCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.cream },
  container: { padding: spacingScale.lg, gap: spacingScale.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacingScale.xs,
  },
  hero: { color: brandColors.navy, fontSize: 32 },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncNotice: { color: 'rgba(247,248,251,0.6)', marginTop: -spacingScale.sm },
  progressCard: { gap: spacingScale.sm },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: { gap: 2 },
  progressValue: {
    color: brandColors.navy,
    fontSize: 28,
    fontWeight: '700',
  },
  progressLabel: {
    color: 'rgba(247,248,251,0.6)',
    fontSize: 12,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  accuracyHint: {
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    fontSize: 12,
  },
  directionToggle: { flexDirection: 'row', gap: spacingScale.sm },
  directionButton: { flex: 1 },
  toggleText: { color: '#fff' },
  settingsHint: {
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    fontSize: 11,
  },
  cardSection: { gap: spacingScale.sm },
  cardActions: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  secondaryText: { color: brandColors.navy },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingScale.xl,
  },
  modalCard: { width: '100%', gap: spacingScale.sm },
  modalButton: { marginTop: spacingScale.sm },
  primaryText: { color: '#fff' },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.sm,
  },
  syncText: { color: brandColors.navy },
  syncError: { color: brandColors.red },
  syncButtonText: { color: brandColors.navy },
});
