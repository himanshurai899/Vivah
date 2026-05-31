"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Plus, Send, Copy } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"

type Template = { id: string; name: string; category: string; message: string; variables: string[]; active: boolean }

const catOpts = [
  { value: "INVITATION", label: "Invitation" }, { value: "REMINDER", label: "Reminder" },
  { value: "CONFIRMATION", label: "Confirmation" }, { value: "TRAVEL_UPDATE", label: "Travel Update" }, { value: "GENERAL", label: "General" },
]
const catColors: Record<string, "purple" | "blue" | "green" | "orange" | "gray"> = {
  INVITATION: "purple", REMINDER: "orange", CONFIRMATION: "green", TRAVEL_UPDATE: "blue", GENERAL: "gray",
}

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Template & { variablesText: string }>>({ category: "GENERAL", active: true })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sendModal, setSendModal] = useState<Template | null>(null)
  const [phone, setPhone] = useState("")
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/whatsapp").then(r => r.json()).then(setTemplates).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const variables = (form.variablesText ?? "").split(",").map(s => s.trim()).filter(Boolean)
    const url = editId ? `/api/whatsapp/${editId}` : "/api/whatsapp"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, variables }) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/whatsapp/${deleteId}`, { method: "DELETE" }); setDeleteId(null); load()
  }

  const getPreview = (template: Template) => {
    let msg = template.message
    template.variables.forEach(v => { msg = msg.replace(new RegExp(`\\{\\{${v}\\}\\}`, "g"), previewVars[v] ?? `[${v}]`) })
    return msg
  }

  const openSend = (t: Template) => {
    setSendModal(t)
    const vars: Record<string, string> = {}
    t.variables.forEach(v => { vars[v] = "" })
    setPreviewVars(vars)
    setPhone("")
  }

  const sendWhatsApp = () => {
    if (!sendModal) return
    const message = encodeURIComponent(getPreview(sendModal))
    const cleanPhone = phone.replace(/[^0-9]/g, "")
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  const copyMessage = () => {
    if (!sendModal) return
    navigator.clipboard.writeText(getPreview(sendModal))
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MessageCircle size={20} className="text-violet-600" /> WhatsApp Templates</h1>
          <p className="text-sm text-gray-500">{templates.length} templates · Click Send to open WhatsApp</p>
        </div>
        <Button onClick={() => { setForm({ category: "GENERAL", active: true, variablesText: "" }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge color={catColors[t.category] ?? "gray"}>{t.category.replace("_", " ")}</Badge>
                <h3 className="font-semibold text-gray-900 text-sm">{t.name}</h3>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap font-mono text-xs leading-relaxed mb-3 max-h-24 overflow-y-auto">
              {t.message}
            </div>
            {t.variables.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {t.variables.map(v => <span key={v} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{`{{${v}}}`}</span>)}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setForm({ ...t, variablesText: t.variables.join(", ") }); setEditId(t.id); setShowForm(true) }} className="text-xs text-gray-500 hover:underline">Edit</button>
              <button onClick={() => setDeleteId(t.id)} className="text-xs text-red-500 hover:underline">Del</button>
              <Button size="sm" onClick={() => openSend(t)}><Send size={12} /> Send</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Send Modal */}
      <Modal open={!!sendModal} onClose={() => setSendModal(null)} title={`Send: ${sendModal?.name}`} size="lg">
        {sendModal && (
          <div className="space-y-4">
            <Input label="WhatsApp Number (with country code)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
            {sendModal.variables.map(v => (
              <Input key={v} label={`{{${v}}}`} value={previewVars[v] ?? ""} onChange={e => setPreviewVars(p => ({ ...p, [v]: e.target.value }))} />
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700">Preview</label>
              <div className="mt-1 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap font-sans">
                {getPreview(sendModal)}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={copyMessage}><Copy size={14} /> Copy</Button>
              <Button onClick={sendWhatsApp} className="bg-green-600 hover:bg-green-700"><Send size={14} /> Open WhatsApp</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Template Form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Template" : "Add Template"} size="lg">
        <div className="space-y-4">
          <Input label="Template Name *" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Select label="Category" value={form.category ?? "GENERAL"} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={catOpts} />
          <div>
            <label className="text-sm font-medium text-gray-700">Message * (use {"{{VarName}}"} for variables)</label>
            <textarea value={form.message ?? ""} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={6} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-violet-500" />
          </div>
          <Input label="Variables (comma separated)" value={form.variablesText ?? ""} onChange={e => setForm(p => ({ ...p, variablesText: e.target.value }))} hint="e.g. GuestName, Date, Venue" />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Template</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Template" message="Remove this WhatsApp template?" />
    </div>
  )
}
