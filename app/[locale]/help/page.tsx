import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, MessageCircle, BookOpen, Mail, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';

export default async function HelpPage() {
  const locale = await getLocale();
  const t = await getTranslations('nav');

  const helpItems = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of MKLanguage',
      icon: BookOpen,
      href: `/${locale}/getting-started`,
    },
    {
      id: 'contact-support',
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: Mail,
      href: 'mailto:support@mklanguage.com',
      external: true,
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'Share your suggestions',
      icon: MessageCircle,
      href: `/${locale}/feedback`,
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'External learning materials',
      icon: ExternalLink,
      href: `/${locale}/resources`,
    },
  ];

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Link href={`/${locale}/more`} data-testid="help-back-to-more">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t('help', { default: 'Help' })}</h1>
        </div>

        <nav className="space-y-2">
          {helpItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
                data-testid={`help-item-${item.id}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/30">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </nav>

        <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need more help? Email us at{' '}
            <a
              href="mailto:support@mklanguage.com"
              className="text-primary hover:underline"
              data-testid="help-email-support"
            >
              support@mklanguage.com
            </a>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
