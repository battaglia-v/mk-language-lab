"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

export type ToastProps = {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number
}

type ToasterContextType = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within ToasterProvider")
  }
  return context
}

function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div 
      className="fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-md pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({
  id,
  title,
  description,
  type = "info",
  onClose,
}: ToastProps & { onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  }

  const backgrounds = {
    success: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
    error: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-top-5",
        backgrounds[type]
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {description && (
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        data-testid={`toast-dismiss-${id}`}
        className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md -m-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export { Toast, Toaster }
