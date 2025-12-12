'use client';

import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to trap focus within a container element
 * Useful for modals, dialogs, and other overlays for accessibility
 *
 * @param isActive - Whether the focus trap is active
 * @param options - Configuration options
 * @returns ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  options: {
    /** Return focus to previously focused element on close */
    restoreFocus?: boolean;
    /** Auto-focus the first focusable element */
    autoFocus?: boolean;
    /** Element to focus initially (overrides autoFocus) */
    initialFocusRef?: RefObject<HTMLElement | null>;
  } = {}
): RefObject<T | null> {
  const { restoreFocus = true, autoFocus = true, initialFocusRef } = options;
  const containerRef = useRef<T | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the previously focused element
    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      previousActiveElement.current = document.activeElement;
    }

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.offsetParent !== null // visible
      );
    };

    // Focus the initial element
    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (autoFocus) {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          // If no focusable elements, focus the container itself
          container.setAttribute('tabindex', '-1');
          container.focus();
        }
      }
    };

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      // Shift + Tab: going backwards
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Set up the trap
    container.addEventListener('keydown', handleKeyDown);

    // Small delay to ensure DOM is ready
    const focusTimeout = setTimeout(focusInitial, 10);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, autoFocus, restoreFocus, initialFocusRef]);

  return containerRef;
}
