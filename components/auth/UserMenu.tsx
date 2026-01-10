'use client';

import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { SignInButton } from './SignInButton';
import { SignOutButton } from './SignOutButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Instagram, Youtube, ExternalLink, LayoutDashboard, Settings, HelpCircle, Info } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations('userMenu');
  const locale = useLocale();

  if (status === 'loading') {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!session?.user) {
    return <SignInButton variant="outline" size="sm" />;
  }

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const menuItemClass =
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:bg-accent focus:text-accent-foreground';
  const iconClass = 'h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border p-0.5 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Open user menu"
          data-testid="user-menu-trigger"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-lg backdrop-blur"
      >
        <DropdownMenuLabel className="flex flex-col space-y-1 rounded-xl px-3 py-2">
          <p className="text-sm font-semibold leading-tight text-foreground">{session.user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className={menuItemClass}>
          <Link href={`/${locale}/profile`} className="flex w-full items-center" data-testid="user-menu-profile">
            <User className={iconClass} />
            <span className="text-sm font-medium">{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        {session.user.role === 'admin' && (
          <DropdownMenuItem asChild className={menuItemClass}>
            <Link href="/admin" className="flex w-full items-center" data-testid="user-menu-admin">
              <LayoutDashboard className={iconClass} />
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {t('moreHeader')}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className={menuItemClass}>
          <Link href={`/${locale}/settings`} className="flex w-full items-center" data-testid="user-menu-settings">
            <Settings className={iconClass} />
            <span className="text-sm font-medium">{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}>
          <Link href={`/${locale}/help`} className="flex w-full items-center" data-testid="user-menu-help">
            <HelpCircle className={iconClass} />
            <span className="text-sm font-medium">{t('help')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}>
          <Link href={`/${locale}/about`} className="flex w-full items-center" data-testid="user-menu-about">
            <Info className={iconClass} />
            <span className="text-sm font-medium">{t('about')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <p>{t('socialHeader')}</p>
          <p className="text-[11px] text-muted-foreground/70">{t('socialSubtitle')}</p>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className={menuItemClass}>
          <a
            href="https://www.instagram.com/macedonianlanguagecorner/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
            data-testid="user-menu-instagram"
          >
            <Instagram className={iconClass} />
            <span className="text-sm font-medium">{t('instagram')}</span>
            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}>
          <a
            href="https://www.youtube.com/@macedonianlanguagecorner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
            data-testid="user-menu-youtube"
          >
            <Youtube className={iconClass} />
            <span className="text-sm font-medium">{t('youtube')}</span>
            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}>
          <a
            href="https://linktr.ee/macedonianlanguagecorner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
            data-testid="user-menu-linktree"
          >
            <ExternalLink className={iconClass} />
            <span className="text-sm font-medium">{t('allLinks')}</span>
            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className={menuItemClass}>
          <div className="w-full">
            <SignOutButton
              variant="ghost"
              size="sm"
              dataTestId="user-menu-signout"
              className="w-full justify-start px-0 text-sm font-medium text-foreground hover:text-primary"
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
