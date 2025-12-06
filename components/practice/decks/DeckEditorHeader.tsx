'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, Save, X, Play } from 'lucide-react';
import type { CustomDeck } from '@prisma/client';

type DeckEditorHeaderProps = {
  deck: CustomDeck;
  onUpdate: (data: { name?: string; description?: string; category?: string }) => Promise<void>;
  cardCount: number;
};

export function DeckEditorHeader({ deck, onUpdate, cardCount }: DeckEditorHeaderProps) {
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description || '');
  const [category, setCategory] = useState(deck.category || '');

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onUpdate({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update deck:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(deck.name);
    setDescription(deck.description || '');
    setCategory(deck.category || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="inline-flex w-fit items-center gap-2"
      >
        <Link href={`/${locale}/practice/decks`}>
          <ArrowLeft className="h-4 w-4" />
          Back to Decks
        </Link>
      </Button>

      {/* Header content */}
      {isEditing ? (
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Deck Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Deck name"
              maxLength={100}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you practice with this deck?"
              rows={3}
              maxLength={500}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Category</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Travel, Food, Business"
              maxLength={50}
              disabled={isSaving}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground mb-2 break-words">
              {deck.name}
            </h1>
            {deck.description && (
              <p className="text-muted-foreground mb-3 break-words">
                {deck.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </span>
              {deck.category && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{deck.category}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Info
            </Button>
            {cardCount > 0 && (
              <Button asChild className="gap-2">
                <Link href={`/${locale}/practice?practiceFixture=custom-deck-${deck.id}`}>
                  <Play className="h-4 w-4" />
                  Practice
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
