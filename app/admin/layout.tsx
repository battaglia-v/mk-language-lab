import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import type React from 'react';
import {
  LayoutDashboard,
  Home,
  BookOpen,
  Calendar,
  Menu,
  Headphones,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToasterProvider } from '@/components/ui/toast';

const navLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/practice-vocabulary',
    label: 'Vocabulary',
    icon: BookOpen,
  },
  {
    href: '/admin/word-of-the-day',
    label: 'Word of the Day',
    icon: Calendar,
  },
  {
    href: '/admin/practice-audio',
    label: 'Practice Audio',
    icon: Headphones,
  },
  {
    href: '/admin/discover',
    label: 'Discover Feed',
    icon: Compass,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <ToasterProvider>
      <div className="min-h-screen bg-background">
        {/* Admin Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
              <nav className="hidden md:flex items-center gap-4 text-sm">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open admin menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild>
                      <Link href={href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Back to site</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
                <Link href="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Site</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className="container max-w-screen-2xl py-8">{children}</main>
      </div>
    </ToasterProvider>
  );
}
