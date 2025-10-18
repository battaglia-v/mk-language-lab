'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles, BookOpen, MessageSquare, Languages, FolderOpen, Trello, Info, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data: session, status } = useSession();

  const navItems = [
    { path: '', label: t('home'), icon: Sparkles },
    { path: '/learn', label: t('learn'), icon: BookOpen },
    { path: '/tutor', label: t('tutor'), icon: MessageSquare },
    { path: '/translate', label: t('translate'), icon: Languages },
    { path: '/resources', label: t('resources'), icon: FolderOpen },
    { path: '/tasks', label: t('tasks'), icon: Trello },
    { path: '/about', label: t('about'), icon: Info },
  ];

  const buildHref = (path: string) => (path === '' ? `/${locale}` : `/${locale}${path}`);
  const signInHref = buildHref('/auth/signin');

  const userInitials = () => {
    const name = session?.user?.name;
    if (name) {
      const letters = name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .join('');
      if (letters) {
        return letters.slice(0, 2);
      }
    }

    const emailFirst = session?.user?.email?.[0];
    return emailFirst ? emailFirst.toUpperCase() : 'MK';
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: `/${locale}` });
  };

  // Check if current path matches (accounting for locale prefix)
  const isActive = (path: string) => {
    const fullPath = buildHref(path);
    return pathname === fullPath || (path !== '' && pathname.startsWith(`${fullPath}/`));
  };

  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={buildHref('')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Македонски
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path || 'home'} href={buildHref(item.path)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2',
                      active && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {status === 'loading' && (
              <Button variant="ghost" size="sm" disabled>
                {tCommon('loading')}
              </Button>
            )}

            {status !== 'loading' && !session && (
              <Button asChild size="sm" className="gap-2">
                <Link href={signInHref}>{tAuth('signIn')}</Link>
              </Button>
            )}

            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="size-7">
                      {session.user.image ? (
                        <AvatarImage src={session.user.image} alt={session.user.name ?? session.user.email ?? 'User'} />
                      ) : (
                        <AvatarFallback>{userInitials()}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden sm:inline max-w-[140px] truncate">
                      {session.user.name ?? session.user.email ?? tAuth('signIn')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {tAuth('signedInAs', {
                      name: session.user.name ?? session.user.email ?? tAuth('signIn'),
                    })}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleSignOut();
                    }}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {tAuth('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={`mobile-${item.path || 'home'}`} href={buildHref(item.path)}>
                <Button
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2 whitespace-nowrap',
                    active && 'bg-primary text-primary-foreground'
                  )}
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
