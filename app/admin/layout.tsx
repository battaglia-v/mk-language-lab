import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import { LayoutDashboard, Home, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToasterProvider } from '@/components/ui/toast';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current pathname to check if we're on the signin page
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isSigninPage = pathname.includes('/admin/signin');

  // Only protect admin routes if not on signin page
  if (!isSigninPage) {
    await requireAdmin();
  }

  // If on signin page, render children without admin layout chrome
  if (isSigninPage) {
    return <ToasterProvider>{children}</ToasterProvider>;
  }

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
                <Link
                  href="/admin/practice-vocabulary"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Vocabulary</span>
                </Link>
                <Link
                  href="/admin/word-of-the-day"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Word of the Day</span>
                </Link>
              </nav>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Admin Content */}
        <main className="container max-w-screen-2xl py-8">{children}</main>
      </div>
    </ToasterProvider>
  );
}
