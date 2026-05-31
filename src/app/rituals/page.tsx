"use client"

import { useEffect, useState } from "react"
import { Plus, ScrollText, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatINR } from "@/lib/utils/currency"
import { formatDate } from "@/lib/utils/date"

type Ritual = {
  id: string; name: string; description?: string; requiredItems: string[]
  responsiblePerson?: string; budget?: number; status: string
  scheduledDate?: string; scheduledTime?: string; priestNotes?: string
}

const statusOpts = [{ value: "PENDING", label: "Pending" }, { value: "IN_PROGRESS", label: "In Progress" }, { value: "COMPLETED", label: "Completed" }]

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ritual | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Ritual & { itemsText: string }>>({ status: "PENDING" })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/rituals").then(r => r.json()).then(setRituals).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const quickStatus = async (id: string, status: string) => {
    await fetch(`/api/rituals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    load()
  }

  const save = async () => {
    setSaving(true)
    const items = (form.itemsText ?? "").split("\n").map(s => s.trim()).filter(Boolean)
    const url = editId ? `/api/rituals/${editId}` : "/api/rituals"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, requiredItems: items }) })
    setShowForm(false); load(); setSaving(false)
  }

  if (loading) return <PageLoader />

  const completed = rituals.filter(r => r.status === "COMPLETED").length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ScrollText size={20} className="text-violet-600" /> Ritual Planner</h1>
          <p className="text-sm text-gray-500">{rituals.length} rituals · {completed} completed · {rituals.length - completed} pending</p>
        </div>
        <Button onClick={() => { setForm({ status: "PENDING", itemsText: "" }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Ritual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rituals.map(r => (
          <div key={r.id} className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:border-violet-300 transition-all ${r.status === "COMPLETED" ? "border-green-200 opacity-80" : "border-gray-100"}`} onClick={() => setSelected(r)}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{r.name}</h3>
              {r.status === "COMPLETED" ? <CheckCircle size={18} className="text-green-500 shrink-0" /> : <Clock size={18} className="text-gray-300 shrink-0" />}
            </div>
            {r.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.description}</p>}
            <div className="space-y-1 text-xs text-gray-600">
              {r.scheduledDate && <div>📅 {formatDate(r.scheduledDate)}{r.scheduledTime ? ` · ${r.scheduledTime}` : ""}</div>}
              {r.responsiblePerson && <div>👤 {r.responsiblePerson}</div>}
              {r.budget && <div>💰 {formatINR(r.budget)}</div>}
              <div>📦 {r.requiredItems.length} samagri items</div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <Badge color={r.status === "COMPLETED" ? "green" : r.status === "IN_PROGRESS" ? "blue" : "yellow"}>
                {r.status.replace("_", " ")}
              </Badge>
              <div className="flex gap-2">
                {r.status !== "COMPLETED" && (
                  <button onClick={e => { e.stopPropagation(); quickStatus(r.id, "COMPLETED") }} className="text-xs text-green-600 hover:underline">✓ Done</button>
                )}
                <button onClick={e => { e.stopPropagation(); setForm({ ...r, itemsText: r.requiredItems.join("\n") }); setEditId(r.id); setShowForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail view */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""} size="lg">
        {selected && (
          <div className="space-y-4">
            {selected.description && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{selected.description}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm" style={{ color: "var(--ink)" }}>
              {selected.scheduledDate && <div><span className="font-medium" style={{ color: "var(--text-muted)" }}>Date: </span>{formatDate(selected.scheduledDate)}</div>}
              {selected.scheduledTime && <div><span className="font-medium" style={{ color: "var(--text-muted)" }}>Time: </span>{selected.scheduledTime}</div>}
              {selected.responsiblePerson && <div><span className="font-medium" style={{ color: "var(--text-muted)" }}>Person: </span>{selected.responsiblePerson}</div>}
              {selected.budget && <div><span className="font-medium" style={{ color: "var(--text-muted)" }}>Budget: </span>{formatINR(selected.budget)}</div>}
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>📦 Required Samagri ({selected.requiredItems.length} items)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {selected.requiredItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--purple)" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {selected.priestNotes && (
              <div className="rounded-lg p-3 border" style={{ background: "var(--gold-muted)", borderColor: "var(--gold-border)" }}>
                <h4 className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>🙏 Priest Notes</h4>
                <p className="text-sm" style={{ color: "var(--ink)" }}>{selected.priestNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Ritual" : "Add Ritual"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Ritual Name *" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Select label="Status" value={form.status ?? "PENDING"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={statusOpts} />
          <Input label="Scheduled Date" type="date" value={form.scheduledDate ? new Date(form.scheduledDate).toISOString().split("T")[0] : ""} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} />
          <Input label="Scheduled Time" type="time" value={form.scheduledTime ?? ""} onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))} />
          <Input label="Responsible Person" value={form.responsiblePerson ?? ""} onChange={e => setForm(p => ({ ...p, responsiblePerson: e.target.value }))} />
          <Input label="Budget (₹)" type="number" value={form.budget ?? ""} onChange={e => setForm(p => ({ ...p, budget: parseFloat(e.target.value) || undefined }))} />
        </div>
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500" />
        </div>
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-700">Required Items / Samagri (one per line)</label>
          <textarea value={form.itemsText ?? ""} onChange={e => setForm(p => ({ ...p, itemsText: e.target.value }))} rows={5} placeholder="Haldi (turmeric)&#10;Chandan paste&#10;Rose water..." className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-violet-500" />
        </div>
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-700">Priest Notes</label>
          <textarea value={form.priestNotes ?? ""} onChange={e => setForm(p => ({ ...p, priestNotes: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500" />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Ritual</Button>
        </div>
      </Modal>
    </div>
  )
}

