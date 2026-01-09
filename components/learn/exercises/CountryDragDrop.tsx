'use client';

import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, RotateCcw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface CountrySentence {
  id: string;
  template: string; // e.g., "Тој е од ___"
  answer: string; // e.g., "Македонија"
  personName?: string;
  flagEmoji?: string;
  translation?: string; // e.g., "He is from Macedonia"
}

interface CountryDragDropProps {
  /** Sentences with blanks to fill */
  sentences: CountrySentence[];
  /** Available country names to choose from */
  countries: string[];
  /** Instructions text */
  instructions?: string;
  /** Callback when exercise is completed */
  onComplete?: (correct: number, total: number) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * CountryDragDrop - Fill country names into sentences
 * 
 * Based on textbook exercise "Од каде се овие луѓе?"
 * (Where are these people from?)
 * 
 * Features:
 * - Click country then click blank to fill
 * - Flag emojis for visual learning
 * - Immediate feedback on answers
 * - Shows translation after correct answer
 */
export function CountryDragDrop({
  sentences,
  countries,
  instructions = 'Fill in the blank with the correct country',
  onComplete,
  className,
}: CountryDragDropProps) {
  // State
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // sentenceId -> answer
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({}); // sentenceId -> isCorrect
  const [usedCountries, setUsedCountries] = useState<Set<string>>(new Set());

  // Calculate progress
  const correctCount = Object.values(checkedAnswers).filter(Boolean).length;
  const totalSentences = sentences.length;
  const isComplete = Object.keys(checkedAnswers).length === totalSentences;

  // Handle country selection
  const handleCountryClick = useCallback((country: string) => {
    if (usedCountries.has(country)) return;
    setSelectedCountry(country === selectedCountry ? null : country);
  }, [selectedCountry, usedCountries]);

  // Handle blank click (fill answer)
  const handleBlankClick = useCallback((sentenceId: string) => {
    // Don't allow changes to already checked answers
    if (checkedAnswers[sentenceId] !== undefined) return;
    
    if (!selectedCountry) return;

    // Fill in the answer
    setAnswers(prev => ({ ...prev, [sentenceId]: selectedCountry }));
    setSelectedCountry(null);
  }, [selectedCountry, checkedAnswers]);

  // Check a single answer
  const handleCheckAnswer = useCallback((sentence: CountrySentence) => {
    const userAnswer = answers[sentence.id];
    if (!userAnswer) return;

    const isCorrect = userAnswer.toLowerCase() === sentence.answer.toLowerCase();
    setCheckedAnswers(prev => ({ ...prev, [sentence.id]: isCorrect }));

    if (isCorrect) {
      setUsedCountries(prev => new Set([...prev, userAnswer]));
    }

    // Check if all are complete
    const newChecked = { ...checkedAnswers, [sentence.id]: isCorrect };
    if (Object.keys(newChecked).length === totalSentences) {
      const newCorrectCount = Object.values(newChecked).filter(Boolean).length;
      onComplete?.(newCorrectCount, totalSentences);
    }
  }, [answers, checkedAnswers, totalSentences, onComplete]);

  // Clear a wrong answer
  const handleClearAnswer = useCallback((sentenceId: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[sentenceId];
      return newAnswers;
    });
    setCheckedAnswers(prev => {
      const newChecked = { ...prev };
      delete newChecked[sentenceId];
      return newChecked;
    });
  }, []);

  // Reset entire exercise
  const handleReset = useCallback(() => {
    setSelectedCountry(null);
    setAnswers({});
    setCheckedAnswers({});
    setUsedCountries(new Set());
  }, []);

  // Render a sentence with blank
  const renderSentence = (sentence: CountrySentence) => {
    const parts = sentence.template.split('___');
    const userAnswer = answers[sentence.id];
    const isChecked = checkedAnswers[sentence.id] !== undefined;
    const isCorrect = checkedAnswers[sentence.id];

    return (
      <div className="flex items-center gap-1 flex-wrap">
        <span>{parts[0]}</span>
        
        {/* Blank / Answer */}
        <button
          onClick={() => !isChecked && handleBlankClick(sentence.id)}
          disabled={isChecked && isCorrect}
          className={cn(
            'inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-lg border-2 border-dashed transition-all',
            !userAnswer && selectedCountry && 'border-primary bg-primary/10 cursor-pointer',
            !userAnswer && !selectedCountry && 'border-muted-foreground/30 bg-muted/50',
            userAnswer && !isChecked && 'border-primary bg-primary/10',
            isChecked && isCorrect && 'border-green-500 bg-green-500/10 cursor-default',
            isChecked && !isCorrect && 'border-red-500 bg-red-500/10'
          )}
        >
          {userAnswer ? (
            <span className={cn(
              'font-medium',
              isCorrect && 'text-green-600',
              isChecked && !isCorrect && 'text-red-600 line-through'
            )}>
              {sentence.flagEmoji && <span className="mr-1">{sentence.flagEmoji}</span>}
              {userAnswer}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              {selectedCountry ? 'Click to fill' : '___'}
            </span>
          )}
        </button>

        <span>{parts[1]}</span>

        {/* Check / Clear buttons */}
        {userAnswer && !isChecked && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCheckAnswer(sentence)}
            className="ml-2 h-8"
          >
            Check
          </Button>
        )}
        {isChecked && !isCorrect && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleClearAnswer(sentence.id)}
            className="ml-2 h-8 text-red-600"
          >
            Try again
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Where are they from?
          </h3>
          <p className="text-sm text-muted-foreground">{instructions}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(correctCount / totalSentences) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {correctCount}/{totalSentences}
        </span>
      </div>

      {/* Country Selection */}
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-3">
          Click a country to select it:
        </p>
        <div className="flex flex-wrap gap-2">
          {countries.map((country) => {
            const isUsed = usedCountries.has(country);
            const isSelected = selectedCountry === country;
            // Find flag emoji if available
            const sentenceWithFlag = sentences.find(s => s.answer === country);
            const flagEmoji = sentenceWithFlag?.flagEmoji;

            return (
              <button
                key={country}
                onClick={() => handleCountryClick(country)}
                disabled={isUsed}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 transition-all font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  isUsed && 'opacity-40 cursor-default bg-green-500/10 border-green-500/30',
                  isSelected && !isUsed && 'border-primary bg-primary text-primary-foreground',
                  !isSelected && !isUsed && 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                {flagEmoji && <span className="mr-1">{flagEmoji}</span>}
                {country}
                {isUsed && <CheckCircle className="inline h-4 w-4 ml-2 text-green-500" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Sentences */}
      <div className="space-y-4">
        {sentences.map((sentence) => {
          const isChecked = checkedAnswers[sentence.id] !== undefined;
          const isCorrect = checkedAnswers[sentence.id];

          return (
            <Card
              key={sentence.id}
              className={cn(
                'p-4 transition-all',
                isCorrect && 'bg-green-500/5 border-green-500/20'
              )}
            >
              <div className="space-y-2">
                {/* Person name if provided */}
                {sentence.personName && (
                  <Badge variant="secondary" className="mb-2">
                    {sentence.personName}
                  </Badge>
                )}

                {/* Sentence with blank */}
                <div className="text-lg">
                  {renderSentence(sentence)}
                </div>

                {/* Translation (shown after correct) */}
                {isCorrect && sentence.translation && (
                  <p className="text-sm text-muted-foreground italic mt-2">
                    {sentence.translation}
                  </p>
                )}

                {/* Show correct answer if wrong */}
                {isChecked && !isCorrect && (
                  <p className="text-sm text-green-600 mt-2">
                    Correct answer: <strong>{sentence.answer}</strong>
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completion message */}
      {isComplete && (
        <Card className={cn(
          'p-6 text-center',
          correctCount === totalSentences
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        )}>
          <div className="flex flex-col items-center gap-3">
            {correctCount === totalSentences ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Perfect! All countries matched correctly!
                </p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">{correctCount}/{totalSentences}</span>
                </div>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  Good effort! You got {correctCount} out of {totalSentences} correct.
                </p>
                <Button variant="outline" onClick={handleReset} className="mt-2">
                  Try Again
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Help text */}
      {!isComplete && !selectedCountry && Object.keys(answers).length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          👆 Click a country above, then click on a blank to fill it in
        </p>
      )}
    </div>
  );
}

export default CountryDragDrop;

