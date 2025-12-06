'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { deleteDeck } from '@/lib/custom-decks';
import { useToast } from '@/components/ui/use-toast';
import type { CustomDeckSummary } from '@/lib/custom-decks';

type DeleteDeckDialogProps = {
  deck: CustomDeckSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function DeleteDeckDialog({ deck, open, onOpenChange, onDeleted }: DeleteDeckDialogProps) {
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deck) return;

    setIsDeleting(true);

    try {
      await deleteDeck(deck.id);

      addToast({
        title: 'Deck deleted',
        description: `"${deck.name}" has been permanently deleted.`,
        type: 'success',
      });

      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error('Failed to delete deck:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete deck. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!deck) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete deck?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>&quot;{deck.name}&quot;</strong>?
            {deck.cardCount > 0 && (
              <>
                {' '}
                This will permanently delete all <strong>{deck.cardCount}</strong>{' '}
                {deck.cardCount === 1 ? 'card' : 'cards'} in this deck.
              </>
            )}{' '}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Deck'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
