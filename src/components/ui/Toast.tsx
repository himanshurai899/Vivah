"use client"

import { createContext, useContext, type ReactNode } from "react"
import { CheckCircle, XCircle, Loader2, X } from "lucide-react"
import { useToast, type Toast, type ToastApi } from "@/lib/hooks/useToast"
import { cn } from "@/lib/utils/cn"

// Re-export so other modules can type the toast fn without importing useToast directly
export type { ToastApi as ToastContextValue }

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const api = useToast()
  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastRegion toasts={api.toasts} dismiss={api.dismiss} />
    </ToastContext.Provider>
  )
}

export function useToastContext(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToastContext must be used inside <ToastProvider>")
  return ctx
}

// ── Toast region (fixed bottom-right) ─────────────────────────────────────────
function ToastRegion({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      role="status"
      data-toast
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-3rem)]"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

// ── Individual toast ──────────────────────────────────────────────────────────
const ICON = {
  success: <CheckCircle size={16} className="shrink-0 text-emerald-500" />,
  error:   <XCircle    size={16} className="shrink-0 text-red-500"     />,
  loading: <Loader2    size={16} className="shrink-0 text-[--purple] animate-spin" />,
}

const BORDER = {
  success: "border-l-emerald-400",
  error:   "border-l-red-400",
  loading: "border-l-[--purple]",
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3",
        "bg-white/90 backdrop-blur-md shadow-lg border border-[--border] border-l-4",
        BORDER[toast.variant],
        "animate-in slide-in-from-right-4 fade-in duration-200",
      )}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {ICON[toast.variant]}
      <p className="flex-1 text-sm font-medium" style={{ color: "var(--ink)" }}>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-0.5 rounded opacity-40 hover:opacity-70 transition-opacity"
        style={{ color: "var(--ink)" }}
      >
        <X size={13} />
      </button>
    </div>
  )
}
