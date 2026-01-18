'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Home, ArrowLeft, Search, BookOpen, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Localized 404 Not Found Page
 * 
 * Displays a user-friendly error page when a route doesn't exist.
 * Uses the current locale for proper navigation.
 */
export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon with animation */}
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <Search className="h-14 w-14 text-primary/60" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">
            {locale === 'mk' ? 'Страницата не е пронајдена' : 'Page Not Found'}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {locale === 'mk' 
              ? 'Страницата што ја барате не постои или е преместена.'
              : "The page you're looking for doesn't exist or may have been moved."
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg" className="w-full">
            <Link href={`/${locale}`}>
              <Home className="mr-2 h-4 w-4" />
              {locale === 'mk' ? 'Почетна' : 'Go Home'}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={`/${locale}/learn`}>
              <BookOpen className="mr-2 h-4 w-4" />
              {locale === 'mk' ? 'Лекции' : 'Browse Lessons'}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === 'mk' ? 'Назад' : 'Go Back'}
          </Button>
        </div>

        {/* Help text */}
        <div className="pt-4 border-t border-border mt-6">
          <p className="text-sm text-muted-foreground mb-3">
            {locale === 'mk' 
              ? 'Ако мислите дека ова е грешка, ве молиме јавете ни.'
              : 'Think this is a mistake? Let us know!'
            }
          </p>
          <Button asChild variant="link" size="sm">
            <Link href={`/${locale}/feedback`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {locale === 'mk' ? 'Испрати повратна информација' : 'Send Feedback'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
