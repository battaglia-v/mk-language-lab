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
import { User, Instagram, Youtube, ExternalLink, LayoutDashboard } from 'lucide-react';
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
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white transition-colors focus:bg-white/5 focus:text-white';
  const iconClass = 'h-5 w-5 text-white/60 transition-colors group-hover:text-white';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 p-0.5 shadow-lg shadow-black/30 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900" aria-label="Open user menu">
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
        className="w-64 rounded-2xl border border-white/10 bg-slate-950/95 p-2 text-white shadow-2xl shadow-black/40 backdrop-blur"
      >
        <DropdownMenuLabel className="flex flex-col space-y-1 rounded-xl px-3 py-2">
          <p className="text-sm font-semibold leading-tight text-white">{session.user.name}</p>
          <p className="text-xs leading-none text-white/60">{session.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem asChild className={menuItemClass}>
          <Link href={`/${locale}/profile`} className="flex w-full items-center">
            <User className={iconClass} />
            <span className="text-sm font-medium">{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        {session.user.role === 'admin' && (
          <DropdownMenuItem asChild className={menuItemClass}>
            <Link href="/admin" className="flex w-full items-center">
              <LayoutDashboard className={iconClass} />
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-medium text-white/60">
          <p>{t('socialHeader')}</p>
          <p className="text-[11px] text-white/50">{t('socialSubtitle')}</p>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className={menuItemClass}>
          <a
            href="https://www.instagram.com/macedonianlanguagecorner/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <Instagram className={iconClass} />
            <span className="text-sm font-medium">{t('instagram')}</span>
            <ExternalLink className="ml-auto h-4 w-4 text-blue-300" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}>
          <a
            href="https://www.youtube.com/@macedonianlanguagecorner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <Youtube className={iconClass} />
            <span className="text-sm font-medium">{t('youtube')}</span>
            <ExternalLink className="ml-auto h-4 w-4 text-blue-300" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}>
          <a
            href="https://linktr.ee/macedonianlanguagecorner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <ExternalLink className={iconClass} />
            <span className="text-sm font-medium">{t('allLinks')}</span>
            <ExternalLink className="ml-auto h-4 w-4 text-blue-300" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem asChild className={menuItemClass}>
          <div className="w-full">
            <SignOutButton
              variant="ghost"
              size="sm"
              className="w-full justify-start px-0 text-sm font-medium text-white hover:text-blue-200"
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
