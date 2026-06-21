"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { useCrud } from "@/lib/hooks/useCrud"
import { formatINR } from "@/lib/utils/currency"
import { formatDate } from "@/lib/utils/date"
import { EVENT_TYPES } from "@/lib/constants"

type Event = {
  id: string; name: string; eventType: string; date?: string; venue?: string
  startTime?: string; endTime?: string; coordinator?: string; budget?: number
  notes?: string; isMainFunction?: boolean; status: string
}

const EMPTY: Partial<Event> = { eventType: "WEDDING", status: "PLANNED", isMainFunction: false }
const typeColors: Record<string, "blue" | "purple" | "green"> = {
  PRE_WEDDING: "blue", WEDDING: "purple", POST_WEDDING: "green",
}

export default function FunctionsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToastContext()
  const crud = useCrud<Partial<Event>>(EMPTY)

  const load = useCallback(() =>
    fetch("/api/events").then(r => r.json()).then(setEvents).finally(() => setLoading(false))
  , [])

  useEffect(() => { load() }, [load])

  const grouped = Object.entries(EVENT_TYPES).map(([type, label]) => ({
    type, label, events: events.filter(e => e.eventType === type),
  }))

  const handleSave = async () => {
    const isEdit = !!crud.editId
    try {
      await crud.save("/api/events")
      await load()
      toast({ message: isEdit ? "Function updated" : "Function added", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Failed to save", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(deleteId)}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? "Delete failed")
      }
      setDeleteId(null)
      await load()
      toast({ message: "Function deleted", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Delete failed", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title"><Calendar size={22} aria-hidden /> Wedding Functions</h1>
          <p className="page-subtitle">{events.length} functions across pre-wedding, wedding, and post-wedding</p>
        </div>
        <Button onClick={crud.openAdd}><Plus size={15} /> Add Function</Button>
      </div>

      {grouped.map(({ type, label, events: grpEvents }) => (
        <div key={type}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}>
            <div className={`w-2 h-2 rounded-full ${
              type === "PRE_WEDDING" ? "bg-blue-500" : type === "WEDDING" ? "bg-violet-500" : "bg-green-500"
            }`} />
            {label} ({grpEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {grpEvents.map(ev => (
              <div key={ev.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {ev.isMainFunction && (
                      <Star size={13} className="text-amber-500 fill-amber-400 shrink-0" aria-label="Main function" />
                    )}
                    <h3 className="font-semibold text-vivah-ink">{ev.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {ev.isMainFunction && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        MAIN
                      </span>
                    )}
                    <Badge color={typeColors[ev.eventType]}>{EVENT_TYPES[ev.eventType]}</Badge>
                  </div>
                </div>
                <div className="space-y-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {ev.date && <div>📅 {formatDate(ev.date)}</div>}
                  {ev.venue && <div>📍 {ev.venue}</div>}
                  {ev.startTime && <div>🕐 {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ""}</div>}
                  {ev.coordinator && <div>👤 {ev.coordinator}</div>}
                  {ev.budget != null && <div>💰 {formatINR(ev.budget)}</div>}
                  {ev.notes && <div className="text-xs opacity-60 mt-2 line-clamp-2">{ev.notes}</div>}
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <button type="button" onClick={() => crud.openEdit(ev)}
                    className="text-xs cursor-pointer hover:underline" style={{ color: "var(--purple)" }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteId(ev.id)}
                    className="text-xs text-red-500 cursor-pointer hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {grpEvents.length === 0 && (
              <div className="col-span-full text-center py-6 rounded-xl border border-dashed text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-faint)", background: "var(--surface-2)" }}>
                No {label.toLowerCase()} functions yet
              </div>
            )}
          </div>
        </div>
      ))}

      <Modal open={crud.showForm} onClose={crud.closeForm}
        title={crud.editId ? "Edit Function" : "Add Function"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Function Name *" value={crud.form.name ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, name: e.target.value }))} />
          <Select label="Type *" value={crud.form.eventType ?? "WEDDING"}
            onChange={e => crud.setForm(p => ({ ...p, eventType: e.target.value }))}
            options={Object.entries(EVENT_TYPES).map(([v, l]) => ({ value: v, label: l }))} />
          <Input label="Date" type="date"
            value={crud.form.date ? new Date(crud.form.date).toISOString().split("T")[0] : ""}
            onChange={e => crud.setForm(p => ({ ...p, date: e.target.value }))} />
          <Input label="Venue" value={crud.form.venue ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, venue: e.target.value }))} />
          <Input label="Start Time" type="time" value={crud.form.startTime ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, startTime: e.target.value }))} />
          <Input label="End Time" type="time" value={crud.form.endTime ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, endTime: e.target.value }))} />
          <Input label="Coordinator" value={crud.form.coordinator ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, coordinator: e.target.value }))} />
          <Input label="Budget (Rs)" type="number" value={crud.form.budget ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, budget: parseFloat(e.target.value) || undefined }))} />
        </div>
        <div className="mt-3">
          <label className="field-label">Notes</label>
          <textarea value={crud.form.notes ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3} className="field-input mt-1" />
        </div>
        <button
          type="button"
          onClick={() => crud.setForm(p => ({ ...p, isMainFunction: !p.isMainFunction }))}
          className={`mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all w-full ${
            crud.form.isMainFunction
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
          }`}
          aria-pressed={!!crud.form.isMainFunction}
        >
          <Star
            size={15}
            className={crud.form.isMainFunction ? "text-amber-500 fill-amber-400" : "text-gray-400"}
            aria-hidden
          />
          <span className="text-sm font-medium">
            {crud.form.isMainFunction ? "Main function — highlighted in Guest Sorter" : "Mark as main function (Tilak, Baraat, etc.)"}
          </span>
          <div className={`ml-auto w-9 h-5 rounded-full transition-colors relative ${
            crud.form.isMainFunction ? "bg-amber-400" : "bg-gray-300"
          }`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              crud.form.isMainFunction ? "translate-x-4" : "translate-x-0.5"
            }`} />
          </div>
        </button>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={crud.closeForm}>Cancel</Button>
          <Button onClick={handleSave} loading={crud.saving}>
            {crud.editId ? "Update Function" : "Save Function"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Function" message="Remove this wedding function? This cannot be undone."
        loading={deleting} />
    </div>
  )
}
