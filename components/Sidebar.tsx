'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Home,
  RefreshCw,
  Languages,
  Newspaper,
  Library,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type NavItem = {
  path: string;
  label: string;
  icon: typeof Home;
};

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const locale = useLocale();
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [isBreakpointCollapsed, setIsBreakpointCollapsed] = useState(false);
  const collapsed = isBreakpointCollapsed || userCollapsed;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 1360px)');
    setIsBreakpointCollapsed(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setIsBreakpointCollapsed(event.matches);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const width = collapsed ? '5rem' : '16rem';
    document.documentElement.style.setProperty('--sidebar-current-width', width);

    return () => {
      document.documentElement.style.removeProperty('--sidebar-current-width');
    };
  }, [collapsed]);

  const navItems: NavItem[] = [
    { path: '', label: t('journey'), icon: Home },
    { path: '/practice', label: t('practice'), icon: RefreshCw },
    { path: '/translate', label: t('translate'), icon: Languages },
    { path: '/news', label: t('news'), icon: Newspaper },
    { path: '/library', label: t('library'), icon: Library },
    { path: '/resources', label: t('resources'), icon: BookOpen },
  ];

  const buildHref = (path: string) => (path === '' ? `/${locale}` : `/${locale}${path}`);

  const isActive = (path: string) => {
    const fullPath = buildHref(path);
    return pathname === fullPath || (path !== '' && pathname.startsWith(`${fullPath}/`));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 p-6 border-b border-sidebar-border',
          collapsed && 'justify-center p-4'
        )}>
          <Link
            href={buildHref('')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label={t('journey')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-primary/50">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Македонски
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label={t('label')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path || 'home'}
                href={buildHref(item.path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                  'hover:bg-sidebar-accent group relative',
                  active && 'bg-sidebar-primary text-sidebar-primary-foreground',
                  !active && 'text-sidebar-foreground hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-3'
                )}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                )} />
                
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => setUserCollapsed((prev) => !prev)}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200',
              'hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-3'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            disabled={isBreakpointCollapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50 safe-area-inset-bottom"
        aria-label={t('label')}
      >
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={`mobile-${item.path || 'home'}`}
                href={buildHref(item.path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200',
                  active && 'text-primary',
                  !active && 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  active && 'text-primary'
                )} />
                <span className={cn(
                  'text-[10px] font-medium w-full text-center line-clamp-1 leading-tight',
                  active && 'text-primary'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
