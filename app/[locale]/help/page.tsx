'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, MessageCircle, BookOpen, Mail, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';
import SupportForm from '@/components/support/SupportForm';

export default function HelpPage() {
  const locale = useLocale();
  const [showSupportForm, setShowSupportForm] = useState(false);

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
      action: () => setShowSupportForm(true),
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'Share your suggestions',
      icon: MessageCircle,
      action: () => setShowSupportForm(true),
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
          <h1 className="text-2xl font-bold">Help</h1>
        </div>

        <nav className="space-y-2">
          {helpItems.map((item) => {
            const Icon = item.icon;

            if (item.action) {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={item.action}
                  className="group flex w-full h-auto items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20 text-left justify-start"
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
                </Button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
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
              href="mailto:contact@mklanguage.com"
              className="text-primary hover:underline"
              data-testid="help-email-support"
            >
              contact@mklanguage.com
            </a>
          </p>
        </div>
      </div>

      {/* Support Form Dialog */}
      <SupportForm
        open={showSupportForm}
        onOpenChange={setShowSupportForm}
      />
    </PageContainer>
  );
}
