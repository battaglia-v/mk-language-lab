import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (session?.user) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: 'auth' });
  const requiredEnvVars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  } as const;

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const isConfigured = missingEnvVars.length === 0;
  const setupSteps = [
    'googleMissingStep1',
    'googleMissingStep2',
    'googleMissingStep3',
    'googleMissingStep4',
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">{isConfigured ? t('signIn') : t('googleMissingTitle')}</CardTitle>
          <CardDescription>{isConfigured ? t('signInDescription') : t('googleMissingDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigured ? (
            <GoogleSignInButton />
          ) : (
            <div className="space-y-4 text-left">
              {missingEnvVars.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {missingEnvVars.map((envVar) => (
                    <Badge key={envVar} variant="outline" className="font-mono text-xs uppercase tracking-wide">
                      {envVar}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {setupSteps.map((stepKey) => (
                  <li key={stepKey}>{t(stepKey)}</li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
        {isConfigured ? null : (
          <CardFooter className="flex flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground sm:max-w-[60%]">{t('googleMissingDocs')}</p>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                asChild
                variant="outline"
              >
                <a
                  href="https://authjs.dev/reference/core/providers_google"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('googleMissingDocsLabel')}
                </a>
              </Button>
              <Button asChild>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('googleMissingButton')}
                </a>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
