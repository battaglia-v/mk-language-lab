/**
 * Toast notification system for React Native
 * 
 * Provides user feedback for actions, errors, and success states
 * Mirrors PWA's toast behavior
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/ui/toast.tsx (PWA implementation)
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastConfig = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextValue = {
  addToast: (config: Omit<ToastConfig, 'id'>) => void;
  removeToast: (id: string) => void;
  toasts: ToastConfig[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual toast component
function Toast({ toast, onRemove }: { toast: ToastConfig; onRemove: () => void }) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(-50), []);

  const dismissToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove());
  }, [fadeAnim, slideAnim, onRemove]);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
    ]).start();

    // Auto dismiss
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      dismissToast();
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, toast.duration, dismissToast]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 color="#16a34a" size={20} />,
    error: <AlertCircle color="#dc2626" size={20} />,
    warning: <AlertTriangle color="#ca8a04" size={20} />,
    info: <Info color="#2563eb" size={20} />,
  };

  const backgroundColors: Record<ToastType, string> = {
    success: '#f0fdf4',
    error: '#fef2f2',
    warning: '#fefce8',
    info: '#eff6ff',
  };

  const borderColors: Record<ToastType, string> = {
    success: '#86efac',
    error: '#fca5a5',
    warning: '#fde047',
    info: '#93c5fd',
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: backgroundColors[toast.type],
          borderColor: borderColors[toast.type],
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toastIcon}>{icons[toast.type]}</View>
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{toast.title}</Text>
        {toast.description && (
          <Text style={styles.toastDescription}>{toast.description}</Text>
        )}
      </View>
      <TouchableOpacity onPress={dismissToast} style={styles.toastDismiss}>
        <X color="#6b7280" size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const addToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev.slice(-4), { ...config, id }]); // Keep max 5 toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <View style={[styles.toastContainer, { top: insets.top + 8 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'success', title, description });
    },
    [addToast]
  );
}

export function useErrorToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'error', title, description, duration: 6000 });
    },
    [addToast]
  );
}

export function useWarningToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'warning', title, description });
    },
    [addToast]
  );
}

export function useInfoToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'info', title, description });
    },
    [addToast]
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    width: width - 32,
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  toastDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  toastDismiss: {
    padding: 4,
    marginLeft: 8,
    marginTop: -2,
  },
});
