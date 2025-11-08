'use client';

import { BookOpen } from 'lucide-react';

interface GrammarNote {
  id: string;
  title: string;
  explanation: string;
  examples: string; // JSON array
}

interface GrammarSectionProps {
  notes: GrammarNote[];
}

export default function GrammarSection({ notes }: GrammarSectionProps) {
  return (
    <div className="space-y-6">
      {notes.map(note => {
        let examples: string[] = [];
        try {
          examples = JSON.parse(note.examples);
        } catch {
          // Handle empty or invalid JSON
        }

        return (
          <div
            key={note.id}
            className="p-6 rounded-lg border border-border/50 bg-gradient-to-br from-secondary/5 to-secondary/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {note.explanation}
                </p>
              </div>
            </div>

            {examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-2">Examples:</p>
                <ul className="space-y-2">
                  {examples.map((example, index) => (
                    <li key={index} className="text-sm pl-4 border-l-2 border-secondary/30">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
