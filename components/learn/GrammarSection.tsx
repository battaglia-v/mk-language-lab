'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GrammarNote {
  id: string;
  title: string;
  explanation: string;
  examples: string; // JSON array
}

interface GrammarSectionProps {
  notes: GrammarNote[];
}

// Number of characters to show before truncating
const TRUNCATE_THRESHOLD = 200;

export default function GrammarSection({ notes }: GrammarSectionProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNote = (id: string) => {
    const newSet = new Set(expandedNotes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedNotes(newSet);
  };

  return (
    <div className="space-y-8">
      {notes.map((note, noteIndex) => {
        let examples: string[] = [];
        try {
          examples = JSON.parse(note.examples);
        } catch {
          // Handle empty or invalid JSON
        }

        const isLong = note.explanation.length > TRUNCATE_THRESHOLD;
        const isExpanded = expandedNotes.has(note.id);
        const shouldTruncate = isLong && !isExpanded;

        return (
          <Card
            key={note.id}
            className="p-4 sm:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20"
          >
            {/* Header with icon and title */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold leading-tight">
                  {note.title}
                </h3>
              </div>
            </div>

            {/* Explanation with expand/collapse */}
            <div className="mb-4">
              <p
                className={cn(
                  'text-base sm:text-lg text-muted-foreground leading-relaxed',
                  shouldTruncate && 'line-clamp-3'
                )}
              >
                {note.explanation}
              </p>

              {isLong && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleNote(note.id)}
                  className="mt-2 h-11 min-h-[44px] px-3 text-secondary hover:text-secondary/80"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Read more
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Examples section */}
            {examples.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Examples:
                </p>
                <ol className="space-y-3">
                  {examples.map((example, index) => {
                    // Try to split Macedonian and English if separated by common patterns
                    // Patterns: " - ", " – ", " — ", newline, or if contains parentheses
                    const parts = splitExample(example);

                    return (
                      <li
                        key={index}
                        className="pl-4 sm:pl-6 border-l-2 border-secondary/40"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-secondary/70 flex-shrink-0">
                            {noteIndex + 1}.{index + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-base sm:text-lg font-medium">
                              {parts.macedonian}
                            </p>
                            {parts.english && (
                              <p className="text-sm sm:text-base text-muted-foreground italic">
                                {parts.english}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Attempt to split an example into Macedonian and English parts.
 * Returns { macedonian, english } where english may be undefined.
 */
function splitExample(example: string): { macedonian: string; english?: string } {
  // Common separators between Macedonian and English
  const separators = [
    ' - ',   // hyphen
    ' – ',   // en dash
    ' — ',   // em dash
    '\n',    // newline
  ];

  for (const sep of separators) {
    if (example.includes(sep)) {
      const [first, ...rest] = example.split(sep);
      return {
        macedonian: first.trim(),
        english: rest.join(sep).trim() || undefined,
      };
    }
  }

  // Check for parentheses pattern: "Јас сум (I am)"
  const parenMatch = example.match(/^(.+?)\s*\((.+?)\)\s*$/);
  if (parenMatch) {
    return {
      macedonian: parenMatch[1].trim(),
      english: parenMatch[2].trim(),
    };
  }

  // No split found
  return { macedonian: example };
}
