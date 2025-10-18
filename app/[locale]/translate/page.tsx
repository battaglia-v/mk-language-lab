'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TranslatePage() {
  const t = useTranslations('translate');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('mk');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      const data = await response.json();
      setTranslatedText(data.translation || '');
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error: Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Translation Interface */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Source */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{t('sourceText')}</CardTitle>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mk">{t('macedonian')}</SelectItem>
                      <SelectItem value="en">{t('english')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <div className="p-6 pt-0">
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={t('enterText')}
                  className="min-h-[300px] text-lg bg-background/50"
                />
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isTranslating ? t('translating') : t('submit')}
                </Button>
              </div>
            </Card>

            {/* Swap Button */}
            <div className="flex lg:flex-col items-center justify-center py-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapLanguages}
                className="rounded-full h-12 w-12"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Target */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{t('translatedText')}</CardTitle>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('english')}</SelectItem>
                      <SelectItem value="mk">{t('macedonian')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <div className="p-6 pt-0">
                <Textarea
                  value={translatedText}
                  readOnly
                  placeholder={t('enterText')}
                  className="min-h-[300px] text-lg bg-background/50"
                />
                <Button
                  onClick={handleCopy}
                  disabled={!translatedText}
                  variant="outline"
                  className="w-full mt-4"
                  size="lg"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t('copy')}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span></p>
        </div>
      </footer>
    </div>
  );
}
