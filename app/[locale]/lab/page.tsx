import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Languages, BookOpenText, Mic, ChevronRight, FlaskConical } from 'lucide-react';
import { PageContainer } from '@/components/layout';

export default async function LanguageLabPage() {
  const locale = await getLocale();
  const t = await getTranslations('languageLab');

  const tools = [
    {
      id: 'translator',
      href: `/${locale}/translate`,
      icon: Languages,
      title: t('translator.title'),
      description: t('translator.description'),
      badge: t('translator.badge'),
    },
    {
      id: 'analyzer',
      href: `/${locale}/reader/analyze`,
      icon: BookOpenText,
      title: t('analyzer.title'),
      description: t('analyzer.description'),
      badge: t('analyzer.badge'),
    },
    {
      id: 'pronunciation',
      href: `/${locale}/practice/pronunciation`,
      icon: Mic,
      title: t('pronunciation.title'),
      description: t('pronunciation.description'),
      badge: t('pronunciation.badge'),
    },
  ];

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <nav className="space-y-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
            data-testid={`lab-tool-${tool.id}`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <tool.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-foreground">{tool.title}</p>
                {tool.badge && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </nav>

      <div className="mt-8 rounded-xl border border-border/30 bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">
          {t('hint')}
        </p>
      </div>
    </PageContainer>
  );
}
