'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { CustomDeckCard } from '@prisma/client';
import { CardForm } from './CardForm';
import { DeleteCardDialog } from './DeleteCardDialog';

type CardListItemProps = {
  card: CustomDeckCard;
  onUpdate: (
    cardId: string,
    data: {
      macedonian?: string;
      english?: string;
      macedonianAlternates?: string[];
      englishAlternates?: string[];
      category?: string;
      notes?: string;
    }
  ) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
};

export function CardListItem({
  card,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: CardListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUpdate = async (data: Parameters<CardListItemProps['onUpdate']>[1]) => {
    await onUpdate(card.id, data);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(card.id);
  };

  if (isEditing) {
    return (
      <CardForm
        onSubmit={handleUpdate}
        initialData={{
          macedonian: card.macedonian,
          english: card.english,
          macedonianAlternates: card.macedonianAlternates?.join(', ') ?? '',
          englishAlternates: card.englishAlternates?.join(', ') ?? '',
          category: card.category || '',
          notes: card.notes || '',
        }}
        submitLabel="Update Card"
        isSubmitting={isUpdating}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const hasAlternates =
    (card.macedonianAlternates?.length ?? 0) > 0 || (card.englishAlternates?.length ?? 0) > 0;
  const hasExtras = hasAlternates || card.notes;

  return (
    <>
      <Card className="overflow-hidden border-border/60 bg-card/80 transition-all hover:border-border">
        <div className="p-4">
        {/* Main Content */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Macedonian
                </p>
                <p className="text-base font-semibold text-foreground break-words">
                  {card.macedonian}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  English
                </p>
                <p className="text-base font-semibold text-foreground break-words">
                  {card.english}
                </p>
              </div>
            </div>

            {card.category && (
              <Badge variant="secondary" className="text-xs">
                {card.category}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isUpdating || isDeleting}
              className="h-8 w-8 p-0"
              aria-label="Edit card"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isUpdating || isDeleting}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              aria-label="Delete card"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        {hasExtras && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Show details
                </>
              )}
            </Button>

            {showDetails && (
              <div className="mt-3 space-y-3 border-t border-border/40 pt-3">
                {(card.macedonianAlternates?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Macedonian Alternates
                    </p>
                    <p className="text-sm text-foreground">
                      {card.macedonianAlternates?.join(', ')}
                    </p>
                  </div>
                )}

                {(card.englishAlternates?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      English Alternates
                    </p>
                    <p className="text-sm text-foreground">
                      {card.englishAlternates?.join(', ')}
                    </p>
                  </div>
                )}

                {card.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                      {card.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </Card>

      <DeleteCardDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        cardContent={{
          macedonian: card.macedonian,
          english: card.english,
        }}
      />
    </>
  );
}
