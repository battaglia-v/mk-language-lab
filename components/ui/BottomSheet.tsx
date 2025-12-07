"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { modalBackdrop, bottomSheet } from "@/lib/animations";

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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          {/* @ts-ignore framer-motion type compatibility issue with Next.js 16 */}
          <motion.div onClick={onClose} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          {/* @ts-ignore framer-motion type compatibility issue with Next.js 16 */}
          <motion.div
            variants={bottomSheet}
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
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                    aria-label="Close"
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
export function BottomSheetList({
  items,
  onItemClick,
  renderItem,
}: {
  items: any[];
  onItemClick?: (item: any) => void;
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => onItemClick?.(item)}
          className={cn(
            "rounded-lg border border-border bg-card p-3 transition-colors",
            onItemClick && "cursor-pointer hover:bg-muted"
          )}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
