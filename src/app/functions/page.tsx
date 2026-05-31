"use client"

import { useEffect, useState } from "react"
import { Plus, Calendar } from "lucide-react"
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
  startTime?: string; endTime?: string; coordinator?: string; budget?: number; notes?: string; status: string
}

const emptyEvent = (): Partial<Event> => ({ eventType: "WEDDING", status: "PLANNED" })

const typeColors: Record<string, "blue" | "purple" | "green"> = {
  PRE_WEDDING: "blue", WEDDING: "purple", POST_WEDDING: "green"
}

export default function FunctionsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToastContext()
  const crud = useCrud<Partial<Event>>(emptyEvent())

  const load = async () => {
    try {
      const res = await fetch("/api/events")
      const data = await res.json()
      setEvents(data)
    } catch {
      toast({ message: "Failed to load functions", variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const grouped = Object.entries(EVENT_TYPES).map(([type, label]) => ({
    type, label,
    events: events.filter(e => e.eventType === type),
  }))

  const handleSave = async () => {
    try {
      await crud.save("/api/events")
      toast({ message: crud.editId ? "Function updated" : "Function added", variant: "success" })
      await load()
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Save failed", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast({ message: "Function deleted", variant: "success" })
      setDeleteId(null)
      await load()
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
          <h1 className="page-title flex items-center gap-2"><Calendar size={20} /> Wedding Functions</h1>
          <p className="page-subtitle">{events.length} functions across pre-wedding, wedding, and post-wedding</p>
        </div>
        <Button onClick={() => { crud.openAdd() }}>
          <Plus size={15} /> Add Function
        </Button>
      </div>

      {grouped.map(({ type, label, events: grpEvents }) => (
        <div key={type}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}>
            <div className={`w-2 h-2 rounded-full ${type === "PRE_WEDDING" ? "bg-blue-500" : type === "WEDDING" ? "bg-violet-500" : "bg-green-500"}`} />
            {label} ({grpEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {grpEvents.map(ev => (
              <div key={ev.id} className="card p-4 hover:border-violet-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: "var(--ink)" }}>{ev.name}</h3>
                  <Badge color={typeColors[ev.eventType]}>{EVENT_TYPES[ev.eventType]}</Badge>
                </div>
                <div className="space-y-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {ev.date && <div>📅 {formatDate(ev.date)}</div>}
                  {ev.venue && <div>📍 {ev.venue}</div>}
                  {ev.startTime && <div>🕐 {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}</div>}
                  {ev.coordinator && <div>👤 {ev.coordinator}</div>}
                  {ev.budget && <div>💰 {formatINR(ev.budget)}</div>}
                  {ev.notes && <div className="text-xs opacity-60 mt-2 line-clamp-2">{ev.notes}</div>}
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <button type="button"
                    onClick={() => crud.openEdit(ev)}
                    className="text-xs font-medium hover:underline cursor-pointer"
                    style={{ color: "var(--purple)" }}>
                    Edit
                  </button>
                  <button type="button"
                    onClick={() => setDeleteId(ev.id)}
                    className="text-xs font-medium hover:underline cursor-pointer text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {grpEvents.length === 0 && (
              <div className="col-span-full text-center py-6 rounded-xl border border-dashed text-sm"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-faint)" }}>
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
          <Input label="Budget (₹)" type="number" value={crud.form.budget ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, budget: parseFloat(e.target.value) || undefined }))} />
        </div>
        <div className="mt-3">
          <label className="field-label">Notes</label>
          <textarea value={crud.form.notes ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3} className="field-input mt-1" />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={crud.closeForm}>Cancel</Button>
          <Button onClick={handleSave} loading={crud.saving}>
            {crud.saving ? "Saving…" : "Save Function"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Function" message="Remove this wedding function?"
        loading={deleting} />
    </div>
  )
}
