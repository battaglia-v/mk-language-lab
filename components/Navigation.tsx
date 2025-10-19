'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles, PenTool, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

type NavItem = {
  path: string;
  label: string;
  icon: typeof Sparkles;
};

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const locale = useLocale();
  const navLabel = t('label');

  const navItems: NavItem[] = [
    { path: '', label: t('journey'), icon: Sparkles },
    { path: '/practice', label: t('practice'), icon: PenTool },
    { path: '/library', label: t('library'), icon: Library },
  ];

  const buildHref = (path: string) => (path === '' ? `/${locale}` : `/${locale}${path}`);

  const isActive = (path: string) => {
    const fullPath = buildHref(path);
    return pathname === fullPath || (path !== '' && pathname.startsWith(`${fullPath}/`));
  };

  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-3">
          <Link
            href={buildHref('')}
            className="flex flex-shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
            aria-label={t('journey')}
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Македонски
            </span>
          </Link>

          <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 lg:flex" aria-label={navLabel}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path || 'home'}
                  href={buildHref(item.path)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn('gap-2', active && 'bg-primary text-primary-foreground')}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide lg:hidden"
          aria-label={navLabel}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={`mobile-${item.path || 'home'}`}
                href={buildHref(item.path)}
                aria-current={active ? 'page' : undefined}
              >
                <Button
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  className={cn('gap-2 whitespace-nowrap', active && 'bg-primary text-primary-foreground')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
