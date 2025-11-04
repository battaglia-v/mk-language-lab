'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, BookOpen, Sparkles } from 'lucide-react';

const LIBRARY_SECTIONS = ['collections', 'culture'] as const;

type LibrarySection = (typeof LIBRARY_SECTIONS)[number];

type LibraryCard = {
  id: string;
  icon: typeof Newspaper;
  titleKey: string;
  descriptionKey: string;
  href: string;
  external?: boolean;
  disabled?: boolean;
};

type LibraryContent = Record<LibrarySection, LibraryCard[]>;

export default function LibraryHubPage() {
  const t = useTranslations('libraryHub');
  const locale = useLocale();

  const buildHref = (path: string) => (path.startsWith('http') ? path : `/${locale}${path}`);

  const cardsBySection: LibraryContent = {
    collections: [
      {
        id: 'resources',
        icon: BookOpen,
        titleKey: 'collections.cards.resources.title',
        descriptionKey: 'collections.cards.resources.description',
        href: '/resources',
      },
      {
        id: 'news',
        icon: Newspaper,
        titleKey: 'collections.cards.news.title',
        descriptionKey: 'collections.cards.news.description',
        href: '/news',
      },
    ],
    culture: [
      {
        id: 'culture-spotlight',
        icon: Sparkles,
        titleKey: 'culture.cards.spotlight.title',
        descriptionKey: 'culture.cards.spotlight.description',
        href: 'https://www.vistina.com.mk/',
        external: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/10 text-primary md:mx-0">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t('title')}</h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t('subtitle')}</p>
          </div>

          <Tabs defaultValue={LIBRARY_SECTIONS[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 bg-card/50 p-1 sm:grid-cols-2">
              {LIBRARY_SECTIONS.map((section) => (
                <TabsTrigger key={section} value={section} className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  {t(`${section}.tabLabel`)}
                </TabsTrigger>
              ))}
            </TabsList>
            {LIBRARY_SECTIONS.map((section) => (
              <TabsContent key={section} value={section} className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">{t(`${section}.description`)}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {cardsBySection[section].map((card) => {
                    const Icon = card.icon;
                    const href = buildHref(card.href);
                    return (
                      <Card key={card.id} className="border-border/60 bg-card/70 backdrop-blur">
                        <CardHeader className="space-y-3">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/80 via-primary/80 to-secondary/40 text-secondary-foreground">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-xl text-foreground">{t(card.titleKey)}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              {t(card.descriptionKey)}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            className="gap-2"
                            asChild={!card.disabled}
                            disabled={card.disabled}
                          >
                            {card.disabled ? (
                              <span>{t('comingSoon')}</span>
                            ) : (
                              <Link
                                href={href}
                                target={card.external ? '_blank' : undefined}
                                rel={card.external ? 'noopener noreferrer' : undefined}
                              >
                                {card.external ? t('openExternal') : t('openAction')}
                              </Link>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
