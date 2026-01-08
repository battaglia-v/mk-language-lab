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
    <div className="space-y-4">
      {notes.map((note) => {
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
          <div
            key={note.id}
            className="p-4 rounded-lg bg-secondary/5 border border-secondary/20"
          >
            {/* Compact title */}
            <h3 className="text-base font-semibold text-secondary mb-2">
              {note.title}
            </h3>

            {/* Explanation */}
            <p
              className={cn(
                'text-sm text-muted-foreground leading-relaxed',
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
                className="mt-1 h-8 px-2 text-xs text-secondary hover:text-secondary/80"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    More
                  </>
                )}
              </Button>
            )}

            {/* Examples - compact list */}
            {examples.length > 0 && (
              <div className="mt-3 pt-3 border-t border-secondary/10">
                <ul className="space-y-2">
                  {examples.slice(0, 4).map((example, index) => {
                    const parts = splitExample(example);

                    return (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{parts.macedonian}</span>
                        {parts.english && (
                          <span className="text-muted-foreground ml-2">
                            — {parts.english}
                          </span>
                        )}
                      </li>
                    );
                  })}
                  {examples.length > 4 && (
                    <li className="text-xs text-muted-foreground">
                      +{examples.length - 4} more examples
                    </li>
                  )}
                </ul>
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
