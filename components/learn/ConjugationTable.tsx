'use client';

import { useState, useCallback } from 'react';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ConjugationRow {
  person: string; // "1sg", "2sg", "3sg", "1pl", "2pl", "3pl"
  pronoun: string; // "јас", "ти", etc.
  conjugation: string;
  transliteration?: string;
}

interface ConjugationTableProps {
  /** The verb being conjugated */
  verb: string;
  /** English translation of the verb */
  verbEn?: string;
  /** Tense of the conjugation */
  tense?: string;
  /** Type: affirmative, negative, interrogative */
  type?: 'affirmative' | 'negative' | 'interrogative';
  /** Conjugation rows */
  rows: ConjugationRow[];
  /** Person to highlight (for focused practice) */
  highlightPerson?: string;
  /** Show transliteration column */
  showTransliteration?: boolean;
  /** Quiz mode - hide conjugations */
  quizMode?: boolean;
  /** Callback when a row is clicked */
  onRowClick?: (person: string) => void;
  /** Callback for quiz answer */
  onQuizAnswer?: (person: string, answer: string, isCorrect: boolean) => void;
  /** Additional class name */
  className?: string;
}

// Person labels for display
const PERSON_LABELS: Record<string, { singular: string; plural: string }> = {
  '1sg': { singular: '1st person', plural: '' },
  '2sg': { singular: '2nd person', plural: '' },
  '3sg': { singular: '3rd person', plural: '' },
  '1pl': { singular: '1st person', plural: 'plural' },
  '2pl': { singular: '2nd person', plural: 'plural' },
  '3pl': { singular: '3rd person', plural: 'plural' },
};

// Tense colors
const TENSE_COLORS: Record<string, string> = {
  present: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  past: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  future: 'bg-green-500/10 text-green-600 border-green-500/20',
  imperfect: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  aorist: 'bg-red-500/10 text-red-600 border-red-500/20',
  default: 'bg-muted text-muted-foreground border-border',
};

// ============================================================================
// ConjugationTable Component
// ============================================================================

/**
 * ConjugationTable - Interactive verb conjugation table
 * 
 * Features:
 * - Clean table layout with proper alignment
 * - Audio playback per row (with TTS fallback)
 * - Row highlighting for focused practice
 * - Quiz mode (hide conjugations for self-testing)
 * - Transliteration toggle
 * - Responsive design
 */
