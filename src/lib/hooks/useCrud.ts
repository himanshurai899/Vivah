"use client"

import { useState } from "react"

type WithId = { id: string }

export interface CrudState<T extends Partial<WithId>> {
  form: T
  editId: string | null
  showForm: boolean
  saving: boolean
  setForm: (update: T | ((prev: T) => T)) => void
  openAdd: () => void
  openEdit: (record: T & WithId) => void
  /** Resets editId + closes modal — safe to call from X / backdrop / Escape */
  closeForm: () => void
  /** Sends POST (new) or PUT (edit). Throws on !response.ok or network error. */
  save: (
    baseUrl: string,
    fetchFn?: typeof fetch,
  ) => Promise<unknown>
}

export function useCrud<T extends Partial<WithId>>(
  emptyForm: T = {} as T,
): CrudState<T> {
  const [form, setFormState] = useState<T>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const setForm = (update: T | ((prev: T) => T)) =>
    setFormState(prev => (typeof update === "function" ? (update as (p: T) => T)(prev) : update))

  const openAdd = () => {
    setFormState(emptyForm)
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (record: T & WithId) => {
    setFormState({ ...record })
    setEditId(record.id)
    setShowForm(true)
  }

  // ── THE FIX: always reset editId when closing ──────────────────────────
  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
    setFormState(emptyForm)
  }

  const save = async (
    baseUrl: string,
    fetchFn: typeof fetch = fetch,
  ): Promise<unknown> => {
    setSaving(true)
    const url = editId ? `${baseUrl}/${encodeURIComponent(editId)}` : baseUrl
    const method = editId ? "PUT" : "POST"
    try {
      const res = await fetchFn(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error((body as { error?: string }).error ?? "Request failed")
      }
      const data = await res.json()
      setShowForm(false)
      setEditId(null)
      return data
    } finally {
      setSaving(false)
    }
  }

  return { form, editId, showForm, saving, setForm, openAdd, openEdit, closeForm, save }
}
