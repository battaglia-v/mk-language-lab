'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreateDeckDialog } from '@/components/practice/decks/CreateDeckDialog';
import { DeleteDeckDialog } from '@/components/practice/decks/DeleteDeckDialog';
import { DeckList } from '@/components/practice/decks/DeckList';
import { Archive, Loader2 } from 'lucide-react';
import { fetchUserDecks, updateDeck } from '@/lib/custom-decks';
import { useToast } from '@/components/ui/use-toast';
import type { CustomDeckSummary } from '@/lib/custom-decks';

export default function DecksPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [decks, setDecks] = useState<CustomDeckSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<CustomDeckSummary | null>(null);

  const loadDecks = async () => {
    setIsLoading(true);
    try {
      const fetchedDecks = await fetchUserDecks({ archived: showArchived });
      setDecks(fetchedDecks);
    } catch (error) {
      console.error('Failed to load decks:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load decks. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const handleArchive = async (deckId: string, isArchived: boolean) => {
    try {
      await updateDeck(deckId, { isArchived });

      addToast({
        title: isArchived ? 'Deck archived' : 'Deck restored',
        description: isArchived
          ? 'Deck moved to archived decks.'
          : 'Deck restored to active decks.',
        type: 'success',
      });

      // Reload decks
      loadDecks();
    } catch (error) {
      console.error('Failed to archive deck:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update deck. Please try again.',
        type: 'error',
      });
    }
  };

  const handleDelete = (deck: CustomDeckSummary) => {
    setDeckToDelete(deck);
  };

  const handleDeleted = () => {
    // Reload decks after deletion
    loadDecks();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Custom Decks</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your personalized practice decks
            </p>
          </div>
          <CreateDeckDialog onDeckCreated={loadDecks} />
        </div>

        {/* Archive toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? 'Viewing Archived' : 'View Archived'}
          </Button>
        </div>
      </div>

      {/* Deck List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DeckList
          decks={decks}
          onDelete={handleDelete}
          onArchive={handleArchive}
          emptyMessage={
            showArchived
              ? 'No archived decks'
              : 'No decks yet. Create your first deck to get started!'
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDeckDialog
        deck={deckToDelete}
        open={!!deckToDelete}
        onOpenChange={(open) => !open && setDeckToDelete(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
