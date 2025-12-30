'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  amount: number;
  onComplete?: () => void;
  className?: string;
};

export function XPAnimation({ amount, onComplete, className }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible || amount <= 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center',
        className
      )}
    >
      <div className="animate-xp-float text-center">
        <span className="text-4xl font-bold text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]">
          +{amount} XP
        </span>
      </div>
    </div>
  );
}
