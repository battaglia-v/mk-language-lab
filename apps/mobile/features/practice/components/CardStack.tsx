import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import type { PracticeCardContent, PracticeEvaluationResult } from '@mk/practice';
import { NativeTypography } from '@mk/ui';
import { brandColors } from '@mk/tokens';
import { TypingCard } from './cards/TypingCard';
import { ClozeCard } from './cards/ClozeCard';
import { MultipleChoiceCard } from './cards/MultipleChoiceCard';
import { ListeningCard } from './cards/ListeningCard';
import { triggerHaptic } from '../../../lib/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 220;

type SwipeDirection = 'left' | 'right' | 'up';

type CardStackProps = {
  card?: PracticeCardContent;
  isLoading?: boolean;
  onResult: (result: 'correct' | 'incorrect' | 'skip') => void;
  onEvaluateAnswer: (input: string) => PracticeEvaluationResult | null;
};

export function CardStack({ card, isLoading, onResult, onEvaluateAnswer }: CardStackProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const cardKey = useMemo(() => (card ? `${card.id}-${card.type}` : 'empty'), [card]);

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [cardKey, position]);

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      const result =
        direction === 'right' ? 'correct' : direction === 'left' ? 'incorrect' : 'skip';
      onResult(result);
      position.setValue({ x: 0, y: 0 });
    },
    [onResult, position]
  );

  const forceSwipe = useCallback(
    (direction: SwipeDirection) => {
      const x = direction === 'right' ? SCREEN_WIDTH : direction === 'left' ? -SCREEN_WIDTH : 0;
      const y = direction === 'up' ? -SCREEN_WIDTH : 0;
      Animated.timing(position, {
        toValue: { x, y },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }).start(() => handleSwipeComplete(direction));
    },
    [handleSwipeComplete, position]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  }, [position]);

  // Track if we've passed the threshold to provide haptic feedback once
  const hasTriggeredHaptic = useRef(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
        onPanResponderGrant: () => {
          hasTriggeredHaptic.current = false;
        },
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
          // Trigger haptic when crossing threshold
          if (!hasTriggeredHaptic.current) {
            const crossedThreshold =
              Math.abs(gesture.dx) > SWIPE_THRESHOLD ||
              Math.abs(gesture.dy) > SWIPE_THRESHOLD;
            if (crossedThreshold) {
              hasTriggeredHaptic.current = true;
              void triggerHaptic('selection');
            }
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else if (gesture.dy < -SWIPE_THRESHOLD) {
            forceSwipe('up');
          } else {
            resetPosition();
          }
        },
      }),
    [forceSwipe, resetPosition, position]
  );

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const cardStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  if (!card) {
    return (
      <View style={styles.emptyState}>
        <NativeTypography variant="body" style={styles.emptyText}>
          {isLoading ? 'Loading practice session…' : 'No prompts ready for this filter.'}
        </NativeTypography>
      </View>
    );
  }

  const handleResolved = (result: 'correct' | 'incorrect') => {
    forceSwipe(result === 'correct' ? 'right' : 'left');
  };

  const renderCard = () => {
    switch (card.type) {
      case 'cloze':
        return (
          <ClozeCard
            card={card}
            onEvaluateAnswer={onEvaluateAnswer}
            onResolved={handleResolved}
            onSkip={() => forceSwipe('up')}
          />
        );
      case 'multipleChoice':
        return (
          <MultipleChoiceCard
            card={card}
            onEvaluateAnswer={onEvaluateAnswer}
            onResolved={handleResolved}
            onSkip={() => forceSwipe('up')}
          />
        );
      case 'listening':
        return (
          <ListeningCard
            card={card}
            onResolved={handleResolved}
            onSkip={() => forceSwipe('up')}
          />
        );
      case 'typing':
      default:
        return (
          <TypingCard
            card={card}
            onEvaluateAnswer={onEvaluateAnswer}
            onResolved={handleResolved}
            onSkip={() => forceSwipe('up')}
          />
        );
    }
  };

  return (
    <Animated.View style={[styles.card, cardStyle]} {...panResponder.panHandlers}>
      {renderCard()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: brandColors.cream,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  emptyState: {
    minHeight: 240,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(247,248,251,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  emptyText: {
    color: 'rgba(247,248,251,0.7)',
    textAlign: 'center',
  },
});
