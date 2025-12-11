'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

type CardFormData = {
  macedonian: string;
  english: string;
  macedonianAlternates: string;
  englishAlternates: string;
  category: string;
  notes: string;
};

type CardFormProps = {
  onSubmit: (data: {
    macedonian: string;
    english: string;
    macedonianAlternates?: string[];
    englishAlternates?: string[];
    category?: string;
    notes?: string;
  }) => Promise<void>;
  initialData?: Partial<CardFormData>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
};

export function CardForm({
  onSubmit,
  initialData,
  submitLabel,
  isSubmitting = false,
  onCancel,
}: CardFormProps) {
  const t = useTranslations('deckForm');
  const [formData, setFormData] = useState<CardFormData>({
    macedonian: initialData?.macedonian || '',
    english: initialData?.english || '',
    macedonianAlternates: initialData?.macedonianAlternates || '',
    englishAlternates: initialData?.englishAlternates || '',
    category: initialData?.category || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.macedonian.trim() || !formData.english.trim()) {
      return;
    }

    const macedonianAlts = formData.macedonianAlternates
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const englishAlts = formData.englishAlternates
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await onSubmit({
      macedonian: formData.macedonian.trim(),
      english: formData.english.trim(),
      macedonianAlternates: macedonianAlts.length > 0 ? macedonianAlts : undefined,
      englishAlternates: englishAlts.length > 0 ? englishAlts : undefined,
      category: formData.category.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });

    // Reset form if this is a create form (no initial data)
    if (!initialData) {
      setFormData({
        macedonian: '',
        english: '',
        macedonianAlternates: '',
        englishAlternates: '',
        category: '',
        notes: '',
      });
    }
  };

  const isValid = formData.macedonian.trim() && formData.english.trim();

  return (
    <Card className="p-4 sm:p-6 border-border/60 bg-card/80">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Macedonian */}
          <div className="space-y-2">
            <Label htmlFor="macedonian">
              {t('macedonian')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="macedonian"
              placeholder={t('macedonianPlaceholder')}
              value={formData.macedonian}
              onChange={(e) => setFormData({ ...formData, macedonian: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* English */}
          <div className="space-y-2">
            <Label htmlFor="english">
              {t('english')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="english"
              placeholder={t('englishPlaceholder')}
              value={formData.english}
              onChange={(e) => setFormData({ ...formData, english: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Macedonian Alternates */}
          <div className="space-y-2">
            <Label htmlFor="macedonianAlternates">
              {t('macedonianAlternatesOptional')}
            </Label>
            <Input
              id="macedonianAlternates"
              placeholder={t('macedonianAlternatesPlaceholder')}
              value={formData.macedonianAlternates}
              onChange={(e) => setFormData({ ...formData, macedonianAlternates: e.target.value })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {t('alternatesHint')}
            </p>
          </div>

          {/* English Alternates */}
          <div className="space-y-2">
            <Label htmlFor="englishAlternates">
              {t('englishAlternatesOptional')}
            </Label>
            <Input
              id="englishAlternates"
              placeholder={t('englishAlternatesPlaceholder')}
              value={formData.englishAlternates}
              onChange={(e) => setFormData({ ...formData, englishAlternates: e.target.value })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {t('alternatesHint')}
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">{t('categoryOptional')}</Label>
          <Input
            id="category"
            placeholder={t('categoryPlaceholder')}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={isSubmitting}
            maxLength={50}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">{t('notesOptional')}</Label>
          <Textarea
            id="notes"
            placeholder={t('notesPlaceholder')}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={isSubmitting}
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
          )}
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {submitLabel || t('addCard')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
