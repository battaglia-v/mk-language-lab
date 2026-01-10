'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
const TRUNCATE_THRESHOLD = 150;

export default function GrammarSection({ notes }: GrammarSectionProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedExamples, setExpandedExamples] = useState<Record<string, boolean>>({});

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleExamples = (id: string) => {
    setExpandedExamples((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {notes.map((note) => {
        let examples: string[] = [];
        // Guard against null/undefined/empty examples before parsing
        if (note.examples && note.examples.trim()) {
          try {
            const parsed = JSON.parse(note.examples);
            // Ensure parsed result is an array
            examples = Array.isArray(parsed) ? parsed : [];
          } catch {
            // Handle invalid JSON
          }
        }

        const isLong = note.explanation.length > TRUNCATE_THRESHOLD;
        const isExpanded = expandedNotes[note.id];
        const shouldTruncate = isLong && !isExpanded;

        return (
          <div
            key={note.id}
            className="p-4 sm:p-5 rounded-lg bg-secondary/5 border border-secondary/20 mx-0"
          >
            {/* Title - larger on mobile for better readability */}
            <h3 className="text-lg sm:text-xl font-semibold text-secondary mb-3">
              {note.title}
            </h3>

            {/* Explanation - larger text for readability */}
            <p
              className={cn(
                'text-base text-muted-foreground leading-relaxed',
                shouldTruncate && 'line-clamp-2'
              )}
            >
              {note.explanation}
            </p>

            {isLong && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNote(note.id)}
                className="mt-2 min-h-[44px] px-3 text-sm text-secondary hover:text-secondary/80"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1.5" />
                    Read more
                  </>
                )}
              </Button>
            )}

            {/* Examples - numbered list with clear Mk/En distinction */}
            {examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-secondary/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Examples
                </p>
                <ol className="space-y-4 list-none">
                  {(expandedExamples[note.id] ? examples : examples.slice(0, 4)).map((example, index) => {
                    const parts = splitExample(example);

                    return (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-base font-medium leading-relaxed">
                            {parts.macedonian}
                          </p>
                          {parts.english && (
                            <p className="text-sm text-muted-foreground italic">
                              {parts.english}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  {examples.length > 4 && !expandedExamples[note.id] && (
                    <li>
                      <button
                        type="button"
                        onClick={() => toggleExamples(note.id)}
                        className="min-h-[44px] text-sm text-primary hover:text-primary/80 pl-9 flex items-center gap-1"
                      >
                        <ChevronDown className="h-3 w-3" />
                        Show {examples.length - 4} more example{examples.length - 4 === 1 ? '' : 's'}
                      </button>
                    </li>
                  )}
                  {expandedExamples[note.id] && examples.length > 4 && (
                    <li>
                      <button
                        type="button"
                        onClick={() => toggleExamples(note.id)}
                        className="min-h-[44px] text-sm text-muted-foreground hover:text-foreground pl-9 flex items-center gap-1"
                      >
                        <ChevronUp className="h-3 w-3" />
                        Show fewer
                      </button>
                    </li>
                  )}
                </ol>
              </div>
            )}
          </div>
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
