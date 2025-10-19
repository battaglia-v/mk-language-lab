import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PartyPopper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full bg-card/60 backdrop-blur border-border/50">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <PartyPopper className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('signInRetiredTitle')}</CardTitle>
          <CardDescription className="text-base">
            {t('signInRetiredDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground text-left">
          <p>{t('signInRetiredBody')}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={`/${locale}`}>
              {t('returnHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
