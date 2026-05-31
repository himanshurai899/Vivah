"use client"

import { useEffect, useState } from "react"
import { Bell, Plus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatDate } from "@/lib/utils/date"

type Alert = { id: string; type: string; title: string; message: string; active: boolean; isRead: boolean; createdAt: string }

const typeColors: Record<string, "red" | "orange" | "blue" | "green"> = { CRITICAL: "red", WARNING: "orange", INFO: "blue", SUCCESS: "green" }
const typeOpts = [{ value: "INFO", label: "Info" }, { value: "WARNING", label: "Warning" }, { value: "CRITICAL", label: "Critical" }, { value: "SUCCESS", label: "Success" }]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Alert>>({ type: "INFO", active: true })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/alerts").then(r => r.json()).then(setAlerts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const markRead = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) })
    load()
  }

  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/alerts/${editId}` : "/api/alerts"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/alerts/${deleteId}`, { method: "DELETE" }); setDeleteId(null); void load()
  }

  if (loading) return <PageLoader />

  const unread = alerts.filter(a => !a.isRead).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-violet-600" /> Alerts System
            {unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">{unread}</span>}
          </h1>
          <p className="text-sm text-gray-500">{alerts.length} alerts · {unread} unread</p>
        </div>
        <Button onClick={() => { setForm({ type: "INFO", active: true }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Alert
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No alerts. System is clear! ✅</div>
        ) : alerts.map(a => (
          <div key={a.id} className={`bg-white rounded-xl border p-4 ${a.isRead ? "opacity-60" : ""} ${a.type === "CRITICAL" ? "border-red-200 bg-red-50" : a.type === "WARNING" ? "border-orange-200 bg-orange-50" : "border-gray-100"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Badge color={typeColors[a.type]}>{a.type}</Badge>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(a.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!a.isRead && (
                  <button onClick={() => markRead(a.id)} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                    <CheckCircle size={12} /> Mark read
                  </button>
                )}
                <button onClick={() => { setForm({ ...a }); setEditId(a.id); setShowForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(a.id)} className="text-xs text-red-500 hover:underline">Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Alert" : "Add Alert"}>
        <div className="space-y-4">
          <Select label="Alert Type" value={form.type ?? "INFO"} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={typeOpts} />
          <Input label="Title *" value={form.title ?? ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700">Message *</label>
            <textarea value={form.message ?? ""} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Alert</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Alert" message="Remove this alert?" />
    </div>
  )
}

