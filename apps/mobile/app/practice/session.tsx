import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import {
  fetchPracticeItems,
  buildPracticeDeck,
  submitPracticeCompletion,
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
import {
  loadSession,
  saveSession,
  clearSession,
  isSessionStale,
  generateSessionId,
  createDebouncedSave,
  type PersistedSession,
} from '../../lib/session-persistence';

type SessionAnswer = {
  cardId: string;
  isCorrect: boolean;
};

type SessionState = {
  id: string;
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

  // Resume prompt state
  const [pendingResume, setPendingResume] = useState<PersistedSession | null>(
    null
  );
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Debounced save for session persistence
  const debouncedSave = useMemo(() => createDebouncedSave(500), []);
  const debouncedSaveRef = useRef(debouncedSave);

  // Check for persisted session on mount
  useEffect(() => {
    async function checkPersistedSession() {
      const persisted = await loadSession();

      if (
        persisted &&
        persisted.deck === deckType &&
        persisted.mode === mode &&
        !isSessionStale(persisted)
      ) {
        // Found a valid session to resume
        setPendingResume(persisted);
        setShowResumePrompt(true);
        setIsLoading(false);
      } else {
        // No valid session - clear any stale one and load fresh
        if (persisted) {
          await clearSession();
        }
        loadFreshSession();
      }
    }

    checkPersistedSession();

    // Cleanup: flush any pending saves on unmount
    return () => {
      debouncedSaveRef.current.cancel();
    };
  }, [deckType, mode]);

  // Load fresh session from API
  const loadFreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const items = await fetchPracticeItems(deckType, count);

      if (items.length === 0) {
        setError('No practice items available');
        setIsLoading(false);
        return;
      }

      // Build shuffled practice deck
      const cards = buildPracticeDeck(items, mode);

      const newSession: SessionState = {
        id: generateSessionId(),
        cards,
        currentIndex: 0,
        correct: 0,
        incorrect: 0,
        startTime: Date.now(),
        answers: [],
      };

      setSession(newSession);
      setIsLoading(false);

      // Save initial session state
      await saveSession({
        id: newSession.id,
        deck: deckType,
        mode,
        cards,
        currentIndex: 0,
        correct: 0,
        incorrect: 0,
        startTime: newSession.startTime,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error('Failed to load practice session:', err);
      setError('Failed to load practice items');
      setIsLoading(false);
    }
  }, [deckType, mode, count]);

  // Handle resume from persisted session
  const handleResume = useCallback(() => {
    if (!pendingResume) return;

    setSession({
      id: pendingResume.id,
      cards: pendingResume.cards,
      currentIndex: pendingResume.currentIndex,
      correct: pendingResume.correct,
      incorrect: pendingResume.incorrect,
      startTime: pendingResume.startTime,
      answers: [], // Answers not persisted, rebuild as we go
    });

    setShowResumePrompt(false);
    setPendingResume(null);
  }, [pendingResume]);

  // Handle start fresh (discard persisted session)
  const handleStartFresh = useCallback(async () => {
    await clearSession();
    setShowResumePrompt(false);
    setPendingResume(null);
    loadFreshSession();
  }, [loadFreshSession]);

  // Handle answer from card component
  const handleAnswer = useCallback(
    async (answer: string, isCorrect: boolean) => {
      if (!session) return;

      const currentCard = session.cards[session.currentIndex];
      const newAnswers = [
        ...session.answers,
        { cardId: currentCard.id, isCorrect },
      ];

      const newCorrect = isCorrect ? session.correct + 1 : session.correct;
      const newIncorrect = isCorrect
        ? session.incorrect
        : session.incorrect + 1;
      const nextIndex = session.currentIndex + 1;

      // Check if session is complete
      if (nextIndex >= session.cards.length) {
        // Clear persisted session
        await clearSession();
        debouncedSaveRef.current.cancel();

        // Calculate session stats
        const duration = Math.floor((Date.now() - session.startTime) / 1000);
        const total = session.cards.length;
        const accuracy = Math.round((newCorrect / total) * 100);
        const xpEarned = 10 + newCorrect * 5;

        // Submit completion (will queue if offline)
        submitPracticeCompletion({
          deckType,
          mode,
          correct: newCorrect,
          total,
          accuracy,
          xpEarned,
          durationMs: duration * 1000,
        });

        // Navigate to results
        router.replace(
          `/practice/results?correct=${newCorrect}&total=${total}&time=${duration}&deck=${deckType}`
        );
        return;
      }

      // Advance to next card
      const updatedSession: SessionState = {
        ...session,
        currentIndex: nextIndex,
        correct: newCorrect,
        incorrect: newIncorrect,
        answers: newAnswers,
      };

      setSession(updatedSession);

      // Auto-save session (debounced)
      debouncedSaveRef.current.save({
        id: session.id,
        deck: deckType,
        mode,
        cards: session.cards,
        currentIndex: nextIndex,
        correct: newCorrect,
        incorrect: newIncorrect,
        startTime: session.startTime,
        lastUpdated: Date.now(),
      });
    },
    [session, deckType, mode]
  );

  // Handle close button - exit session early
  const handleClose = useCallback(async () => {
    // Flush any pending saves before closing
    await debouncedSaveRef.current.flush();
    router.back();
  }, []);

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
        return (
          <ClozeCard
            sentence={`___ means "${card.answer}"`}
            correctAnswer={card.prompt}
            translation={card.answer}
            onAnswer={handleAnswer}
          />
        );

      case 'tapWords':
        return (
          <TapWordsCard
            prompt={card.prompt}
            correctWords={card.answer.split(' ')}
            onAnswer={handleAnswer}
          />
        );

      case 'matching':
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

  // Resume prompt modal
  if (showResumePrompt && pendingResume) {
    return (
      <SafeAreaView style={styles.container}>
        <Modal
          visible={true}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.resumeCard}>
              <Text style={styles.resumeTitle}>Resume Practice?</Text>
              <Text style={styles.resumeDescription}>
                You have an unfinished session ({pendingResume.currentIndex}/
                {pendingResume.cards.length} cards)
              </Text>

              <TouchableOpacity
                style={styles.resumeButton}
                onPress={handleResume}
                activeOpacity={0.7}
              >
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.freshButton}
                onPress={handleStartFresh}
                activeOpacity={0.7}
              >
                <Text style={styles.freshButtonText}>Start Fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

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
              loadFreshSession();
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
  // Resume prompt styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resumeCard: {
    backgroundColor: '#0b0b12',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#222536',
  },
  resumeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 8,
  },
  resumeDescription: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  resumeButton: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  freshButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#222536',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  freshButtonText: {
    color: '#f7f8fb',
    fontSize: 16,
    fontWeight: '600',
  },
});
