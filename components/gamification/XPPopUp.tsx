'use client';

/**
 * XP Pop-Up Component
 *
 * Floating XP notification that appears when users earn experience points.
 * Automatically animates upward and fades out.
 *
 * Usage:
 * ```tsx
 * const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);
 *
 * // Add notification
 * setXpNotifications(prev => [...prev, { id: Date.now(), amount: 10, reason: 'Lesson Complete' }]);
 *
 * <XPPopUpContainer notifications={xpNotifications} onRemove={(id) => ...} />
 * ```
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { xpPopUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

export interface XPNotification {
  id: number | string;
  amount: number;
  reason?: string;
  position?: 'top-center' | 'center' | 'bottom-center';
  icon?: React.ReactNode;
}

interface XPPopUpProps {
  notification: XPNotification;
  onComplete: () => void;
}

/**
 * Single XP Pop-Up notification
 */
function XPPopUp({ notification, onComplete }: XPPopUpProps) {
  const { amount, reason, icon } = notification;

  useEffect(() => {
    // Auto-remove after animation completes (800ms from xpPopUp variant)
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    // @ts-expect-error - framer-motion type compatibility issue with Next.js 16
    <motion.div
      key={notification.id}
      variants={xpPopUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pointer-events-none mb-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-2 to-accent-3 px-4 py-2 shadow-lg"
    >
      {icon || <Star className="h-5 w-5 text-black" fill="currentColor" />}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-black">+{amount} XP</span>
        {reason && (
          <span className="text-xs font-medium text-black/70">{reason}</span>
        )}
      </div>
    </motion.div>
  );
}

interface XPPopUpContainerProps {
  notifications: XPNotification[];
  onRemove: (id: number | string) => void;
  position?: 'top-center' | 'center' | 'bottom-center';
  className?: string;
}

/**
 * Container for managing multiple XP Pop-Ups
 *
 * Stacks notifications vertically
 */
export function XPPopUpContainer({
  notifications,
  onRemove,
  position = 'top-center',
  className,
}: XPPopUpContainerProps) {
  const positionClasses = {
    'top-center': 'top-20',
    center: 'top-1/2 -translate-y-1/2',
    'bottom-center': 'bottom-20',
  };

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-1/2 z-50 flex -translate-x-1/2 flex-col items-center',
        positionClasses[position],
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <XPPopUp
            key={notification.id}
            notification={notification}
            onComplete={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Quick XP notification (for small rewards)
 */
export function QuickXPBadge({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return (
    // @ts-expect-error - framer-motion type compatibility issue with Next.js 16
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, type: 'spring' }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1',
        className
      )}
    >
      <Zap className="h-3 w-3 text-accent" fill="currentColor" />
      <span className="text-xs font-bold text-accent">+{amount}</span>
    </motion.div>
  );
}

/**
 * Inline XP badge (for displaying static XP values)
 */
export function XPBadge({
  amount,
  variant = 'default',
  size = 'md',
  className,
}: {
  amount: number;
  variant?: 'default' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const variantClasses = {
    default: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Star className="h-3 w-3" fill="currentColor" />
      <span>{amount} XP</span>
    </div>
  );
}
