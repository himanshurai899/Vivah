"use client"

import { useEffect, useState } from "react"
import { Mail, Eye } from "lucide-react"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

type Block = { id: string; section: string; title: string; primaryText?: string; description?: string; date?: string; time?: string; contact?: string; sortOrder: number }

const sectionOpts = [
  { value: "HEADER", label: "Header" }, { value: "COUPLE", label: "Couple" }, { value: "FAMILY", label: "Family" },
  { value: "EVENT", label: "Event" }, { value: "FOOTER", label: "Footer" }, { value: "CUSTOM", label: "Custom" },
]
const sectionColors: Record<string, "purple" | "blue" | "green" | "orange" | "gray"> = {
  HEADER: "purple", COUPLE: "orange", FAMILY: "blue", EVENT: "green", FOOTER: "gray", CUSTOM: "gray"
}

export default function InvitationPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Block>>({ section: "CUSTOM", sortOrder: 0 })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/invitation").then(r => r.json()).then(setBlocks).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/invitation/${editId}` : "/api/invitation"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/invitation/${deleteId}`, { method: "DELETE" }); setDeleteId(null); void load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Mail size={20} className="text-violet-600" /> Invitation Builder</h1>
          <p className="text-sm text-gray-500">{blocks.length} sections in your invitation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(true)}><Eye size={15} /> Preview</Button>
          <Button onClick={() => { setForm({ section: "CUSTOM", sortOrder: blocks.length }); setEditId(null); setShowForm(true) }}>+ Add Section</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {blocks.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge color={sectionColors[b.section] ?? "gray"}>{b.section}</Badge>
                <h3 className="font-semibold text-gray-900">{b.title}</h3>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setForm({ ...b }); setEditId(b.id); setShowForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(b.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
            {b.primaryText && <p className="text-sm font-medium text-gray-700">{b.primaryText}</p>}
            {b.description && <p className="text-sm text-gray-500 whitespace-pre-line mt-1">{b.description}</p>}
            {b.date && <p className="text-sm text-gray-600 mt-1">📅 {formatDate(b.date)}{b.time ? ` · ${b.time}` : ""}</p>}
            {b.contact && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">📞 {b.contact}</p>}
          </div>
        ))}
        {blocks.length === 0 && <div className="text-center py-12 text-gray-400">No invitation sections yet.</div>}
      </div>

      {/* Preview Modal */}
      <Modal open={preview} onClose={() => setPreview(false)} title="Invitation Preview" size="xl">
        <div className="bg-gradient-to-b from-violet-50 to-white rounded-xl p-6 space-y-6 font-serif">
          {blocks.map(b => (
            <div key={b.id} className={`text-center ${b.section === "HEADER" ? "py-4" : ""}`}>
              {b.section === "HEADER" && (
                <>
                  <div className="text-3xl text-violet-600 mb-2">🌸</div>
                  <h1 className="text-2xl font-bold text-violet-700">{b.title}</h1>
                  {b.primaryText && <p className="text-gray-600 mt-1 italic">{b.primaryText}</p>}
                  {b.description && <p className="text-gray-500 text-sm mt-2">{b.description}</p>}
                </>
              )}
              {b.section === "COUPLE" && (
                <div className="py-4 border-t border-b border-violet-100">
                  <h2 className="text-3xl font-bold text-gray-900">{b.title}</h2>
                  {b.description && <p className="text-gray-600 mt-2 whitespace-pre-line text-sm">{b.description}</p>}
                </div>
              )}
              {b.section === "FAMILY" && (
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{b.title}</h3>
                  {b.primaryText && <p className="text-gray-700 font-medium">{b.primaryText}</p>}
                  {b.description && <p className="text-gray-600 text-sm whitespace-pre-line mt-1">{b.description}</p>}
                </div>
              )}
              {b.section === "EVENT" && (
                <div className="bg-violet-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-violet-700 mb-1">{b.title}</h3>
                  {b.date && <p className="text-gray-700">📅 {formatDate(b.date)}</p>}
                  {b.time && <p className="text-gray-700">🕐 {b.time}</p>}
                  {b.primaryText && <p className="text-gray-800 font-medium mt-1">📍 {b.primaryText}</p>}
                  {b.description && <p className="text-gray-600 text-sm mt-1">{b.description}</p>}
                </div>
              )}
              {b.section === "FOOTER" && (
                <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
                  <h3 className="font-semibold text-gray-700 mb-2">{b.title}</h3>
                  {b.primaryText && <p className="text-gray-700">{b.primaryText}</p>}
                  {b.contact && <p className="whitespace-pre-line mt-2">{b.contact}</p>}
                  {b.description && <p className="text-gray-500 mt-2 italic">{b.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Section" : "Add Section"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Section Type" value={form.section ?? "CUSTOM"} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} options={sectionOpts} />
          <Input label="Sort Order" type="number" value={form.sortOrder ?? 0} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
          <div className="sm:col-span-2"><Input label="Title *" value={form.title ?? ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="sm:col-span-2"><Input label="Primary Text / Name" value={form.primaryText ?? ""} onChange={e => setForm(p => ({ ...p, primaryText: e.target.value }))} /></div>
          <Input label="Date" type="date" value={form.date ? new Date(form.date).toISOString().split("T")[0] : ""} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          <Input label="Time" value={form.time ?? ""} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Contact Details</label>
            <textarea value={form.contact ?? ""} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Section</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Section" message="Remove this invitation section?" />
    </div>
  )
}

