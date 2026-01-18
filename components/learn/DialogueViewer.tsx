'use client';

import { useState, useCallback, useRef } from 'react';
import { Eye, EyeOff, RotateCcw, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

interface BlankData {
  position: number; // Word index in the line
  answer: string;
  hint?: string;
  acceptedAnswers?: string[]; // Alternative correct answers
}

interface DialogueLine {
  id: string;
  speaker?: string;
  textMk: string;
  textEn: string;
  transliteration?: string;
  hasBlanks: boolean;
  blanksData?: BlankData[];
}

interface DialogueData {
  id: string;
  title?: string;
  lines: DialogueLine[];
}

interface DialogueViewerProps {
  dialogue: DialogueData;
  /** View mode: 'view' shows dialogue, 'fill-blanks' enables interactive blanks */
  mode?: 'view' | 'fill-blanks';
  /** Show English translation */
  showTranslation?: boolean;
  /** Show Latin transliteration */
  showTransliteration?: boolean;
  /** Callback when all blanks are filled (fill-blanks mode) */
  onBlanksFilled?: (answers: Record<string, string>, isCorrect: boolean) => void;
  /** Callback when dialogue is completed */
  onComplete?: () => void;
  /** Class name for container */
  className?: string;
}

// Speaker colors for visual distinction - auto-assigns based on speaker name hash
const SPEAKER_PALETTE = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'bg-violet-500/15 text-violet-600 dark:text-violet-400',
];

// Generate consistent color for speaker name
const speakerColorCache = new Map<string, string>();
const getSpeakerColorFromName = (name: string): string => {
  if (speakerColorCache.has(name)) {
    return speakerColorCache.get(name)!;
  }
  // Simple hash based on character codes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  const color = SPEAKER_PALETTE[Math.abs(hash) % SPEAKER_PALETTE.length];
  speakerColorCache.set(name, color);
  return color;
};

// ============================================================================
// DialogueViewer Component
// ============================================================================

/**
 * DialogueViewer - Displays conversational dialogues with audio and interactive features
 * 
 * Features:
 * - Full dialogue audio playback
 * - Line-by-line audio playback with highlighting
 * - Translation and transliteration toggles
 * - Fill-in-the-blank mode for practice
 * - Speaker avatars with distinct colors
 */
