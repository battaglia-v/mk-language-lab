import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  useReducedMotion,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeCard, NativeTypography } from '@mk/ui';
import type { PracticeCardContent, PracticeEvaluationResult } from '@mk/practice';
import { brandColors, spacingScale } from '@mk/tokens';
import { PracticeCardContentView } from './PracticeCard';
import { triggerHaptic } from '../../../lib/haptics';

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
  const prefersReducedMotion = useReducedMotion();

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
      // Skip animation when reduced motion is preferred
      if (prefersReducedMotion) {
        translateX.value = targetX;
        callback();
        return;
      }
      translateX.value = withTiming(targetX, { duration: 220 }, () => {
        runOnJS(callback)();
      });
    },
    [prefersReducedMotion, translateX]
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
        void triggerHaptic('correctAnswer');
        animateOut('right', () => {
          onAdvance();
        });
      } else {
        setFeedback('incorrect');
        setRevealedAnswer(result.expectedAnswer);
        setInputValue('');
        void triggerHaptic('incorrectAnswer');
        if (autoAdvance) {
          animateOut('left', () => {
            onAdvance();
          });
        } else {
          // Skip spring animation when reduced motion is preferred
          if (prefersReducedMotion) {
            translateX.value = 0;
            translateY.value = 0;
          } else {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
          }
        }
      }
    },
    [animateOut, card, inputValue, onAdvance, prefersReducedMotion, submitAnswer, translateX, translateY]
  );

  const handleSkipWithAnimation = useCallback(() => {
    onSkip();
    animateOut('left', () => {});
  }, [animateOut, onSkip]);

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
          runOnJS(handleSkipWithAnimation)();
          return;
        }
        if (event.translationY < -SWIPE_THRESHOLD * 0.6) {
          runOnJS(handleReveal)();
        }
        // Reset position - use instant values for reduced motion
        // Note: prefersReducedMotion is available in worklets from useReducedMotion
        if (prefersReducedMotion) {
          translateX.value = 0;
          translateY.value = 0;
          rotateZ.value = 0;
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          rotateZ.value = withSpring(0);
        }
      });
  }, [handleReveal, handleSkipWithAnimation, handleSubmit, prefersReducedMotion, rotateZ, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value * 0.1}rad` },
    ],
  }));

  // Gesture hint overlays that fade in/out based on swipe direction
  const rightHintStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 0.9], Extrapolation.CLAMP);
    return { opacity };
  });

  const leftHintStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, -SWIPE_THRESHOLD / 2], [0, 0.9], Extrapolation.CLAMP);
    return { opacity };
  });

  const upHintStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [0, -SWIPE_THRESHOLD * 0.4], [0, 0.9], Extrapolation.CLAMP);
    return { opacity };
  });

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
          <NativeTypography variant="title" style={{ color: brandColors.text }}>
            {nextCard.prompt}
          </NativeTypography>
        </NativeCard>
      ) : null}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.animatedCard, animatedStyle]}>
          {/* Gesture Hints */}
          <Animated.View style={[styles.gestureHint, styles.gestureHintRight, rightHintStyle]} pointerEvents="none">
            <Ionicons name="checkmark-circle" size={48} color={brandColors.green} />
            <NativeTypography variant="body" style={styles.gestureHintText}>
              Submit
            </NativeTypography>
          </Animated.View>

          <Animated.View style={[styles.gestureHint, styles.gestureHintLeft, leftHintStyle]} pointerEvents="none">
            <Ionicons name="close-circle" size={48} color={brandColors.red} />
            <NativeTypography variant="body" style={styles.gestureHintText}>
              Skip
            </NativeTypography>
          </Animated.View>

          <Animated.View style={[styles.gestureHint, styles.gestureHintUp, upHintStyle]} pointerEvents="none">
            <Ionicons name="eye" size={32} color={brandColors.gold} />
            <NativeTypography variant="caption" style={styles.gestureHintText}>
              Reveal
            </NativeTypography>
          </Animated.View>

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
    color: 'rgba(247,248,251,0.6)',
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
  gestureHint: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingScale.xs,
    padding: spacingScale.md,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gestureHintRight: {
    top: '40%',
    right: spacingScale.lg,
  },
  gestureHintLeft: {
    top: '40%',
    left: spacingScale.lg,
  },
  gestureHintUp: {
    top: spacingScale.lg,
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  gestureHintText: {
    color: brandColors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
