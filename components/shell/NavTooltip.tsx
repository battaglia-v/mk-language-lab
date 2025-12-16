'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface NavTooltipProps {
  /** Whether the tooltip is visible */
  isVisible: boolean;
  /** Text content of the tooltip */
  text: string;
  /** Optional icon or emoji */
  icon?: React.ReactNode;
  /** Position relative to nav item */
  position?: 'top' | 'top-left' | 'top-right';
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Additional class name */
  className?: string;
  /** Unique ID for tracking */
  tooltipId: string;
}

/**
 * NavTooltip - Subtle onboarding hint for mobile navigation
 * 
 * Shows a small animated tooltip above nav items during first sessions.
 * Auto-dismisses after being viewed or manually closed.
 */
export function NavTooltip({
  isVisible,
  text,
  icon,
  position = 'top',
  onDismiss,
  className,
  tooltipId,
}: NavTooltipProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  if (!mounted) return null;

  const positionClasses = {
    'top': 'left-1/2 -translate-x-1/2 bottom-full mb-2',
    'top-left': 'left-0 bottom-full mb-2',
    'top-right': 'right-0 bottom-full mb-2',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={tooltipId}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 30,
            duration: prefersReducedMotion ? 0 : 0.2 
          }}
          className={cn(
            "absolute z-50 pointer-events-auto",
            positionClasses[position],
            className
          )}
        >
          <div className={cn(
            "relative flex items-center gap-2 px-3 py-2 rounded-xl",
            "bg-primary text-[#0a0a0a] text-xs font-medium",
            "shadow-[0_4px_20px_rgba(246,216,59,0.35)]",
            "whitespace-nowrap"
          )}>
            {icon && <span className="text-sm">{icon}</span>}
            <span>{text}</span>
            
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDismiss();
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            
            {/* Arrow pointing down */}
            <div 
              className={cn(
                "absolute top-full w-0 h-0",
                "border-l-[6px] border-l-transparent",
                "border-r-[6px] border-r-transparent",
                "border-t-[6px] border-t-primary",
                position === 'top' && "left-1/2 -translate-x-1/2",
                position === 'top-left' && "left-4",
                position === 'top-right' && "right-4"
              )}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