export function DialogueViewer({
  dialogue,
  mode = 'view',
  showTranslation: initialShowTranslation = true,
  showTransliteration: initialShowTransliteration = false,
  onBlanksFilled,
  onComplete,
  className,
}: DialogueViewerProps) {
  // State
  const [showTranslation, setShowTranslation] = useState(initialShowTranslation);
  const [showTransliteration, setShowTransliteration] = useState(initialShowTransliteration);
  const [blankAnswers, setBlankAnswers] = useState<Record<string, Record<number, string>>>({});
  const [checkedBlanks, setCheckedBlanks] = useState<Record<string, Record<number, boolean>>>({});
  const [hintsVisible, setHintsVisible] = useState<Record<string, Record<number, boolean>>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Refs
  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Generate hint from answer (first letter + underscores showing length)
  const generateHint = useCallback((answer: string) => {
    const trimmed = answer.trim();
    if (trimmed.length <= 1) return trimmed;
    const firstChar = trimmed.charAt(0);
    const length = Math.min(trimmed.length - 1, 5);
    return `${firstChar}${'_'.repeat(length)}`;
  }, []);

  // Toggle hint visibility for a specific blank
  const toggleHint = useCallback((lineId: string, position: number) => {
    setHintsVisible(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [position]: !prev[lineId]?.[position],
      },
    }));
  }, []);

  // Handle blank input change
  const handleBlankChange = useCallback((lineId: string, position: number, value: string) => {
    setBlankAnswers(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [position]: value,
      },
    }));
  }, []);

  // Check blank answer
  const checkBlankAnswer = useCallback((line: DialogueLine, position: number) => {
    const blank = line.blanksData?.find(b => b.position === position);
    if (!blank) return false;

    const userAnswer = blankAnswers[line.id]?.[position]?.trim().toLowerCase() || '';
    const correctAnswer = blank.answer.toLowerCase();
    const acceptedAnswers = blank.acceptedAnswers?.map(a => a.toLowerCase()) || [];

    return userAnswer === correctAnswer || acceptedAnswers.includes(userAnswer);
  }, [blankAnswers]);

  // Check all blanks and call callback
  const handleCheckBlanks = useCallback(() => {
    const newCheckedBlanks: Record<string, Record<number, boolean>> = {};
    let allCorrect = true;

    dialogue.lines.forEach(line => {
      if (line.hasBlanks && line.blanksData) {
        newCheckedBlanks[line.id] = {};
        line.blanksData.forEach(blank => {
          const isCorrect = checkBlankAnswer(line, blank.position);
          newCheckedBlanks[line.id][blank.position] = isCorrect;
          if (!isCorrect) allCorrect = false;
        });
      }
    });

    setCheckedBlanks(newCheckedBlanks);
    setIsComplete(allCorrect);

    if (onBlanksFilled) {
      const flatAnswers: Record<string, string> = {};
      Object.entries(blankAnswers).forEach(([lineId, positions]) => {
        Object.entries(positions).forEach(([pos, answer]) => {
          flatAnswers[`${lineId}-${pos}`] = answer;
        });
      });
      onBlanksFilled(flatAnswers, allCorrect);
    }
  }, [dialogue.lines, checkBlankAnswer, blankAnswers, onBlanksFilled]);

  // Reset blanks
  const handleResetBlanks = useCallback(() => {
    setBlankAnswers({});
    setCheckedBlanks({});
    setHintsVisible({});
    setIsComplete(false);
  }, []);

  // Get speaker color class
  const getSpeakerColor = (speaker?: string) => {
    if (!speaker) return SPEAKER_PALETTE[0];
    return getSpeakerColorFromName(speaker);
  };

  // Render dialogue line with blanks
  const renderLineText = (line: DialogueLine) => {
    if (!line.hasBlanks || !line.blanksData || mode !== 'fill-blanks') {
      return <span>{line.textMk}</span>;
    }

    const words = line.textMk.split(' ');
    const blankPositions = new Set(line.blanksData.map(b => b.position));

    return (
      <span className="flex flex-wrap items-baseline gap-1">
        {words.map((word, idx) => {
          if (blankPositions.has(idx)) {
            const blank = line.blanksData?.find(b => b.position === idx);
            // Skip rendering blank input if blank data not found
            if (!blank) return <span key={idx}>{word}</span>;

            const userAnswer = blankAnswers[line.id]?.[idx] || '';
            const isChecked = checkedBlanks[line.id]?.[idx] !== undefined;
            const isCorrect = checkedBlanks[line.id]?.[idx];

            const hintText = blank.hint || generateHint(blank.answer);
            const isHintVisible = hintsVisible[line.id]?.[idx];

            return (
              <TooltipProvider key={idx}>
                <span className="inline-flex flex-col items-center gap-0.5">
                  <span className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => handleBlankChange(line.id, idx, e.target.value)}
                      placeholder={isHintVisible ? hintText : '____'}
                      disabled={isChecked && isCorrect}
                      className={cn(
                        'w-28 px-2 py-1 text-center border-b-2 bg-transparent outline-none transition-colors',
                        'text-base font-medium',
                        !isChecked && 'border-primary/50 focus:border-primary',
                        isChecked && isCorrect && 'border-green-500 text-green-600 dark:text-green-400',
                        isChecked && !isCorrect && 'border-red-500 text-red-600 dark:text-red-400'
                      )}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {!isChecked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleHint(line.id, idx)}
                            className={cn(
                              'p-1 rounded-full transition-colors',
                              isHintVisible
                                ? 'text-amber-500 bg-amber-500/20'
                                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10'
                            )}
                          >
                            <Lightbulb className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isHintVisible ? 'Hide hint' : 'Show hint'}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                  {isChecked && !isCorrect && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">{blank.answer}</span>
                  )}
                </span>
              </TooltipProvider>
            );
          }
          return <span key={idx}>{word}</span>;
        })}
      </span>
    );
  };

  // Check if all blanks are filled
  const allBlanksFilled = dialogue.lines
    .filter((l): l is DialogueLine & { blanksData: BlankData[] } =>
      l.hasBlanks && Array.isArray(l.blanksData) && l.blanksData.length > 0
    )
    .every(line =>
      line.blanksData.every(blank =>
        blankAnswers[line.id]?.[blank.position]?.trim()
      )
    );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {dialogue.title && (
          <h3 className="text-base font-medium text-foreground/90">{dialogue.title}</h3>
        )}

        <div className="flex items-center gap-2">
          {/* Toggle translation */}
          <Button
            variant={showTranslation ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className="gap-1.5 h-8"
          >
            {showTranslation ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">Translation</span>
          </Button>

          {/* Toggle transliteration */}
          <Button
            variant={showTransliteration ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowTransliteration(!showTransliteration)}
            title="Show Latin script"
            className="h-8 px-2"
          >
            <span className="text-xs font-mono">Aa</span>
          </Button>
        </div>
      </div>

      {/* Dialogue Lines */}
      <Card className="overflow-hidden border-border/40">
        <div className="divide-y divide-border/30">
          {dialogue.lines.map((line) => (
            <div
              key={line.id}
              ref={(el) => {
                if (el) lineRefs.current.set(line.id, el);
              }}
              className="px-4 py-3 transition-colors duration-200 hover:bg-muted/30"
            >
              <div className="flex gap-3 items-start">
                {/* Speaker badge */}
                {line.speaker && (
                  <div
                    className={cn(
                      'flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm mt-0.5',
                      getSpeakerColor(line.speaker)
                    )}
                    title={line.speaker}
                  >
                    {line.speaker.charAt(0)}
                  </div>
                )}

                {/* Line content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  {/* Speaker name */}
                  {line.speaker && (
                    <p className="text-xs font-medium text-muted-foreground/70">
                      {line.speaker}
                    </p>
                  )}

                  {/* Macedonian text */}
                  <div className="text-base font-medium leading-relaxed">
                    {renderLineText(line)}
                  </div>

                  {/* Transliteration */}
                  {showTransliteration && line.transliteration && (
                    <p className="text-sm text-muted-foreground/80 italic font-mono">
                      {line.transliteration}
                    </p>
                  )}

                  {/* English translation */}
                  {showTranslation && (
                    <p className="text-sm text-muted-foreground">
                      {line.textEn}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fill-blanks mode controls */}
      {mode === 'fill-blanks' && (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetBlanks}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          {isComplete ? (
            <Button onClick={onComplete} className="gap-2">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCheckBlanks}
              disabled={!allBlanksFilled}
              className="gap-2"
            >
              Check Answers
            </Button>
          )}
        </div>
      )}

      {/* Completion message */}
      {isComplete && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-green-600 dark:text-green-400 font-medium">
            🎉 Excellent! All answers are correct!
          </p>
        </div>
      )}
    </div>
  );
}

export default DialogueViewer;

