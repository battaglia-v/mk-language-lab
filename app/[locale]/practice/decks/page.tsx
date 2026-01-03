'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CreateDeckDialog } from '@/components/practice/decks/CreateDeckDialog';
import { DeleteDeckDialog } from '@/components/practice/decks/DeleteDeckDialog';
import { DeckList } from '@/components/practice/decks/DeckList';
import { Archive, Crown, Loader2 } from 'lucide-react';
import { fetchUserDecks, updateDeck } from '@/lib/custom-decks';
import { useToast } from '@/components/ui/use-toast';
import type { CustomDeckSummary } from '@/lib/custom-decks';
import { PageContainer } from '@/components/layout';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useAppConfig } from '@/hooks/use-app-config';

export default function DecksPage() {
  const locale = useLocale();
  const router = useRouter();
  const { addToast } = useToast();
  const [decks, setDecks] = useState<CustomDeckSummary[]>([]);
  const [activeDeckCount, setActiveDeckCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<CustomDeckSummary | null>(null);
  const { config } = useAppConfig();
  const { canCreateDeck, entitlement } = useEntitlement();

  const loadDecks = async () => {
    setIsLoading(true);
    try {
      const fetchedDecks = await fetchUserDecks({ archived: showArchived });
      setDecks(fetchedDecks);

      if (!showArchived) {
        setActiveDeckCount(fetchedDecks.length);
      } else {
        // When viewing archived decks, we still need the active count for free-tier gating.
        const activeDecks = await fetchUserDecks({ archived: false });
        setActiveDeckCount(activeDecks.length);
      }
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

  const paywallEnabled = config.paywallEnabled;
  const deckCreationLocked = paywallEnabled && !entitlement.isPro && !canCreateDeck(activeDeckCount);

  return (
    <PageContainer size="lg" className="flex flex-col gap-5 pb-24 pt-6 sm:gap-6 sm:pt-8 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${locale}/practice`)}
          className="w-fit rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
          data-testid="custom-decks-back-to-practice"
        >
          ← Back to Practice
        </Button>
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Custom Decks</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your personalized practice decks
            </p>
          </div>
          {deckCreationLocked ? (
            <Button
              onClick={() => router.push(`/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/practice/decks`)}`)}
              className="gap-2"
              data-testid="custom-decks-upgrade"
            >
              <Crown className="h-4 w-4" />
              Upgrade to create more
            </Button>
          ) : (
            <CreateDeckDialog onDeckCreated={loadDecks} />
          )}
        </div>

        {/* Archive toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2 rounded-full border border-white/15 bg-white/5"
            data-testid="custom-decks-toggle-archived"
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
    </PageContainer>
  );
}
