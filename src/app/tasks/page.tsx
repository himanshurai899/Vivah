"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge, taskStatusColor, priorityColor } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { useCrud } from "@/lib/hooks/useCrud"
import { formatDate, isOverdue } from "@/lib/utils/date"
import { TASK_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants"

type Task = { id: string; name: string; owner?: string; deadline?: string; priority: string; status: string; notes?: string }

const EMPTY: Partial<Task> = { priority: "MEDIUM", status: "PENDING" }
const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]
const statusOpts = STATUSES.map(v => ({ value: v, label: TASK_STATUS_LABELS[v] }))
const priorityOpts = Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))
const colColors: Record<string, string> = {
  PENDING: "border-gray-200", IN_PROGRESS: "border-blue-200", COMPLETED: "border-green-200", BLOCKED: "border-red-200",
}
const colBg: Record<string, string> = {
  PENDING: "bg-gray-50", IN_PROGRESS: "bg-blue-50", COMPLETED: "bg-green-50", BLOCKED: "bg-red-50",
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToastContext()
  const crud = useCrud<Partial<Task>>(EMPTY)

  const load = useCallback(() =>
    fetch("/api/tasks").then(r => r.json()).then(setTasks).finally(() => setLoading(false))
  , [])

  useEffect(() => { load() }, [load])

  const columns = STATUSES.map(s => ({ status: s, tasks: tasks.filter(t => t.status === s) }))

  const quickStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      await load()
      toast({ message: "Status updated", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Failed", variant: "error" })
    }
  }

  const handleSave = async () => {
    const isEdit = !!crud.editId
    try {
      await crud.save("/api/tasks")
      await load()
      toast({ message: isEdit ? "Task updated" : "Task added", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Failed to save", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(deleteId)}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? "Delete failed")
      }
      setDeleteId(null)
      await load()
      toast({ message: "Task deleted", variant: "success" })
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
          <h1 className="page-title"><CheckSquare size={22} aria-hidden /> Task Management</h1>
          <p className="page-subtitle">
            {tasks.filter(t => t.status !== "COMPLETED").length} open · {tasks.filter(t => t.status === "COMPLETED").length} completed
          </p>
        </div>
        <Button onClick={crud.openAdd}><Plus size={15} /> Add Task</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(({ status, tasks: colTasks }) => (
          <div key={status} className={`rounded-xl border ${colColors[status]} ${colBg[status]} p-3`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <Badge color={taskStatusColor(status)}>{TASK_STATUS_LABELS[status]}</Badge>
              <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>{colTasks.length}</span>
            </div>
            <div className="space-y-2">
              {colTasks.map(t => (
                <div key={t.id} className="card p-3 text-sm">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-medium leading-snug" style={{ color: "var(--ink)" }}>{t.name}</span>
                    <Badge color={priorityColor(t.priority)} className="shrink-0 text-[10px]">
                      {PRIORITY_LABELS[t.priority]}
                    </Badge>
                  </div>
                  {t.owner && <p className="text-xs mb-1" style={{ color: "var(--text-faint)" }}>👤 {t.owner}</p>}
                  {t.deadline && (
                    <p className={`text-xs mb-2 ${isOverdue(t.deadline) && t.status !== "COMPLETED" ? "text-red-500 font-medium" : ""}`}
                      style={!isOverdue(t.deadline) || t.status === "COMPLETED" ? { color: "var(--text-faint)" } : {}}>
                      📅 {formatDate(t.deadline)}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <select value={t.status}
                      onChange={e => quickStatus(t.id, e.target.value)}
                      className="text-[10px] border rounded px-1 py-0.5 cursor-pointer"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                      {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => crud.openEdit(t)}
                        className="text-[10px] cursor-pointer hover:underline" style={{ color: "var(--purple)" }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteId(t.id)}
                        className="text-[10px] text-red-400 cursor-pointer hover:underline">
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="text-center py-4 text-xs rounded-lg border border-dashed"
                  style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={crud.showForm} onClose={crud.closeForm}
        title={crud.editId ? "Edit Task" : "Add Task"} size="md">
        <div className="space-y-4">
          <Input label="Task Name *" value={crud.form.name ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Owner" value={crud.form.owner ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, owner: e.target.value }))} />
          <Input label="Deadline" type="date"
            value={crud.form.deadline ? new Date(crud.form.deadline).toISOString().split("T")[0] : ""}
            onChange={e => crud.setForm(p => ({ ...p, deadline: e.target.value }))} />
          <Select label="Priority" value={crud.form.priority ?? "MEDIUM"}
            onChange={e => crud.setForm(p => ({ ...p, priority: e.target.value }))}
            options={priorityOpts} />
          <Select label="Status" value={crud.form.status ?? "PENDING"}
            onChange={e => crud.setForm(p => ({ ...p, status: e.target.value }))}
            options={statusOpts} />
          <Input label="Notes" value={crud.form.notes ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={crud.closeForm}>Cancel</Button>
          <Button onClick={handleSave} loading={crud.saving}>
            {crud.editId ? "Update Task" : "Save Task"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Task" message="Delete this task? This cannot be undone." loading={deleting} />
    </div>
  )
}
