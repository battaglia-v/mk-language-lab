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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/profile`} className="flex w-full cursor-pointer items-center">
            <User className="mr-2 h-4 w-4" />
            {t('profile')}
          </Link>
        </DropdownMenuItem>
        {session.user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="w-full cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs font-medium text-muted-foreground">{t('socialHeader')}</p>
          <p className="text-[10px] text-muted-foreground/70">{t('socialSubtitle')}</p>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a
            href="https://www.instagram.com/macedonianlanguagecorner/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full cursor-pointer items-center"
          >
            <Instagram className="mr-2 h-4 w-4" />
            {t('instagram')}
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="https://www.youtube.com/@macedonianlanguagecorner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full cursor-pointer items-center"
          >
            <Youtube className="mr-2 h-4 w-4" />
            {t('youtube')}
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="https://linktr.ee/macedonianlanguagecorner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full cursor-pointer items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('allLinks')}
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="w-full">
            <SignOutButton variant="ghost" size="sm" className="w-full justify-start px-0" />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
