'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Target, Lightbulb, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  type: string; // 'multiple_choice' | 'fill_blank' | 'translation'
  question: string;
  options: string; // Pipe-separated for multiple choice
  correctAnswer: string;
  explanation: string | null;
}

interface ExerciseSectionProps {
  exercises: Exercise[];
}

export default function ExerciseSection({ exercises }: ExerciseSectionProps) {
  const t = useTranslations('learn.exercises');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, boolean>>({});
  // Matching exercise state: { exerciseId: { macedonianWord: englishMatch, ... } }
  const [matchingSelections, setMatchingSelections] = useState<Record<string, Record<string, string>>>({});
  const [selectedMacedonian, setSelectedMacedonian] = useState<Record<string, string | null>>({});
  // Word order exercise state: { exerciseId: [selected words in order] }
  const [wordOrderSelections, setWordOrderSelections] = useState<Record<string, string[]>>({});

  // Handle retake all exercises (reset quiz)
  const handleRetakeAll = () => {
    setAnswers({});
    setChecked({});
    setResults({});
    setHintsShown({});
    setMatchingSelections({});
    setSelectedMacedonian({});
    setWordOrderSelections({});
  };

  // Get first letter hint for fill-in-blank exercises
  const getFirstLetterHint = (correctAnswer: string) => {
    const firstChar = correctAnswer.trim().charAt(0);
    const answerLength = correctAnswer.trim().length;
    return `${firstChar}${'_'.repeat(Math.min(answerLength - 1, 5))}`;
  };

  // Handle retry for an exercise
  const handleRetry = (exerciseId: string) => {
    setAnswers(prev => ({ ...prev, [exerciseId]: '' }));
    setChecked(prev => ({ ...prev, [exerciseId]: false }));
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[exerciseId];
      return newResults;
    });
  };

  const handleCheck = (exerciseId: string, correctAnswer: string) => {
    const userAnswer = answers[exerciseId] || '';
    // Use Unicode normalization for proper Macedonian character comparison
    const normalizedUser = userAnswer.trim().toLowerCase().normalize('NFC');
    const normalizedCorrect = correctAnswer.trim().toLowerCase().normalize('NFC');
    const isCorrect = normalizedUser === normalizedCorrect;

    setResults(prev => ({ ...prev, [exerciseId]: isCorrect }));
    setChecked(prev => ({ ...prev, [exerciseId]: true }));
  };

  const renderMultipleChoice = (exercise: Exercise) => {
    // Guard against null/undefined options
    const options = (exercise.options ?? '').split('|').map(opt => opt.trim()).filter(Boolean);

    // Don't render if no valid options
    if (options.length === 0) {
      return <p className="text-muted-foreground italic">No options available for this exercise.</p>;
    }

    const userAnswer = answers[exercise.id];
    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = userAnswer === optionLetter;
          const isCorrectOption = exercise.correctAnswer === optionLetter;

          return (
            <Button
              key={index}
              variant="choice"
              onClick={() => !isChecked && setAnswers(prev => ({ ...prev, [exercise.id]: optionLetter }))}
              disabled={isChecked}
              data-selected={isSelected && !isChecked}
              data-correct={isChecked && isCorrectOption}
              data-incorrect={isChecked && isSelected && !isCorrect}
              className="w-full h-auto min-h-14 p-4 justify-start text-left"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="font-semibold text-muted-foreground label-nowrap">{optionLetter}.</span>
                <span className="flex-1">{option}</span>
                {isChecked && isCorrectOption && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                )}
                {isChecked && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 ml-auto flex-shrink-0" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

  const renderFillBlank = (exercise: Exercise) => {
    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];
    const hintShown = hintsShown[exercise.id];

    return (
      <div className="space-y-3">
        {/* Hint section - shown before checking */}
        {!isChecked && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHintsShown(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              {hintShown ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {hintShown && (
              <span className="text-sm text-amber-600 dark:text-amber-400 font-mono">
                Answer starts with: <strong>{getFirstLetterHint(exercise.correctAnswer)}</strong>
              </span>
            )}
          </div>
        )}

        <Input
          value={answers[exercise.id] || ''}
          onChange={(e) => setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
          disabled={isChecked && isCorrect}
          placeholder="Type your answer in Macedonian..."
          className={cn(
            'text-lg',
            isChecked && isCorrect && 'border-green-500 bg-green-500/5',
            isChecked && !isCorrect && 'border-red-500 bg-red-500/5'
          )}
        />

        {isChecked && (
          <div className={cn(
            'flex items-center justify-between p-3 rounded-lg',
            isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
          )}>
            <p className={cn(
              'text-sm flex items-center gap-2',
              isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Correct!
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  The correct answer is: <strong>{exercise.correctAnswer}</strong>
                </>
              )}
            </p>
            {!isCorrect && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRetry(exercise.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTranslation = (exercise: Exercise) => {
    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];
    const hintShown = hintsShown[exercise.id];

    return (
      <div className="space-y-3">
        {/* Hint section for translation */}
        {!isChecked && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHintsShown(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              {hintShown ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {hintShown && (
              <span className="text-sm text-amber-600 dark:text-amber-400 font-mono">
                First letter: <strong>{getFirstLetterHint(exercise.correctAnswer)}</strong>
              </span>
            )}
          </div>
        )}

        <Input
          value={answers[exercise.id] || ''}
          onChange={(e) => setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
          disabled={isChecked && isCorrect}
          placeholder="Type your translation..."
          className={cn(
            'text-lg',
            isChecked && isCorrect && 'border-green-500 bg-green-500/5',
            isChecked && !isCorrect && 'border-red-500 bg-red-500/5'
          )}
        />

        {isChecked && (
          <div className={cn(
            'flex items-center justify-between p-3 rounded-lg',
            isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
          )}>
            <p className={cn(
              'text-sm flex items-center gap-2',
              isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Excellent translation!
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Suggested translation: <strong>{exercise.correctAnswer}</strong>
                </>
              )}
            </p>
            {!isCorrect && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRetry(exercise.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMatching = (exercise: Exercise) => {
    // Parse pipe-separated words
    const macedonianWords = (exercise.options ?? '').split('|').map(w => w.trim()).filter(Boolean);
    const englishWords = (exercise.correctAnswer ?? '').split('|').map(w => w.trim()).filter(Boolean);

    if (macedonianWords.length === 0 || englishWords.length !== macedonianWords.length) {
      return <p className="text-muted-foreground italic">Invalid matching exercise format.</p>;
    }

    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];
    const currentMatches = matchingSelections[exercise.id] || {};
    const selectedMk = selectedMacedonian[exercise.id];

    // Shuffle English words for display (seeded by exercise id for consistency)
    const shuffledEnglish = [...englishWords].sort((a, b) => {
      const hashA = a.split('').reduce((acc, c) => acc + c.charCodeAt(0), exercise.id.charCodeAt(0));
      const hashB = b.split('').reduce((acc, c) => acc + c.charCodeAt(0), exercise.id.charCodeAt(0));
      return hashA - hashB;
    });

    const handleMacedonianClick = (mkWord: string) => {
      if (isChecked) return;
      // If already matched, unmatch it
      if (currentMatches[mkWord]) {
        setMatchingSelections(prev => {
          const newMatches = { ...prev[exercise.id] };
          delete newMatches[mkWord];
          return { ...prev, [exercise.id]: newMatches };
        });
        return;
      }
      // Select/deselect
      setSelectedMacedonian(prev => ({
        ...prev,
        [exercise.id]: prev[exercise.id] === mkWord ? null : mkWord
      }));
    };

    const handleEnglishClick = (enWord: string) => {
      if (isChecked) return;
      // If this English word is already matched, ignore
      const alreadyMatchedTo = Object.entries(currentMatches).find(([, en]) => en === enWord);
      if (alreadyMatchedTo) {
        // Unmatch it
        setMatchingSelections(prev => {
          const newMatches = { ...prev[exercise.id] };
          delete newMatches[alreadyMatchedTo[0]];
          return { ...prev, [exercise.id]: newMatches };
        });
        return;
      }
      // If a Macedonian word is selected, create match
      if (selectedMk) {
        setMatchingSelections(prev => ({
          ...prev,
          [exercise.id]: { ...(prev[exercise.id] || {}), [selectedMk]: enWord }
        }));
        setSelectedMacedonian(prev => ({ ...prev, [exercise.id]: null }));
      }
    };

    const handleMatchingCheck = () => {
      // Check if all matches are correct
      let allCorrect = true;
      for (let i = 0; i < macedonianWords.length; i++) {
        const mk = macedonianWords[i];
        const expectedEn = englishWords[i];
        if (currentMatches[mk] !== expectedEn) {
          allCorrect = false;
          break;
        }
      }
      setResults(prev => ({ ...prev, [exercise.id]: allCorrect }));
      setChecked(prev => ({ ...prev, [exercise.id]: true }));
    };

    const matchedEnglishWords = new Set(Object.values(currentMatches));
    const allMatched = Object.keys(currentMatches).length === macedonianWords.length;

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-2">
          Tap a Macedonian word, then tap its English translation to match them.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Macedonian column */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Macedonian</p>
            {macedonianWords.map((word, idx) => {
              const isMatched = !!currentMatches[word];
              const isSelected = selectedMk === word;
              const matchedTo = currentMatches[word];

              // Check correctness after submit
              let matchCorrect: boolean | null = null;
              if (isChecked && isMatched) {
                matchCorrect = matchedTo === englishWords[idx];
              }

              return (
                <Button
                  key={`mk-${idx}`}
                  variant="choice"
                  onClick={() => handleMacedonianClick(word)}
                  disabled={isChecked}
                  className={cn(
                    'w-full justify-start text-left h-auto py-2 px-3',
                    isSelected && !isMatched && 'ring-2 ring-primary',
                    isMatched && !isChecked && 'bg-primary/10 border-primary/30',
                    isChecked && matchCorrect === true && 'bg-green-500/10 border-green-500/30',
                    isChecked && matchCorrect === false && 'bg-red-500/10 border-red-500/30'
                  )}
                >
                  <span>{word}</span>
                  {isMatched && !isChecked && (
                    <span className="ml-auto text-xs text-primary">→ {matchedTo}</span>
                  )}
                  {isChecked && matchCorrect === true && (
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
                  )}
                  {isChecked && matchCorrect === false && (
                    <XCircle className="h-4 w-4 text-red-500 ml-auto flex-shrink-0" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* English column */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">English</p>
            {shuffledEnglish.map((word, idx) => {
              const isMatchedTo = matchedEnglishWords.has(word);

              return (
                <Button
                  key={`en-${idx}`}
                  variant="choice"
                  onClick={() => handleEnglishClick(word)}
                  disabled={isChecked}
                  className={cn(
                    'w-full justify-start text-left h-auto py-2 px-3',
                    isMatchedTo && !isChecked && 'opacity-50',
                    selectedMk && !isMatchedTo && !isChecked && 'hover:ring-2 hover:ring-primary/50'
                  )}
                >
                  {word}
                </Button>
              );
            })}
          </div>
        </div>

        {isChecked && !isCorrect && (
          <div className="p-3 rounded-lg bg-red-500/10 space-y-2">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Some matches are incorrect. Correct answers:
            </p>
            <ul className="text-sm text-muted-foreground ml-6 space-y-1">
              {macedonianWords.map((mk, i) => (
                <li key={i}>{mk} → {englishWords[i]}</li>
              ))}
            </ul>
          </div>
        )}

        {isChecked && isCorrect && (
          <div className="p-3 rounded-lg bg-green-500/10">
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Perfect! All matches are correct.
            </p>
          </div>
        )}

        {!isChecked && (
          <Button
            onClick={handleMatchingCheck}
            disabled={!allMatched}
            className="mt-2"
          >
            Check Matches
          </Button>
        )}
      </div>
    );
  };

  const renderWordOrder = (exercise: Exercise) => {
    // Parse shuffled words from options
    const shuffledWords = (exercise.options ?? '').split('|').map(w => w.trim()).filter(Boolean);
    const correctAnswer = (exercise.correctAnswer ?? '').trim();

    if (shuffledWords.length === 0) {
      return <p className="text-muted-foreground italic">Invalid word order exercise format.</p>;
    }

    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];
    const selectedWords = wordOrderSelections[exercise.id] || [];

    // Words still available in the pool (not yet selected)
    const availableWords = shuffledWords.filter((word, idx) => {
      // Count how many times this word appears in shuffledWords up to this index
      const countInShuffled = shuffledWords.slice(0, idx + 1).filter(w => w === word).length;
      // Count how many times this word appears in selectedWords
      const countInSelected = selectedWords.filter(w => w === word).length;
      // This specific instance is available if we haven't selected enough of this word yet
      return countInSelected < countInShuffled;
    });

    const handleWordClick = (word: string) => {
      if (isChecked) return;
      setWordOrderSelections(prev => ({
        ...prev,
        [exercise.id]: [...(prev[exercise.id] || []), word]
      }));
    };

    const handleRemoveWord = (index: number) => {
      if (isChecked) return;
      setWordOrderSelections(prev => {
        const current = prev[exercise.id] || [];
        return {
          ...prev,
          [exercise.id]: [...current.slice(0, index), ...current.slice(index + 1)]
        };
      });
    };

    const handleClear = () => {
      if (isChecked) return;
      setWordOrderSelections(prev => ({
        ...prev,
        [exercise.id]: []
      }));
    };

    const handleWordOrderCheck = () => {
      // Join selected words with space and compare (normalize whitespace)
      const userAnswer = selectedWords.join(' ').replace(/\s+/g, ' ').trim().normalize('NFC');
      const expected = correctAnswer.replace(/\s+/g, ' ').trim().normalize('NFC');
      const correct = userAnswer === expected;

      setResults(prev => ({ ...prev, [exercise.id]: correct }));
      setChecked(prev => ({ ...prev, [exercise.id]: true }));
    };

    const allWordsUsed = availableWords.length === 0;

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-2">
          Tap words to arrange them in the correct order.
        </p>

        {/* Answer area - selected words */}
        <div className="min-h-14 p-3 rounded-lg border-2 border-dashed border-border bg-muted/20">
          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, idx) => (
                <button
                  key={`selected-${idx}`}
                  onClick={() => handleRemoveWord(idx)}
                  disabled={isChecked}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                    isChecked && 'cursor-default'
                  )}
                >
                  {word}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Tap words below to build your answer
            </p>
          )}
        </div>

        {/* Word pool - available words */}
        <div className="flex flex-wrap gap-2">
          {shuffledWords.map((word, idx) => {
            // Check if this specific instance is in the pool
            const countInShuffledUpToHere = shuffledWords.slice(0, idx + 1).filter(w => w === word).length;
            const countInSelected = selectedWords.filter(w => w === word).length;
            const isAvailable = countInSelected < countInShuffledUpToHere;

            return (
              <button
                key={`pool-${idx}`}
                onClick={() => isAvailable && handleWordClick(word)}
                disabled={isChecked || !isAvailable}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  'bg-muted hover:bg-muted/80 border border-border',
                  !isAvailable && 'opacity-30 cursor-default',
                  isChecked && 'cursor-default'
                )}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Clear button */}
        {!isChecked && selectedWords.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        {/* Result display */}
        {isChecked && (
          <div className={cn(
            'p-3 rounded-lg',
            isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
          )}>
            <p className={cn(
              'text-sm flex items-center gap-2',
              isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Perfect! Correct word order.
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Correct answer: <strong>{correctAnswer}</strong>
                </>
              )}
            </p>
          </div>
        )}

        {/* Check button */}
        {!isChecked && (
          <Button
            onClick={handleWordOrderCheck}
            disabled={!allWordsUsed}
            className="mt-2"
          >
            Check Order
          </Button>
        )}
      </div>
    );
  };

  // Calculate progress stats
  const totalExercises = exercises.length;
  const completedCount = Object.keys(checked).filter(id => checked[id]).length;
  const correctCount = Object.values(results).filter(Boolean).length;
  const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
  const quizCompleted = completedCount === totalExercises && totalExercises > 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {totalExercises > 1 && (
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Progress: {completedCount} of {totalExercises} completed
            </span>
            {completedCount > 0 && (
              <span className={cn(
                'font-medium',
                correctCount === completedCount ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}>
                {correctCount}/{completedCount} correct
              </span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                correctCount === completedCount && completedCount > 0
                  ? 'bg-green-500'
                  : 'bg-primary'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="p-6 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="exercise-header flex-1 min-w-0">
              <div className="exercise-meta">
                <span className="metadata-item">
                  <span className="label-nowrap">Exercise {index + 1} of {totalExercises}</span>
                </span>
                <span className="card-meta-separator">·</span>
                <span className="mode-badge bg-primary/10 text-primary">
                  {exercise.type.replace('_', ' ')}
                </span>
              </div>
              <p className="exercise-title mt-1">{exercise.question}</p>
            </div>
          </div>

          <div className="mt-4">
            {exercise.type === 'multiple_choice' && renderMultipleChoice(exercise)}
            {exercise.type === 'fill_blank' && renderFillBlank(exercise)}
            {exercise.type === 'translation' && renderTranslation(exercise)}
            {exercise.type === 'matching' && renderMatching(exercise)}
            {exercise.type === 'word_order' && renderWordOrder(exercise)}
          </div>

          {/* Check button for standard exercise types (not matching/word_order - they have their own) */}
          {!checked[exercise.id] && exercise.type !== 'matching' && exercise.type !== 'word_order' && (
            <Button
              onClick={() => handleCheck(exercise.id, exercise.correctAnswer)}
              disabled={!answers[exercise.id]}
              className="mt-4"
            >
              Check Answer
            </Button>
          )}

          {checked[exercise.id] && exercise.explanation && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong>Explanation:</strong> {exercise.explanation}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Quiz Complete - Retake Section */}
      {quizCompleted && (
        <Card className="p-6 bg-muted/30 border-border/50">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('quizComplete')}</h3>
              <p className={cn(
                'text-sm',
                correctCount === totalExercises
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}>
                {t('scoreText', { correct: correctCount, total: totalExercises })}
              </p>
            </div>
            <Button
              onClick={handleRetakeAll}
              variant="outline"
              className="min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('retakeQuiz')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
