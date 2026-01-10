import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Newspaper, FlaskConical, BookmarkPlus, ChevronRight, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout';

export default async function ResourcesPage() {
  const locale = await getLocale();
  const t = await getTranslations('nav');

  // Primary action - Saved Words highlighted at the top
  const primaryAction = {
    id: 'savedWords',
    href: `/${locale}/saved-words`,
    icon: BookmarkPlus,
    label: 'My Saved Words',
    description: 'Review and practice words you\'ve saved',
    color: 'pink',
  };

  const menuItems = [
    {
      id: 'lab',
      href: `/${locale}/lab`,
      icon: FlaskConical,
      label: t('languageLab', { default: 'Language Lab' }),
      description: t('languageLabDesc', { default: 'Translator, analyzer & pronunciation' })
    },
    {
      id: 'news',
      href: `/${locale}/news`,
      icon: Newspaper,
      label: t('news'),
      description: t('newsDesc', { default: 'Macedonian news articles' })
    },
  ];

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <h1 className="text-2xl font-bold mb-6">{t('resources', { default: 'Resources' })}</h1>

      {/* Primary Action - My Saved Words */}
      <nav className="space-y-2 mb-6">
        <Link
          href={primaryAction.href}
          className="group flex items-center gap-4 rounded-xl border-2 border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-rose-500/5 p-4 transition-all hover:border-pink-500/50 hover:from-pink-500/15 hover:to-rose-500/10"
          data-testid={`resources-menu-${primaryAction.id}`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/20">
            <primaryAction.icon className="h-6 w-6 text-pink-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{primaryAction.label}</p>
            <p className="text-sm text-muted-foreground truncate">{primaryAction.description}</p>
          </div>
          <Sparkles className="h-5 w-5 text-pink-500" />
        </Link>
      </nav>

      {/* Language Lab & News */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
            data-testid={`resources-menu-${item.id}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/30">
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </nav>
    </PageContainer>
  );
}
