'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DeckEditorHeader } from '@/components/practice/decks/DeckEditorHeader';
import { CardForm } from '@/components/practice/decks/CardForm';
import { CardList } from '@/components/practice/decks/CardList';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchDeckWithCards,
  updateDeck,
  createDeckCard,
  updateDeckCard,
  deleteDeckCard,
} from '@/lib/custom-decks';
import type { CustomDeck, CustomDeckCard } from '@prisma/client';
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

type PageProps = {
  params: Params;
};

export default function DeckEditorPage({ params }: PageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deck, setDeck] = useState<CustomDeck | null>(null);
  const [cards, setCards] = useState<CustomDeckCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const deckId = params.deckId as string;

  const loadDeck = async () => {
    setIsLoading(true);
    try {
      // Fetch deck with raw cards from database
      const response = await fetch(`/api/decks/${deckId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deck');
      }

      const data = await response.json();

      // data.deck contains the deck metadata
      // data.cards are PracticeItems, but we need CustomDeckCards
      // So let's fetch cards separately with all fields
      const cardsResponse = await fetch(`/api/decks/${deckId}/cards-raw`, {
        credentials: 'include',
      });

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setCards(cardsData.cards || []);
      }

      setDeck(data.deck);
    } catch (error) {
      console.error('Failed to load deck:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load deck. Please try again.',
        type: 'error',
      });
      router.push('/practice/decks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const handleUpdateDeck = async (data: { name?: string; description?: string; category?: string }) => {
    if (!deck) return;

    try {
      const updatedDeck = await updateDeck(deck.id, data);
      setDeck(updatedDeck);

      addToast({
        title: 'Deck updated',
        description: 'Deck information has been saved.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to update deck:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update deck. Please try again.',
        type: 'error',
      });
      throw error;
    }
  };

  const handleAddCard = async (data: Parameters<typeof createDeckCard>[1]) => {
    setIsAddingCard(true);

    try {
      await createDeckCard(deckId, data);

      addToast({
        title: 'Card added',
        description: 'New card has been added to your deck.',
        type: 'success',
      });

      // Reload deck to get updated card list
      await loadDeck();
    } catch (error) {
      console.error('Failed to add card:', error);
      addToast({
        title: 'Error',
        description: 'Failed to add card. Please try again.',
        type: 'error',
      });
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleUpdateCard = async (
    cardId: string,
    data: Parameters<typeof updateDeckCard>[2]
  ) => {
    setUpdatingCardId(cardId);

    try {
      await updateDeckCard(deckId, cardId, data);

      addToast({
        title: 'Card updated',
        description: 'Card has been saved.',
        type: 'success',
      });

      // Reload deck to get updated card list
      await loadDeck();
    } catch (error) {
      console.error('Failed to update card:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update card. Please try again.',
        type: 'error',
      });
      throw error;
    } finally {
      setUpdatingCardId(null);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setDeletingCardId(cardId);

    try {
      await deleteDeckCard(deckId, cardId);

      addToast({
        title: 'Card deleted',
        description: 'Card has been removed from your deck.',
        type: 'success',
      });

      // Reload deck to get updated card list
      await loadDeck();
    } catch (error) {
      console.error('Failed to delete card:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete card. Please try again.',
        type: 'error',
      });
    } finally {
      setDeletingCardId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <DeckEditorHeader
        deck={deck}
        onUpdate={handleUpdateDeck}
        cardCount={cards.length}
      />

      <div className="mt-8 space-y-6">
        {/* Add Card Form */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Add New Card
          </h2>
          <CardForm onSubmit={handleAddCard} isSubmitting={isAddingCard} />
        </div>

        {/* Cards List */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Your Cards
          </h2>
          <CardList
            cards={cards}
            onUpdate={handleUpdateCard}
            onDelete={handleDeleteCard}
            updatingCardId={updatingCardId}
            deletingCardId={deletingCardId}
          />
        </div>
      </div>
    </div>
  );
}
