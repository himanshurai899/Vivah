"use client"

import { useState, useCallback } from "react"

export type ToastVariant = "success" | "error" | "loading"

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

let _counter = 0
const uid = () => `toast-${++_counter}`

export interface ToastApi {
  toasts: Toast[]
  toast: (opts: { message: string; variant: ToastVariant; duration?: number }) => string
  dismiss: (id: string) => void
}

export function useToast(): ToastApi {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ message, variant, duration = 3000 }: { message: string; variant: ToastVariant; duration?: number }): string => {
      const id = uid()
      setToasts(prev => [...prev, { id, message, variant }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
      return id
    },
    [],
  )

  return { toasts, toast, dismiss }
}
