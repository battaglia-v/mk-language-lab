'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { createDeck } from '@/lib/custom-decks';
import { useToast } from '@/components/ui/use-toast';

type CreateDeckDialogProps = {
  onDeckCreated?: () => void;
};

export function CreateDeckDialog({ onDeckCreated }: CreateDeckDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('deckForm');
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast({
        title: t('nameRequired'),
        description: t('nameRequiredDesc'),
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[CreateDeckDialog] Creating deck:', { name, description, category });
      const deck = await createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      });

      console.log('[CreateDeckDialog] Deck created:', deck);

      if (!deck || !deck.id) {
        throw new Error('Deck created but invalid response');
      }

      addToast({
        title: t('deckCreated'),
        description: t('deckCreatedDesc', { name: deck.name }),
        type: 'success',
      });

      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setOpen(false);

      // Refresh the page or call callback
      if (onDeckCreated) {
        onDeckCreated();
      }

      // Navigate to the deck editor
      console.log('[CreateDeckDialog] Navigating to:', `/${locale}/practice/decks/${deck.id}`);
      router.push(`/${locale}/practice/decks/${deck.id}`);
    } catch (error) {
      console.error('[CreateDeckDialog] Failed to create deck:', error);
      addToast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('createError'),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('createDeck')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('createNewDeck')}</DialogTitle>
            <DialogDescription>
              {t('createNewDeckDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('deckName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t('deckNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('descriptionOptional')}</Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('categoryOptional')}</Label>
              <Input
                id="category"
                placeholder={t('categoryPlaceholder')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                t('createDeck')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
