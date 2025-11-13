import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Modal, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { brandColors, spacingScale } from '@mk/tokens';
import {
  NativeButton,
  NativeCard,
  NativeProgressRing,
  NativeStatPill,
  NativeTypography,
} from '@mk/ui';
import { CardStack } from '../../features/practice/components';
import {
  useMobileQuickPracticeSession,
  type PracticeDeckMode,
} from '../../features/practice/useMobileQuickPracticeSession';

const HEART_SLOTS = 5;
const PRACTICE_MODES: Array<{ key: PracticeDeckMode; label: string }> = [
  { key: 'typing', label: 'Typing' },
  { key: 'cloze', label: 'Cloze' },
  { key: 'multipleChoice', label: 'Multiple choice' },
  { key: 'listening', label: 'Listening' },
];

export default function PracticeScreen() {
  const router = useRouter();
  const {
    isLoading,
    categories,
    category,
    setCategory,
    direction,
    setDirection,
    practiceMode,
    setPracticeMode,
    currentCard,
    handleResult,
    evaluateAnswer,
    skipCard,
    hearts,
    correctCount,
    totalAttempts,
    accuracy,
    sessionProgress,
    showCompletionModal,
    setShowCompletionModal,
    showGameOverModal,
    setShowGameOverModal,
    handleReset,
    handleContinue,
  } = useMobileQuickPracticeSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <NativeTypography variant="hero" style={styles.hero}>
              Quick Practice
            </NativeTypography>
            <NativeTypography variant="body" style={styles.subtitle}>
              Swipe through prompts, keep your hearts, and reach the XP goal.
            </NativeTypography>
          </View>
          <View style={styles.toolbar}>
            <NativeButton
              variant="ghost"
              style={styles.toolbarButton}
              onPress={() => router.push('/(modals)/practice-settings')}
            >
              <NativeTypography variant="body" style={styles.toolbarButtonText}>
                Session settings
              </NativeTypography>
            </NativeButton>
            <NativeButton
              variant="ghost"
              style={styles.toolbarButton}
              onPress={() => router.push('/(modals)/translator-history')}
            >
              <NativeTypography variant="body" style={styles.toolbarButtonText}>
                Translator inbox
              </NativeTypography>
            </NativeButton>
          </View>
        </View>

        <NativeCard style={styles.progressCard}>
          <View style={styles.hudRow}>
            <NativeProgressRing
              progress={sessionProgress / 100}
              value={`${correctCount}/${5}`}
              label="Goal"
            />
            <View style={styles.hudStats}>
              <NativeStatPill label="Accuracy" value={`${accuracy || 0}%`} accent="green" />
              <NativeStatPill label="Attempts" value={`${totalAttempts}`} accent="gold" />
              <NativeStatPill label="Mode" value={practiceMode} accent="red" />
            </View>
          </View>
          <View style={styles.heartsRow}>
            {Array.from({ length: HEART_SLOTS }, (_, index) => (
              <Ionicons
                key={index}
                name="heart"
                size={20}
                color={index < hearts ? brandColors.red : 'rgba(16,24,40,0.2)'}
              />
            ))}
          </View>
        </NativeCard>

        <View style={styles.toggleRow}>
          <NativeButton
            variant={direction === 'enToMk' ? 'primary' : 'secondary'}
            style={styles.toggleButton}
            onPress={() => setDirection('enToMk')}
          >
            <NativeTypography variant="body" style={styles.toggleText}>
              EN → MK
            </NativeTypography>
          </NativeButton>
          <NativeButton
            variant={direction === 'mkToEn' ? 'primary' : 'secondary'}
            style={styles.toggleButton}
            onPress={() => setDirection('mkToEn')}
          >
            <NativeTypography variant="body" style={styles.toggleText}>
              MK → EN
            </NativeTypography>
          </NativeButton>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeRow}
        >
          {PRACTICE_MODES.map((mode) => (
            <NativeButton
              key={mode.key}
              variant={practiceMode === mode.key ? 'primary' : 'secondary'}
              style={styles.modeChip}
              onPress={() => setPracticeMode(mode.key)}
            >
              <NativeTypography variant="body" style={styles.modeText}>
                {mode.label}
              </NativeTypography>
            </NativeButton>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((item) => (
            <NativeButton
              key={item}
              variant={category === item ? 'primary' : 'secondary'}
              style={styles.categoryButton}
              onPress={() => setCategory(item)}
            >
              <NativeTypography variant="body" style={styles.categoryText}>
                {item === 'all' ? 'All topics' : item}
              </NativeTypography>
            </NativeButton>
          ))}
        </ScrollView>

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
          <NativeTypography variant="body" style={{ color: 'rgba(16,24,40,0.8)' }}>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.cream },
  container: { padding: spacingScale.xl, gap: spacingScale.lg },
  headerRow: { gap: spacingScale.sm },
  hero: { color: brandColors.navy },
  subtitle: { color: 'rgba(16,24,40,0.8)' },
  toolbar: { gap: spacingScale.xs },
  toolbarButton: { borderColor: 'rgba(16,24,40,0.2)', paddingVertical: spacingScale.xs },
  toolbarButtonText: { color: brandColors.navy },
  progressCard: { gap: spacingScale.md },
  hudRow: { flexDirection: 'row', gap: spacingScale.lg, alignItems: 'center' },
  hudStats: { flex: 1, gap: spacingScale.sm },
  heartsRow: {
    flexDirection: 'row',
    gap: spacingScale.xs,
    justifyContent: 'center',
  },
  toggleRow: { flexDirection: 'row', gap: spacingScale.sm },
  toggleButton: { flex: 1 },
  toggleText: { color: '#fff' },
  modeRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
    paddingVertical: spacingScale.xs,
  },
  modeChip: {
    minWidth: 140,
  },
  modeText: { color: '#fff' },
  categoryRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
    paddingVertical: spacingScale.xs,
  },
  categoryButton: {},
  categoryText: { color: '#fff' },
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
});
