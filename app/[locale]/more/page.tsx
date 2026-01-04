import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Newspaper, BookOpen, CircleUserRound, Settings, Info, HelpCircle, ChevronRight, FlaskConical } from 'lucide-react';
import { PageContainer } from '@/components/layout';

export default async function MorePage() {
  const locale = await getLocale();
  const t = await getTranslations('nav');

  const menuItems = [
    { id: 'lab', href: `/${locale}/lab`, icon: FlaskConical, label: t('languageLab', { default: 'Language Lab' }), description: t('languageLabDesc', { default: 'Translator, analyzer & pronunciation' }) },
    { id: 'news', href: `/${locale}/news`, icon: Newspaper, label: t('news'), description: t('newsDesc', { default: 'Macedonian news articles' }) },
    { id: 'resources', href: `/${locale}/resources`, icon: BookOpen, label: t('resources'), description: t('resourcesDesc', { default: 'Learning resources' }) },
    { id: 'profile', href: `/${locale}/profile`, icon: CircleUserRound, label: t('profile'), description: t('profileDesc', { default: 'Your progress and stats' }) },
    // Upgrade temporarily hidden - app is free for launch
    // { id: 'upgrade', href: `/${locale}/upgrade`, icon: Crown, label: t('upgrade', { default: 'Upgrade' }), description: 'Unlock Pro features' },
    { id: 'settings', href: `/${locale}/settings`, icon: Settings, label: t('settings', { default: 'Settings' }), description: t('settingsDesc', { default: 'App preferences' }) },
    { id: 'about', href: `/${locale}/about`, icon: Info, label: t('about'), description: t('aboutDesc', { default: 'About MKLanguage' }) },
    { id: 'help', href: `/${locale}/help`, icon: HelpCircle, label: t('help', { default: 'Help' }), description: t('helpDesc', { default: 'Support and FAQ' }) },
  ];

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <h1 className="text-2xl font-bold mb-6">{t('more', { default: 'More' })}</h1>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
            data-testid={`more-menu-${item.id}`}
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
