'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import GoogleTranslateWidget from '@/components/GoogleTranslateWidget';

type DirectionOption = {
  id: 'mk-en' | 'en-mk';
  sourceLang: 'mk' | 'en';
  targetLang: 'mk' | 'en';
  label: string;
  placeholder: string;
};

export default function TranslatePage() {
  const t = useTranslations('translate');
  const locale = useLocale();
  const rawTips = t.raw('tips');
  const tips = Array.isArray(rawTips) ? (rawTips as string[]) : [];

  const directionLabels = useMemo(() => {
    const raw = t.raw('directions');
    return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<'mk_en' | 'en_mk', string>;
  }, [t]);

  const placeholderLabels = useMemo(() => {
    const raw = t.raw('inputPlaceholder');
    return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<'mk_en' | 'en_mk', string>;
  }, [t]);

  const languageLabels = useMemo(() => {
    const raw = t.raw('languageLabels');
    return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, string>;
  }, [t]);

  const directionOptions = useMemo<DirectionOption[]>(
    () => [
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: directionLabels.mk_en ?? 'Macedonian → English',
        placeholder:
          placeholderLabels.mk_en ?? 'Type Macedonian text to translate into English…',
      },
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: directionLabels.en_mk ?? 'English → Macedonian',
        placeholder:
          placeholderLabels.en_mk ?? 'Type English text to translate into Macedonian…',
      },
    ],
    [directionLabels.en_mk, directionLabels.mk_en, placeholderLabels.en_mk, placeholderLabels.mk_en]
  );

  const [directionId, setDirectionId] = useState<DirectionOption['id']>('mk-en');
  const selectedDirection = useMemo(() => {
    return directionOptions.find((option) => option.id === directionId) ?? directionOptions[0];
  }, [directionId, directionOptions]);

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<'idle' | 'copied'>('idle');

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const handleDirectionChange = useCallback((id: DirectionOption['id']) => {
    setDirectionId(id);
    setErrorMessage(null);
    setDetectedLanguage(null);
    setCopiedState('idle');
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setDetectedLanguage(null);
    setErrorMessage(null);
    setCopiedState('idle');
  }, []);

  const handleTranslate = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const text = inputText.trim();

      if (!text) {
        setTranslatedText('');
        setDetectedLanguage(null);
        setErrorMessage(null);
        setCopiedState('idle');
        return;
      }

      setIsTranslating(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLang: selectedDirection.sourceLang,
            targetLang: selectedDirection.targetLang,
          }),
        });

        const data = (await response.json()) as {
          translatedText?: string;
          detectedSourceLang?: string | null;
          error?: string;
        };

        if (!response.ok || !data.translatedText) {
          throw new Error(data.error ?? 'Translation failed');
        }

        setTranslatedText(data.translatedText.trim());
        setDetectedLanguage(data.detectedSourceLang ?? null);
        setCopiedState('idle');
      } catch (error) {
        console.error('Translation failed', error);
        setTranslatedText('');
        setDetectedLanguage(null);
        setErrorMessage(t('errorGeneric'));
      } finally {
        setIsTranslating(false);
      }
    },
    [inputText, selectedDirection.sourceLang, selectedDirection.targetLang, t]
  );

  const handleCopy = useCallback(async () => {
    if (!translatedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopiedState('copied');
      window.setTimeout(() => setCopiedState('idle'), 1500);
    } catch (error) {
      console.error('Copy failed', error);
      setErrorMessage(t('copyError'));
    }
  }, [t, translatedText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="space-y-4 text-center">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/5 text-primary">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t('subtitle')}</p>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl text-foreground">{t('assistantTitle')}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t('assistantDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleTranslate}>
                <div className="flex flex-wrap gap-2">
                  {directionOptions.map((option) => {
                    const isActive = option.id === selectedDirection.id;
                    return (
                      <Button
                        key={option.id}
                        type="button"
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => handleDirectionChange(option.id)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label htmlFor="translate-input" className="text-sm font-medium text-foreground">
                    {t('inputLabel')}
                  </label>
                  <Textarea
                    id="translate-input"
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder={selectedDirection.placeholder}
                    maxLength={1800}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        void handleTranslate();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{t('shortcutHint')}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={isTranslating} className="gap-2">
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {t('translateButton')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      disabled={!inputText && !translatedText}
                    >
                      {t('clearButton')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('resultLabel')}
                    </span>
                    {translatedText ? (
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                        {copiedState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedState === 'copied' ? t('copied') : t('copyButton')}
                      </Button>
                    ) : null}
                  </div>
                  <div className="min-h-32 whitespace-pre-wrap rounded-xl border border-border/50 bg-background/60 p-4 text-base text-foreground">
                    {isTranslating ? (
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('translatingStatus')}
                      </span>
                    ) : translatedText ? (
                      translatedText
                    ) : (
                      <span className="text-muted-foreground">{t('resultPlaceholder')}</span>
                    )}
                  </div>
                  {detectedLanguage ? (
                    <p className="text-xs text-muted-foreground">
                      {t('detectedLanguage', {
                        language: languageLabels[detectedLanguage] ?? detectedLanguage,
                      })}
                    </p>
                  ) : null}
                  {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl text-foreground">{t('fallbackTitle')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('fallbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleTranslateWidget loadingLabel={t('fallbackLoading')} errorLabel={t('fallbackError')} />
              <p className="text-xs text-muted-foreground">{t('fallbackDisclaimer')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{t('tipsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {tips.map((tip) => (
                  <li key={tip} className="rounded-md border border-border/40 bg-background/40 p-3">
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="space-y-2 text-center md:text-left">
              <CardTitle className="text-xl text-foreground">{t('resourcesTitle')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('resourcesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center md:justify-start">
              <Button asChild size="lg">
                <Link href={buildHref('/resources')}>{t('resourcesCta')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