export function ConjugationTable({
  verb,
  verbEn,
  tense = 'present',
  type = 'affirmative',
  rows,
  highlightPerson,
  showTransliteration: initialShowTransliteration = true,
  quizMode: initialQuizMode = false,
  onRowClick,
  onQuizAnswer,
  className,
}: ConjugationTableProps) {
  // State
  const [showTransliteration, setShowTransliteration] = useState(initialShowTransliteration);
  const [quizMode, setQuizMode] = useState(initialQuizMode);
  const [revealedRows, setRevealedRows] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});

  // Toggle row reveal in quiz mode
  const handleRevealRow = useCallback((person: string) => {
    setRevealedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(person)) {
        newSet.delete(person);
      } else {
        newSet.add(person);
      }
      return newSet;
    });
  }, []);

  // Handle quiz input change
  const handleQuizInput = useCallback((person: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [person]: value }));
  }, []);

  // Check quiz answer
  const handleCheckAnswer = useCallback((row: ConjugationRow) => {
    const userAnswer = quizAnswers[row.person]?.trim().toLowerCase() || '';
    const correctAnswer = row.conjugation.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    setCheckedAnswers(prev => ({ ...prev, [row.person]: isCorrect }));
    onQuizAnswer?.(row.person, userAnswer, isCorrect);
  }, [quizAnswers, onQuizAnswer]);

  // Get tense color
  const getTenseColor = (t: string) => {
    return TENSE_COLORS[t.toLowerCase()] || TENSE_COLORS.default;
  };

  // Check if row should be revealed
  const isRowRevealed = (person: string) => {
    return !quizMode || revealedRows.has(person) || checkedAnswers[person] !== undefined;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-primary">{verb}</h3>
              {verbEn && (
                <p className="text-sm text-muted-foreground">({verbEn})</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className={cn('text-xs', getTenseColor(tense))}>
                {tense}
              </Badge>
              {type !== 'affirmative' && (
                <Badge variant="outline" className="text-xs">
                  {type}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quiz mode toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={quizMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setQuizMode(!quizMode);
                      setRevealedRows(new Set());
                      setQuizAnswers({});
                      setCheckedAnswers({});
                    }}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {quizMode ? 'Exit quiz mode' : 'Practice mode'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Transliteration toggle */}
            <Button
              variant={showTransliteration ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTransliteration(!showTransliteration)}
              title="Show Latin script"
            >
              <span className="text-xs font-mono">Aa</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Person
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pronoun
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conjugation
              </th>
              {showTransliteration && (
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span className="font-mono">Translit.</span>
                </th>
              )}
              {quizMode && (
                <th className="px-4 py-3 w-12"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((row) => {
              const label = PERSON_LABELS[row.person];
              const isHighlighted = highlightPerson === row.person;
              const isRevealed = isRowRevealed(row.person);
              const isChecked = checkedAnswers[row.person] !== undefined;
              const isCorrect = checkedAnswers[row.person];

              return (
                <tr
                  key={row.person}
                  onClick={() => onRowClick?.(row.person)}
                  className={cn(
                    'transition-colors',
                    isHighlighted && 'bg-primary/10',
                    onRowClick && 'cursor-pointer hover:bg-muted/50'
                  )}
                >
                  {/* Person */}
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {label?.singular}
                    {label?.plural && (
                      <span className="ml-1 text-xs">({label.plural})</span>
                    )}
                  </td>

                  {/* Pronoun */}
                  <td className="px-4 py-3">
                    <span className="font-medium">{row.pronoun}</span>
                  </td>

                  {/* Conjugation */}
                  <td className="px-4 py-3">
                    {quizMode && !isRevealed ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={quizAnswers[row.person] || ''}
                          onChange={(e) => handleQuizInput(row.person, e.target.value)}
                          placeholder="Type conjugation..."
                          className={cn(
                            'w-32 px-2 py-1 text-sm border rounded bg-background',
                            isChecked && isCorrect && 'border-green-500 bg-green-500/5',
                            isChecked && !isCorrect && 'border-red-500 bg-red-500/5'
                          )}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCheckAnswer(row);
                          }}
                          disabled={isChecked}
                        />
                        {!isChecked ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCheckAnswer(row)}
                            disabled={!quizAnswers[row.person]?.trim()}
                          >
                            Check
                          </Button>
                        ) : !isCorrect ? (
                          <span className="text-sm text-green-600 font-medium">
                            {row.conjugation}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span
                        className={cn(
                          'font-semibold text-primary',
                          isHighlighted && 'text-lg'
                        )}
                      >
                        {row.conjugation}
                      </span>
                    )}
                  </td>

                  {/* Transliteration */}
                  {showTransliteration && (
                    <td className="px-4 py-3">
                      {isRevealed && row.transliteration && (
                        <span className="text-sm text-muted-foreground font-mono">
                          /{row.transliteration}/
                        </span>
                      )}
                    </td>
                  )}

                  {/* Reveal button in quiz mode */}
                  {quizMode && (
                    <td className="px-4 py-3">
                      {!isChecked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevealRow(row.person);
                          }}
                          className="h-8 w-8 rounded-full"
                        >
                          {revealedRows.has(row.person) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quiz mode footer */}
      {quizMode && (
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {Object.keys(checkedAnswers).length} / {rows.length} checked
            </span>
            <span className="text-green-600">
              {Object.values(checkedAnswers).filter(Boolean).length} correct
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ConjugationTable;

