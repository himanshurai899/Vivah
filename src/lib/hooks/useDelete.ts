"use client"

import { useState, useCallback } from "react"
import type { ToastContextValue } from "@/components/ui/Toast"

interface UseDeleteReturn {
  deleteId: string | null
  deleting: boolean
  promptDelete: (id: string) => void
  cancelDelete: () => void
  confirmDelete: () => Promise<void>
}

/**
 * Encapsulates the delete flow that was repeated on every CRUD page:
 *   - sets deleteId to open the ConfirmDialog
 *   - handles loading state and fetch with error handling
 *   - fires toast on success/error
 *   - calls onSuccess callback (e.g. reload list) after deletion
 */
export function useDelete(
  baseUrl: string,
  { toast, onSuccess }: { toast: ToastContextValue["toast"]; onSuccess: () => Promise<void> | void },
): UseDeleteReturn {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const promptDelete = useCallback((id: string) => setDeleteId(id), [])
  const cancelDelete = useCallback(() => setDeleteId(null), [])

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`${baseUrl}/${encodeURIComponent(deleteId)}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? "Delete failed")
      }
      setDeleteId(null)
      await onSuccess()
      toast({ message: "Deleted successfully", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Delete failed", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }, [deleteId, baseUrl, toast, onSuccess])

  return { deleteId, deleting, promptDelete, cancelDelete, confirmDelete }
}
