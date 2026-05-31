"use client"

import { useEffect, useState } from "react"
import { Plus, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge, taskStatusColor, priorityColor } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatDate, isOverdue } from "@/lib/utils/date"
import { TASK_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants"

type Responsibility = { id: string; task: string; owner?: string; backupPerson?: string; deadline?: string; priority: string; status: string; notes?: string }

const statusOpts = Object.entries(TASK_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const priorityOpts = Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))

export default function ResponsibilitiesPage() {
  const [items, setItems] = useState<Responsibility[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Responsibility>>({ priority: "MEDIUM", status: "PENDING" })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/responsibilities").then(r => r.json()).then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/responsibilities/${editId}` : "/api/responsibilities"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/responsibilities/${deleteId}`, { method: "DELETE" }); setDeleteId(null); void load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><UserCheck size={20} className="text-violet-600" /> Family Responsibility Matrix</h1>
          <p className="text-sm text-gray-500">{items.length} responsibilities · {items.filter(i => i.status === "COMPLETED").length} completed</p>
        </div>
        <Button onClick={() => { setForm({ priority: "MEDIUM", status: "PENDING" }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Responsibility
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Task", "Owner", "Backup", "Deadline", "Priority", "Status", "Notes", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No responsibilities assigned yet.</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${item.status === "COMPLETED" ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">{item.task}</td>
                  <td className="px-4 py-3 text-gray-700">{item.owner ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.backupPerson ?? "—"}</td>
                  <td className={`px-4 py-3 text-sm ${isOverdue(item.deadline) && item.status !== "COMPLETED" ? "text-red-500 font-medium" : "text-gray-600"}`}>
                    {item.deadline ? formatDate(item.deadline) : "—"}
                  </td>
                  <td className="px-4 py-3"><Badge color={priorityColor(item.priority)}>{PRIORITY_LABELS[item.priority]}</Badge></td>
                  <td className="px-4 py-3"><Badge color={taskStatusColor(item.status)}>{TASK_STATUS_LABELS[item.status]}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{item.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setForm({ ...item }); setEditId(item.id); setShowForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Responsibility" : "Add Responsibility"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Input label="Task / Responsibility *" value={form.task ?? ""} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} /></div>
          <Input label="Owner" value={form.owner ?? ""} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
          <Input label="Backup Person" value={form.backupPerson ?? ""} onChange={e => setForm(p => ({ ...p, backupPerson: e.target.value }))} />
          <Input label="Deadline" type="date" value={form.deadline ? new Date(form.deadline).toISOString().split("T")[0] : ""} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          <Select label="Priority" value={form.priority ?? "MEDIUM"} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} options={priorityOpts} />
          <Select label="Status" value={form.status ?? "PENDING"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={statusOpts} />
          <div className="sm:col-span-2"><Input label="Notes" value={form.notes ?? ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Responsibility" message="Remove this responsibility?" />
    </div>
  )
}

