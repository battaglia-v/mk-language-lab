import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { NativeCard, NativeTypography } from '@mk/ui';
import type { PracticeCardContent, PracticeEvaluationResult } from '@mk/practice';
import { spacingScale } from '@mk/tokens';
import { PracticeCardContentView } from './PracticeCard';

type SwipeableCardProps = {
  card?: PracticeCardContent;
  nextCard?: PracticeCardContent;
  loading: boolean;
  submitAnswer: (value: string, options?: { autoAdvance?: boolean }) => PracticeEvaluationResult | null;
  onAdvance: () => void;
  onSkip: () => void;
  onReveal: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export function SwipeableCard({
  card,
  nextCard,
  loading,
  submitAnswer,
  onAdvance,
  onSkip,
  onReveal,
}: SwipeableCardProps) {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  useEffect(() => {
    setInputValue('');
    setFeedback(null);
    setRevealedAnswer(null);
    setIsRevealed(false);
    translateX.value = 0;
    translateY.value = 0;
    rotateZ.value = 0;
  }, [card?.id, rotateZ, translateX, translateY]);

  const animateOut = useCallback(
    (direction: 'left' | 'right', callback: () => void) => {
      const targetX = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
      translateX.value = withTiming(targetX, { duration: 220 }, () => {
        runOnJS(callback)();
      });
    },
    [translateX]
  );

  const handleReveal = useCallback(() => {
    if (!card) return;
    setIsRevealed(true);
    setRevealedAnswer(card.answer);
    onReveal();
  }, [card, onReveal]);

  const handleSubmit = useCallback(
    (autoAdvance: boolean) => {
      if (!card) return;
      const result = submitAnswer(inputValue, { autoAdvance: false });
      if (!result) return;
      if (result.isCorrect) {
        setFeedback('correct');
        setRevealedAnswer(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        animateOut('right', () => {
          onAdvance();
        });
      } else {
        setFeedback('incorrect');
        setRevealedAnswer(result.expectedAnswer);
        setInputValue('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
        if (autoAdvance) {
          animateOut('left', () => {
            onAdvance();
          });
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      }
    },
    [animateOut, card, inputValue, onAdvance, submitAnswer, translateX, translateY]
  );

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        rotateZ.value = event.translationX / SCREEN_WIDTH;
      })
      .onEnd((event) => {
        if (event.translationX > SWIPE_THRESHOLD) {
          runOnJS(handleSubmit)(true);
          return;
        }
        if (event.translationX < -SWIPE_THRESHOLD) {
          runOnJS(onSkip)();
          animateOut('left', () => {});
          return;
        }
        if (event.translationY < -SWIPE_THRESHOLD * 0.6) {
          runOnJS(handleReveal)();
        }
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotateZ.value = withSpring(0);
      });
  }, [animateOut, handleReveal, handleSubmit, onSkip, rotateZ, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value * 0.1}rad` },
    ],
  }));

  if (!card) {
    return (
      <NativeCard style={styles.emptyCard}>
        <NativeTypography variant="body">No prompts available.</NativeTypography>
      </NativeCard>
    );
  }

  return (
    <View style={styles.stackContainer}>
      {nextCard ? (
        <NativeCard style={styles.previewCard}>
          <NativeTypography variant="body" style={styles.previewLabel}>
            Next up
          </NativeTypography>
          <NativeTypography variant="title" style={{ color: '#1c1e23' }}>
            {nextCard.prompt}
          </NativeTypography>
        </NativeCard>
      ) : null}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.animatedCard, animatedStyle]}>
          <NativeCard style={styles.interactiveCard}>
            <PracticeCardContentView
              card={card}
              value={inputValue}
              onChangeValue={setInputValue}
              onSubmit={() => handleSubmit(true)}
              onReveal={handleReveal}
              feedback={feedback}
              revealedAnswer={revealedAnswer}
              isRevealed={isRevealed}
              disabled={loading}
            />
          </NativeCard>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  stackContainer: {
    marginTop: spacingScale.lg,
    marginBottom: spacingScale.lg,
    minHeight: 320,
  },
  previewCard: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    opacity: 0.3,
    transform: [{ scale: 0.96 }],
  },
  previewLabel: {
    color: 'rgba(16,24,40,0.6)',
    marginBottom: spacingScale.xs,
  },
  animatedCard: {
    zIndex: 5,
  },
  interactiveCard: {
    padding: spacingScale.lg,
    gap: spacingScale.sm,
  },
  emptyCard: {
    padding: spacingScale.lg,
    alignItems: 'center',
  },
});
