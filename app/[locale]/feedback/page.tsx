'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  BookOpen, 
  Send, 
  ArrowLeft,
  Check,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { PageContainer } from '@/components/layout';

type FeedbackType = 'bug' | 'feature' | 'general' | 'content';

const FEEDBACK_TYPES: { id: FeedbackType; icon: React.ReactNode; label: string; description: string }[] = [
  {
    id: 'bug',
    icon: <Bug className="h-5 w-5" />,
    label: 'Bug Report',
    description: 'Something isn\'t working right',
  },
  {
    id: 'feature',
    icon: <Lightbulb className="h-5 w-5" />,
    label: 'Feature Request',
    description: 'I have an idea for improvement',
  },
  {
    id: 'content',
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Content Feedback',
    description: 'About lessons or vocabulary',
  },
  {
    id: 'general',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'General Feedback',
    description: 'Anything else on your mind',
  },
];

export default function FeedbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType || message.length < 10) {
      setError('Please select a feedback type and write at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message,
          email: email || undefined,
          rating: rating > 0 ? rating : undefined,
          context: {
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            locale,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <PageContainer size="sm" className="py-12">
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 rounded-3xl border border-success/30 bg-success/5 p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Check className="h-8 w-8 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Thank you!</h2>
            <p className="mt-2 text-muted-foreground">
              Your feedback has been submitted. We really appreciate you taking the time to help us improve.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${locale}`)}
            className="mt-4"
            data-testid="feedback-success-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="md" className="py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
          data-testid="feedback-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Share Your Feedback</h1>
        <p className="mt-2 text-muted-foreground">
          Help us make MK Language Lab better. We read every piece of feedback.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type Selection */}
        <div className="space-y-3">
          <Label>What type of feedback do you have?</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEEDBACK_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFeedbackType(type.id)}
                data-testid={`feedback-type-${type.id}`}
                className={cn(
                  'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                  feedbackType === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/50'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                  feedbackType === type.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {type.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Overall Rating (optional) */}
        <div className="space-y-3">
          <Label>How would you rate your experience? (optional)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
                data-testid={`feedback-rating-${star}`}
              >
                <Star
                  className={cn(
                    'h-8 w-8',
                    star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <Label htmlFor="message">Your feedback *</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind..."
            rows={5}
            className="resize-none"
            required
            minLength={10}
            data-testid="feedback-message"
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/2000 characters (minimum 10)
          </p>
        </div>

        {/* Email (optional) */}
        <div className="space-y-3">
          <Label htmlFor="email">Your email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            data-testid="feedback-email"
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll only use this to follow up on your feedback if needed.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !feedbackType || message.length < 10}
          className="w-full"
          data-testid="feedback-submit"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>
    </PageContainer>
  );
}
