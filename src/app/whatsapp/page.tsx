"use client"

import { useEffect, useState, useCallback } from "react"
import { MessageCircle, Plus, Send, Copy, Users, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { substituteVars, normalizePhone, isPersonalVar, filterGuestsForBatch, type BatchFilter } from "@/lib/utils/whatsapp"

type Template = { id: string; name: string; category: string; message: string; variables: string[]; active: boolean }
type Guest = { id: string; name: string; mobile?: string; familyName: string; side: string; rsvpStatus: string }

const CAT_OPTS = [
  { value: "INVITATION", label: "Invitation" },
  { value: "REMINDER", label: "Reminder" },
  { value: "CONFIRMATION", label: "Confirmation" },
  { value: "TRAVEL_UPDATE", label: "Travel Update" },
  { value: "GENERAL", label: "General" },
]
const CAT_COLORS: Record<string, "purple" | "blue" | "green" | "orange" | "gray"> = {
  INVITATION: "purple", REMINDER: "orange", CONFIRMATION: "green", TRAVEL_UPDATE: "blue", GENERAL: "gray",
}

function BatchSendModal({ template, guests, onClose }: { template: Template; guests: Guest[]; onClose: () => void }) {
  const [globalVars, setGlobalVars] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<BatchFilter>("ALL")

  const nonPersonalVars = template.variables.filter(v => !isPersonalVar(v))
  const hasNameVar = template.variables.some(v => isPersonalVar(v))

  const filtered = filterGuestsForBatch(guests, filter)

  const sendToGuest = (guest: Guest) => {
    const vars = { ...globalVars }
    if (hasNameVar) { vars["GuestName"] = guest.name; vars["Name"] = guest.name; vars["guestName"] = guest.name; vars["name"] = guest.name }
    const message = encodeURIComponent(substituteVars(template.message, vars))
    const phone = normalizePhone(guest.mobile!)
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    setSent(s => new Set([...s, guest.id]))
  }

  return (
    <Modal open onClose={onClose} title={`Batch Send — ${template.name}`} size="lg">
      <div className="space-y-4">
        {nonPersonalVars.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-amber-800">Fill shared variables (same for all guests):</p>
            {nonPersonalVars.map(v => (
              <Input key={v} label={`{{${v}}}`} value={globalVars[v] ?? ""} onChange={e => setGlobalVars(p => ({ ...p, [v]: e.target.value }))} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            {(["ALL", "GROOM", "BRIDE", "PENDING_RSVP"] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === f ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f === "PENDING_RSVP" ? "Pending RSVP" : f === "ALL" ? `All (${guests.filter(g => g.mobile).length})` : f}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{sent.size} sent</span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-gray-400">No guests with mobile numbers in this group.</p>
          )}
          {filtered.map(g => (
            <div key={g.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${sent.has(g.id) ? "border-green-200 bg-green-50" : "border-gray-100 bg-white"}`}>
              <div>
                <p className="font-medium text-sm text-gray-900">{g.name} <span className="text-xs text-gray-400">({g.familyName})</span></p>
                <p className="text-xs text-gray-400">{g.mobile} · {g.side}</p>
              </div>
              {sent.has(g.id) ? (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={13} /> Sent</span>
              ) : (
                <button
                  type="button"
                  onClick={() => sendToGuest(g)}
                  className="flex items-center gap-1 text-xs text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-full font-medium transition-colors"
                >
                  <Send size={12} /> Send
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}

function SendModal({
  template, onClose,
}: { template: Template; onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [vars, setVars] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.variables.map(v => [v, ""]))
  )

  const preview = substituteVars(template.message, vars)

  const sendWhatsApp = () => {
    window.open(`https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(preview)}`, "_blank")
  }

  const copyMessage = () => navigator.clipboard.writeText(preview)

  return (
    <Modal open onClose={onClose} title={`Send — ${template.name}`} size="lg">
      <div className="space-y-4">
        <Input label="WhatsApp Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
        {template.variables.map(v => (
          <Input key={v} label={`{{${v}}}`} value={vars[v] ?? ""} onChange={e => setVars(p => ({ ...p, [v]: e.target.value }))} />
        ))}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Preview</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {preview}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={copyMessage}><Copy size={14} /> Copy</Button>
          <Button onClick={sendWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
            <Send size={14} /> Open WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Template & { variablesText: string }>>({ category: "GENERAL", active: true })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sendModal, setSendModal] = useState<Template | null>(null)
  const [batchModal, setBatchModal] = useState<Template | null>(null)
  const [expandedVars, setExpandedVars] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/whatsapp").then(r => r.json()),
      fetch("/api/guests").then(r => r.json()),
    ]).then(([t, g]) => {
      setTemplates(Array.isArray(t) ? t : [])
      setGuests(Array.isArray(g) ? g : [])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    const variables = (form.variablesText ?? "").split(",").map(s => s.trim()).filter(Boolean)
    const url = editId ? `/api/whatsapp/${editId}` : "/api/whatsapp"
    await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, variables }),
    })
    setShowForm(false)
    load()
    setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/whatsapp/${deleteId}`, { method: "DELETE" })
    setDeleteId(null)
    load()
  }

  const openEdit = (t: Template) => {
    setForm({ ...t, variablesText: t.variables.join(", ") })
    setEditId(t.id)
    setShowForm(true)
  }

  if (loading) return <PageLoader />

  const guestsWithPhone = guests.filter(g => g.mobile)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageCircle size={24} className="text-violet-600" /> WhatsApp Templates
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {templates.length} templates · {guestsWithPhone.length} guests with mobile numbers
          </p>
        </div>
        <Button onClick={() => { setForm({ category: "GENERAL", active: true, variablesText: "" }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Template
        </Button>
      </div>

      {/* Template grid */}
      {templates.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
          <p>No templates yet. Create your first WhatsApp message template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color={CAT_COLORS[t.category] ?? "gray"}>{t.category.replace("_", " ")}</Badge>
                  <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                </div>
                {!t.active && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 font-mono leading-relaxed max-h-20 overflow-y-auto whitespace-pre-wrap">
                {t.message}
              </div>

              {t.variables.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedVars(expandedVars === t.id ? null : t.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {expandedVars === t.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {t.variables.length} variable{t.variables.length > 1 ? "s" : ""}
                  </button>
                  {expandedVars === t.id && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.variables.map(v => (
                        <span key={v} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{`{{${v}}}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-gray-50">
                <button type="button" onClick={() => openEdit(t)} className="text-xs text-gray-500 hover:underline">Edit</button>
                <button type="button" onClick={() => setDeleteId(t.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                {guestsWithPhone.length > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => setBatchModal(t)}>
                    <Users size={12} /> Batch
                  </Button>
                )}
                <Button size="sm" onClick={() => setSendModal(t)}>
                  <Send size={12} /> Send
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send single */}
      {sendModal && <SendModal template={sendModal} onClose={() => setSendModal(null)} />}

      {/* Batch send */}
      {batchModal && (
        <BatchSendModal template={batchModal} guests={guests} onClose={() => setBatchModal(null)} />
      )}

      {/* Template form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Template" : "New Template"} size="lg">
        <div className="space-y-4">
          <Input
            label="Template Name *"
            value={form.name ?? ""}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
          <Select
            label="Category"
            value={form.category ?? "GENERAL"}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            options={CAT_OPTS}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Message <span className="text-gray-400 font-normal">— use <code className="bg-gray-100 px-1 rounded">{`{{VarName}}`}</code> for dynamic values</span>
            </label>
            <textarea
              value={form.message ?? ""}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={6}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
            />
          </div>
          <Input
            label="Variables (comma-separated)"
            value={form.variablesText ?? ""}
            onChange={e => setForm(p => ({ ...p, variablesText: e.target.value }))}
            placeholder="GuestName, Date, Venue"
          />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Template</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Template"
        message="Remove this WhatsApp template? This cannot be undone."
      />
    </div>
  )
}
