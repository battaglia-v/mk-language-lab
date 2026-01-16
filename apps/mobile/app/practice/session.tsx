import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import {
  fetchPracticeItems,
  buildPracticeDeck,
  type PracticeDeck,
  type PracticeMode,
  type PracticeCard,
} from '../../lib/practice';
import {
  MultipleChoiceCard,
  TypingCard,
  ClozeCard,
  TapWordsCard,
  MatchingCard,
} from '../../components/practice';

type SessionAnswer = {
  cardId: string;
  isCorrect: boolean;
};

type SessionState = {
  cards: PracticeCard[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  startTime: number;
  answers: SessionAnswer[];
};

export default function PracticeSessionScreen() {
  const params = useLocalSearchParams<{
    deck?: string;
    mode?: string;
    count?: string;
  }>();

  const deckType = (params.deck || 'curated') as PracticeDeck;
  const mode = (params.mode || 'multipleChoice') as PracticeMode;
  const count = parseInt(params.count || '10', 10);

  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load practice items and build deck
  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        setIsLoading(true);
        setError(null);

        const items = await fetchPracticeItems(deckType, count);

        if (!active) return;

        if (items.length === 0) {
          setError('No practice items available');
          setIsLoading(false);
          return;
        }

        // Build shuffled practice deck
        const cards = buildPracticeDeck(items, mode);

        setSession({
          cards,
          currentIndex: 0,
          correct: 0,
          incorrect: 0,
          startTime: Date.now(),
          answers: [],
        });
        setIsLoading(false);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load practice session:', err);
        setError('Failed to load practice items');
        setIsLoading(false);
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [deckType, mode, count]);

  // Handle answer from card component
  const handleAnswer = useCallback(
    (answer: string, isCorrect: boolean) => {
      if (!session) return;

      const currentCard = session.cards[session.currentIndex];
      const newAnswers = [
        ...session.answers,
        { cardId: currentCard.id, isCorrect },
      ];

      const newCorrect = isCorrect ? session.correct + 1 : session.correct;
      const newIncorrect = isCorrect ? session.incorrect : session.incorrect + 1;
      const nextIndex = session.currentIndex + 1;

      // Check if session is complete
      if (nextIndex >= session.cards.length) {
        // Calculate session stats and navigate to results
        const duration = Math.floor((Date.now() - session.startTime) / 1000);
        const total = session.cards.length;

        router.replace(
          `/practice/results?correct=${newCorrect}&total=${total}&time=${duration}&deck=${deckType}`
        );
        return;
      }

      // Advance to next card
      setSession({
        ...session,
        currentIndex: nextIndex,
        correct: newCorrect,
        incorrect: newIncorrect,
        answers: newAnswers,
      });
    },
    [session, deckType]
  );

  // Handle close button - exit session early
  const handleClose = () => {
    router.back();
  };

  // Render current card based on mode
  const renderCard = () => {
    if (!session) return null;

    const card = session.cards[session.currentIndex];

    switch (mode) {
      case 'multipleChoice':
        return (
          <MultipleChoiceCard
            prompt={card.prompt}
            options={card.options || [card.answer]}
            correctAnswer={card.answer}
            onAnswer={handleAnswer}
          />
        );

      case 'typing':
        return (
          <TypingCard
            prompt={card.prompt}
            correctAnswer={card.answer}
            onAnswer={handleAnswer}
          />
        );

      case 'cloze':
        // For cloze, we construct a sentence with a blank
        return (
          <ClozeCard
            sentence={`___ means "${card.answer}"`}
            correctAnswer={card.prompt}
            translation={card.answer}
            onAnswer={handleAnswer}
          />
        );

      case 'tapWords':
        // For tap words, split the answer into words
        return (
          <TapWordsCard
            prompt={card.prompt}
            correctWords={card.answer.split(' ')}
            onAnswer={handleAnswer}
          />
        );

      case 'matching':
        // For matching, we need to group multiple cards
        const startIdx = Math.floor(session.currentIndex / 4) * 4;
        const matchingCards = session.cards.slice(startIdx, startIdx + 4);
        const pairs = matchingCards.map((c) => ({
          id: c.id,
          source: c.prompt,
          target: c.answer,
        }));
        return <MatchingCard pairs={pairs} onAnswer={handleAnswer} />;

      default:
        return (
          <MultipleChoiceCard
            prompt={card.prompt}
            options={card.options || [card.answer]}
            correctAnswer={card.answer}
            onAnswer={handleAnswer}
          />
        );
    }
  };

  // Calculate progress
  const progress = session
    ? ((session.currentIndex + 1) / session.cards.length) * 100
    : 0;
  const currentNum = session ? session.currentIndex + 1 : 0;
  const totalNum = session ? session.cards.length : 0;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f6d83b" />
          <Text style={styles.loadingText}>Loading practice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back to Practice</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <X size={24} color="#f7f8fb" />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Counter */}
        <Text style={styles.counter}>
          {currentNum} / {totalNum}
        </Text>
      </View>

      {/* Card area */}
      <View style={styles.cardArea}>{renderCard()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(247,248,251,0.6)',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f6d83b',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'rgba(247,248,251,0.6)',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(247,248,251,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#222536',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  counter: {
    color: 'rgba(247,248,251,0.6)',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 48,
    textAlign: 'right',
  },
  cardArea: {
    flex: 1,
  },
});
