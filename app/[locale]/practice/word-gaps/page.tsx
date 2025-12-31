import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';

export default async function WordGapsPage() {
  const locale = await getLocale();
  const t = await getTranslations('nav');

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Link href={`/${locale}/practice`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Word Gaps</h1>
        </div>

        <div className="rounded-xl border border-border/40 bg-muted/20 p-8 text-center">
          <Construction className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Word gap exercises are being developed. Check back soon!
          </p>
          <Button asChild className="mt-6">
            <Link href={`/${locale}/practice`}>Back to Practice</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
