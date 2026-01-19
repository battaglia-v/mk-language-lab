'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { 
  ArrowLeft, 
  MessageCircle, 
  BookOpen, 
  Mail, 
  ExternalLink, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Volume2,
  Bookmark,
  Trophy,
  Target,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';
import SupportForm from '@/components/support/SupportForm';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

// FAQ items matching Android implementation
const FAQ_ITEMS: { question: string; answer: string; icon: LucideIcon }[] = [
  {
    question: 'How do I start learning?',
    answer: 'Head to the Learn tab and pick your level (A1, A2, or B1). Start with A1 if you\'re new to Macedonian. Each lesson includes dialogues, vocabulary, grammar, and practice exercises.',
    icon: BookOpen,
  },
  {
    question: 'How does the XP system work?',
    answer: 'Earn XP by completing lessons and practice sessions. Set a daily goal in Settings and maintain your streak by meeting it each day. The more consistent you are, the faster you\'ll progress!',
    icon: Sparkles,
  },
  {
    question: 'Can I listen to pronunciation?',
    answer: 'Yes! Look for the speaker icon next to words and sentences. Tap it to hear native pronunciation. Audio is available throughout lessons, dialogues, and the Reader.',
    icon: Volume2,
  },
  {
    question: 'How do I save words for later?',
    answer: 'When reading or in lessons, tap any word to see its meaning. Press the bookmark icon to save it to your review deck. Access saved words from the Practice tab.',
    icon: Bookmark,
  },
  {
    question: 'What are the CEFR levels?',
    answer: 'CEFR (A1-B2) is the European standard for language proficiency. A1 is beginner (basic phrases), A2 is elementary (simple conversations), B1 is intermediate (everyday topics), and B2 is upper-intermediate.',
    icon: Target,
  },
  {
    question: 'How do achievements work?',
    answer: 'Earn badges by reaching milestones: completing lessons, maintaining streaks, mastering vocabulary, and more. View your collection on the Profile tab.',
    icon: Trophy,
  },
];

export default function HelpPage() {
  const locale = useLocale();
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    triggerHaptic('selection');
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
        {/* Header */}
        <div className="flex items-center gap-3" data-testid="help-hero">
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
          <h1 className="text-2xl font-bold">Help & FAQ</h1>
        </div>

        {/* Hero Section */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">How can we help?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find answers below or contact our support team
          </p>
        </div>

        {/* Quick Actions */}
        <nav className="space-y-2" data-testid="help-quick-actions">
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

        {/* FAQ Section */}
        <section className="space-y-3" data-testid="help-faq-section">
          <h2 className="text-lg font-semibold px-1">Frequently Asked Questions</h2>
          
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedIndex === index;
              
              return (
                <button
                  key={index}
                  onClick={() => toggleFAQ(index)}
                  className={cn(
                    'w-full rounded-xl border bg-card p-4 text-left transition-all',
                    isExpanded 
                      ? 'border-primary/40 bg-primary/5' 
                      : 'border-border/40 hover:border-border'
                  )}
                  aria-expanded={isExpanded}
                  data-testid={`help-faq-item-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isExpanded ? 'bg-primary/20' : 'bg-muted/30'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4 transition-colors',
                        isExpanded ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <span className="flex-1 font-medium text-foreground">
                      {item.question}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {isExpanded && (
                    <p className="mt-3 pl-12 text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Still need help? Email us at{' '}
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
