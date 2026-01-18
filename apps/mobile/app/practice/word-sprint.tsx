/**
 * Word Sprint Practice Screen
 * 
 * Fill-in-the-blank multiple choice practice with Macedonian sentences
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/practice/word-sprint/WordSprintSession.tsx (PWA implementation)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Volume2, Zap, CheckCircle, XCircle, Trophy } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import {
  getWordSprintSession,
  refreshItemChoices,
  isAnswerCorrect,
  calculateXPForAnswer,
  type WordSprintItem,
  type Difficulty,
  type SessionLength,
} from '../../lib/word-sprint';
import { addLocalXP, updateStreak } from '../../lib/gamification';
import { trackPracticeStarted, trackPracticeCompleted, trackCorrectAnswer, trackIncorrectAnswer } from '../../lib/analytics';
import { useSuccessToast } from '../../lib/toast';

type SessionPhase = 'picking' | 'playing' | 'complete';

export default function WordSprintScreen() {
  const params = useLocalSearchParams<{ difficulty?: string; count?: string }>();
  const showSuccess = useSuccessToast();
  
  const [phase, setPhase] = useState<SessionPhase>('picking');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(
    (params.difficulty as Difficulty) || null
  );
  const [sessionLength, setSessionLength] = useState<SessionLength>(
    (Number(params.count) as SessionLength) || 10
  );
  const [queue, setQueue] = useState<WordSprintItem[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const sessionStart = useRef(Date.now());

  // Start session
  const startSession = useCallback((diff: Difficulty, length: SessionLength) => {
    setDifficulty(diff);
    setSessionLength(length);
    setPhase('playing');
    
    const items = getWordSprintSession(length, diff);
    setQueue(items);
    setIndex(0);
    setCorrectCount(0);
    setCurrentCombo(0);
    setBestCombo(0);
    setTotalXP(0);
    sessionStart.current = Date.now();
    
    trackPracticeStarted({
      deckType: 'word-sprint',
      mode: 'multiple-choice',
      difficulty: diff,
      cardCount: length,
    });
  }, []);

  // Auto-start if params provided
  useEffect(() => {
    if (params.difficulty) {
      startSession(params.difficulty as Difficulty, sessionLength);
    }
  }, []);

  const currentCard = queue[index];

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (!currentCard || feedback || !difficulty) return;
    
    setSelectedAnswer(answer);
    const correct = isAnswerCorrect(answer, currentCard.missing, difficulty);
    setFeedback(correct ? 'correct' : 'incorrect');
    
    // Animate feedback
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(feedbackAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
    ]).start();
    
    if (correct) {
      trackCorrectAnswer({ mode: 'word-sprint' });
      setCorrectCount((c) => c + 1);
      
      // Update combo
      setCurrentCombo((combo) => {
        const newCombo = combo + 1;
        setBestCombo((best) => Math.max(best, newCombo));
        
        // Calculate and add XP
        const xp = calculateXPForAnswer(difficulty, newCombo);
        setTotalXP((total) => total + xp);
        
        return newCombo;
      });
    } else {
      trackIncorrectAnswer({
        mode: 'word-sprint',
        userAnswer: answer,
        correctAnswer: currentCard.missing,
      });
      
      // Reset combo
      setCurrentCombo(0);
      
      // Re-insert card later in queue
      const reinsertAt = Math.min(index + 2 + Math.floor(Math.random() * 2), queue.length);
      const refreshedItem = refreshItemChoices(currentCard);
      setQueue((q) => [...q.slice(0, reinsertAt), refreshedItem, ...q.slice(reinsertAt)]);
    }
  }, [currentCard, feedback, difficulty, index, queue.length, feedbackAnim]);

  // Go to next card
  const goNext = useCallback(() => {
    setFeedback(null);
    setSelectedAnswer(null);
    feedbackAnim.setValue(0);
    
    if (index + 1 >= queue.length) {
      // Session complete
      setPhase('complete');
      
      // Save XP and update streak
      addLocalXP(totalXP, 'exercise_correct');
      updateStreak();
      
      // Track completion
      trackPracticeCompleted({
        deckType: 'word-sprint',
        mode: 'multiple-choice',
        correct: correctCount,
        total: queue.length,
        accuracy: Math.round((correctCount / queue.length) * 100),
        durationMs: Date.now() - sessionStart.current,
        xpEarned: totalXP,
      });
      
      showSuccess('Session Complete!', `+${totalXP} XP earned`);
      return;
    }
    
    setIndex((i) => i + 1);
  }, [index, queue.length, totalXP, correctCount, feedbackAnim, showSuccess]);

  // Auto-advance on correct
  useEffect(() => {
    if (feedback === 'correct') {
      const timer = setTimeout(goNext, 800);
      return () => clearTimeout(timer);
    }
  }, [feedback, goNext]);

  // Speak Macedonian text
  const speak = useCallback(() => {
    if (!currentCard || isSpeaking) return;
    
    setIsSpeaking(true);
    Speech.speak(currentCard.mk, {
      language: 'mk',
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [currentCard, isSpeaking]);

  // Difficulty picker
  if (phase === 'picking') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X color="#f7f8fb" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Word Sprint</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.pickerContent}>
          <Text style={styles.sectionTitle}>Choose Difficulty</Text>
          
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[styles.optionCard, difficulty === diff && styles.optionCardSelected]}
              onPress={() => setDifficulty(diff)}
            >
              <Text style={styles.optionTitle}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
              <Text style={styles.optionSubtitle}>
                {diff === 'easy' ? '2 choices' : '4 choices'}
              </Text>
            </TouchableOpacity>
          ))}
          
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Questions</Text>
          
          <View style={styles.lengthRow}>
            {([5, 10, 15, 20] as SessionLength[]).map((len) => (
              <TouchableOpacity
                key={len}
                style={[styles.lengthButton, sessionLength === len && styles.lengthButtonSelected]}
                onPress={() => setSessionLength(len)}
              >
                <Text style={[styles.lengthText, sessionLength === len && styles.lengthTextSelected]}>
                  {len}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.startButton, !difficulty && styles.startButtonDisabled]}
            onPress={() => difficulty && startSession(difficulty, sessionLength)}
            disabled={!difficulty}
          >
            <Text style={styles.startButtonText}>Start Sprint</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Results screen
  if (phase === 'complete') {
    const accuracy = Math.round((correctCount / queue.length) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsContent}>
          <Trophy color="#f6d83b" size={64} />
          <Text style={styles.resultsTitle}>Sprint Complete!</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{correctCount}/{queue.length}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bestCombo}</Text>
              <Text style={styles.statLabel}>Best Combo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f6d83b' }]}>+{totalXP}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>
          
          <View style={styles.resultsActions}>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() => startSession(difficulty!, sessionLength)}
            >
              <Text style={styles.resultButtonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultButton, styles.resultButtonSecondary]}
              onPress={() => router.back()}
            >
              <Text style={[styles.resultButtonText, styles.resultButtonTextSecondary]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Playing screen
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="#f7f8fb" size={24} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((index + 1) / queue.length) * 100}%` }]} />
        </View>
        <View style={styles.xpBadge}>
          <Zap color="#f6d83b" size={16} />
          <Text style={styles.xpText}>{totalXP}</Text>
        </View>
      </View>

      {/* Combo indicator */}
      {currentCombo >= 3 && (
        <View style={styles.comboBar}>
          <Text style={styles.comboText}>🔥 {currentCombo}x Combo!</Text>
        </View>
      )}

      {/* Card */}
      {currentCard && (
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.sentenceText}>{currentCard.maskedMk}</Text>
            <Text style={styles.translationText}>{currentCard.en}</Text>
            
            <TouchableOpacity onPress={speak} style={styles.speakButton}>
              <Volume2 color={isSpeaking ? '#f6d83b' : '#9ca3af'} size={24} />
            </TouchableOpacity>
          </View>

          {/* Choices */}
          <View style={styles.choicesGrid}>
            {currentCard.choices.map((choice, i) => {
              const isSelected = selectedAnswer === choice;
              const isCorrect = choice === currentCard.missing;
              const showResult = feedback !== null;
              
              let buttonStyle = styles.choiceButton;
              if (showResult && isCorrect) {
                buttonStyle = { ...styles.choiceButton, ...styles.choiceCorrect };
              } else if (showResult && isSelected && !isCorrect) {
                buttonStyle = { ...styles.choiceButton, ...styles.choiceIncorrect };
              }
              
              return (
                <TouchableOpacity
                  key={i}
                  style={buttonStyle}
                  onPress={() => handleAnswer(choice)}
                  disabled={feedback !== null}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                  {showResult && isCorrect && (
                    <CheckCircle color="#16a34a" size={20} style={styles.choiceIcon} />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle color="#dc2626" size={20} style={styles.choiceIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continue button (wrong answer) */}
          {feedback === 'incorrect' && (
            <TouchableOpacity style={styles.continueButton} onPress={goNext}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246, 216, 59, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    color: '#f6d83b',
    fontWeight: '600',
    fontSize: 14,
  },
  comboBar: {
    backgroundColor: 'rgba(246, 216, 59, 0.15)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  comboText: {
    color: '#f6d83b',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  pickerContent: {
    padding: 24,
  },
  sectionTitle: {
    color: '#f7f8fb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#f6d83b',
  },
  optionTitle: {
    color: '#f7f8fb',
    fontSize: 18,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  lengthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  lengthButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lengthButtonSelected: {
    borderColor: '#f6d83b',
  },
  lengthText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '600',
  },
  lengthTextSelected: {
    color: '#f6d83b',
  },
  startButton: {
    backgroundColor: '#f6d83b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#06060b',
    fontSize: 18,
    fontWeight: '700',
  },
  cardContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  sentenceText: {
    color: '#f7f8fb',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  translationText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  speakButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceButton: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  choiceCorrect: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderColor: '#16a34a',
    borderWidth: 2,
  },
  choiceIncorrect: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderColor: '#dc2626',
    borderWidth: 2,
  },
  choiceText: {
    color: '#f7f8fb',
    fontSize: 18,
    fontWeight: '500',
  },
  choiceIcon: {
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueText: {
    color: '#f7f8fb',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultsTitle: {
    color: '#f7f8fb',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statItem: {
    width: '45%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#f7f8fb',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  resultsActions: {
    width: '100%',
    gap: 12,
  },
  resultButton: {
    backgroundColor: '#f6d83b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resultButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#374151',
  },
  resultButtonText: {
    color: '#06060b',
    fontSize: 16,
    fontWeight: '700',
  },
  resultButtonTextSecondary: {
    color: '#f7f8fb',
  },
});
