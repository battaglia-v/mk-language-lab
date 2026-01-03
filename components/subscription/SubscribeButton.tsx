'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { launchPurchaseFlow, isGooglePlayBillingAvailable } from '@/lib/billing/google-play';
import { isStripeEnabled, redirectToCheckout } from '@/lib/billing/stripe';
import { cn } from '@/lib/utils';

type SubscribeButtonProps = {
  productId: 'pro_monthly' | 'pro_yearly';
  locale: string;
  from?: string;
  className?: string;
  size?: React.ComponentProps<typeof Button>['size'];
  variant?: React.ComponentProps<typeof Button>['variant'];
  dataTestId?: string;
  children: React.ReactNode;
};

export function SubscribeButton({
  productId,
  locale,
  from,
  className,
  size,
  variant,
  dataTestId,
  children,
}: SubscribeButtonProps) {
  const t = useTranslations('upgrade');
  const router = useRouter();
  const { addToast } = useToast();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnPath = useMemo(() => from || `/${locale}/learn`, [from, locale]);
  const upgradeCallback = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    const query = params.toString();
    return `/${locale}/upgrade${query ? `?${query}` : ''}`;
  }, [from, locale]);

  const handleSubscribe = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (status === 'loading') {
        addToast({
          type: 'info',
          description: t('purchaseProcessing', { default: 'Processing…' }),
        });
        return;
      }

      if (!session?.user?.id) {
        router.push(`/${locale}/sign-in?callbackUrl=${encodeURIComponent(upgradeCallback)}`);
        return;
      }

      if (isGooglePlayBillingAvailable()) {
        const result = await launchPurchaseFlow(productId);

        if (result.success) {
          addToast({
            type: 'success',
            title: t('purchaseSuccessTitle', { default: 'Subscribed' }),
            description: t('purchaseSuccessDescription', { default: 'Pro is now active on your account.' }),
          });
          router.push(returnPath);
          router.refresh();
          return;
        }

        addToast({
          type: 'error',
          title: t('purchaseFailedTitle', { default: 'Purchase failed' }),
          description: result.error || t('purchaseFailedDescription', { default: 'Please try again.' }),
        });
        return;
      }

      if (isStripeEnabled()) {
        await redirectToCheckout(productId);
        return;
      }

      addToast({
        type: 'info',
        description: t('purchaseUnavailable', { default: 'Purchases aren’t available on this device yet.' }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(className)}
      onClick={handleSubscribe}
      disabled={isSubmitting}
      data-testid={dataTestId}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {t('purchaseProcessing', { default: 'Processing…' })}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
