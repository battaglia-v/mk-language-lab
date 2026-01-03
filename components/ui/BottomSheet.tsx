"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useCallback, useId } from "react";
import { cn } from "@/lib/utils";
import { modalBackdrop, bottomSheet } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useFocusTrap } from "@/hooks/use-focus-trap";

interface BottomSheetProps {
  /**
   * Whether the bottom sheet is open
   */
  open: boolean;
  /**
   * Callback when the sheet should close
   */
  onClose: () => void;
  /**
   * Sheet title
   */
  title?: string;
  /**
   * Sheet description
   */
  description?: string;
  /**
   * Sheet content
   */
  children: React.ReactNode;
  /**
   * Additional className for the content area
   */
  className?: string;
  /**
   * Optional base test id for internal controls
   */
  testId?: string;
  /**
   * Height variant
   */
  height?: "default" | "full" | "auto";
  /**
   * Show close button in header
   */
  showCloseButton?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
  testId,
  height = "default",
  showCloseButton = true,
}: BottomSheetProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const heightClasses = {
    default: "max-h-[85vh]",
    full: "h-full",
    auto: "max-h-[90vh]",
  };

  const prefersReducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap<HTMLDivElement>(open);
  const titleId = useId();
  const descriptionId = useId();

  // Reduced motion variants - instant transitions
  const reducedBackdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.01 } },
    exit: { opacity: 0, transition: { duration: 0.01 } },
  };

  const reducedSheet = {
    initial: { y: 0, opacity: 1 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.01 } },
    exit: { y: 0, opacity: 0, transition: { duration: 0.01 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div onClick={onClose} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            variants={prefersReducedMotion ? reducedBackdrop : modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            data-testid={testId}
            variants={prefersReducedMotion ? reducedSheet : bottomSheet}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border-t border-border bg-background shadow-2xl",
              heightClasses[height]
            )}
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex-1 pr-4">
                  {title && (
                    <h2 id={titleId} className="text-lg font-semibold text-foreground">{title}</h2>
                  )}
                  {description && (
                    <p id={descriptionId} className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
                    aria-label="Close"
                    data-testid={testId ? `${testId}-close` : 'bottom-sheet-close'}
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn("flex-1 overflow-y-auto p-4", className)}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple bottom sheet trigger wrapper
 */
export function BottomSheetTrigger({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
}

/**
 * Bottom sheet with list items (common pattern)
 */
export function BottomSheetList<T>({
  items,
  onItemClick,
  renderItem,
  itemTestIdPrefix,
  getItemKey,
}: {
  items: T[];
  onItemClick?: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  itemTestIdPrefix?: string;
  getItemKey?: (item: T, index: number) => string | number;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const key = getItemKey ? getItemKey(item, index) : index;
        if (onItemClick) {
          const testId = itemTestIdPrefix ? `${itemTestIdPrefix}-${index}` : undefined;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onItemClick(item)}
              data-testid={testId}
              className={cn(
                "w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted",
              )}
            >
              {renderItem(item)}
            </button>
          );
        }

        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border border-border bg-card p-3",
            )}
          >
            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
}
