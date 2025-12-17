'use client';

/**
 * XP Notification Provider
 * 
 * Global context for showing XP notifications across the app.
 * Wrap your app in this provider to enable XP toasts on correct answers,
 * lesson completions, and other XP-earning events.
 * 
 * Usage:
 * ```tsx
 * // In your root layout:
 * <XPNotificationProvider>
 *   {children}
 * </XPNotificationProvider>
 * 
 * // In any component:
 * const { showXP } = useXPNotification();
 * showXP(10, 'Correct answer!');
 * ```
 */

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { XPPopUpContainer, type XPNotification } from '@/components/gamification/XPPopUp';

interface XPNotificationContextValue {
  /** Show an XP notification */
  showXP: (amount: number, reason?: string, icon?: ReactNode) => void;
  /** Show a quick inline XP badge (for smaller rewards) */
  showQuickXP: (amount: number) => void;
  /** Clear all notifications */
  clearAll: () => void;
}

const XPNotificationContext = createContext<XPNotificationContextValue | null>(null);

interface XPNotificationProviderProps {
  children: ReactNode;
  /** Position of the notifications */
  position?: 'top-center' | 'center' | 'bottom-center';
}

export function XPNotificationProvider({ 
  children, 
  position = 'top-center' 
}: XPNotificationProviderProps) {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const showXP = useCallback((amount: number, reason?: string, icon?: ReactNode) => {
    const notification: XPNotification = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      reason,
      icon,
    };
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const showQuickXP = useCallback((amount: number) => {
    showXP(amount);
  }, [showXP]);

  const removeNotification = useCallback((id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <XPNotificationContext.Provider value={{ showXP, showQuickXP, clearAll }}>
      {children}
      <XPPopUpContainer
        notifications={notifications}
        onRemove={removeNotification}
        position={position}
      />
    </XPNotificationContext.Provider>
  );
}

/**
 * Hook to access XP notification functions
 */
export function useXPNotification(): XPNotificationContextValue {
  const context = useContext(XPNotificationContext);
  
  if (!context) {
    // Return a no-op implementation if used outside provider
    // This allows components to work even if provider is not set up
    return {
      showXP: () => {},
      showQuickXP: () => {},
      clearAll: () => {},
    };
  }
  
  return context;
}

