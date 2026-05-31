"use client"

import { useEffect, useState } from "react"
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

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]
const statusOpts = STATUSES.map(v => ({ value: v, label: TASK_STATUS_LABELS[v] }))
const priorityOpts = Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))

const emptyTask = (): Partial<Task> => ({ priority: "MEDIUM", status: "PENDING" })

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToastContext()
  const crud = useCrud<Partial<Task>>(emptyTask())

  const load = async () => {
    try {
      const res = await fetch("/api/tasks")
      setTasks(await res.json())
    } catch {
      toast({ message: "Failed to load tasks", variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const columns = STATUSES.map(s => ({ status: s, tasks: tasks.filter(t => t.status === s) }))

  const quickStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Update failed")
      await load()
    } catch {
      toast({ message: "Failed to update status", variant: "error" })
    }
  }

  const handleSave = async () => {
    try {
      await crud.save("/api/tasks")
      toast({ message: crud.editId ? "Task updated" : "Task added", variant: "success" })
      await load()
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Save failed", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast({ message: "Task deleted", variant: "success" })
      setDeleteId(null)
      await load()
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Delete failed", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  const colColors: Record<string, string> = {
    PENDING: "border-gray-200", IN_PROGRESS: "border-blue-200",
    COMPLETED: "border-green-200", BLOCKED: "border-red-200",
  }
  const colBg: Record<string, string> = {
    PENDING: "bg-gray-50", IN_PROGRESS: "bg-blue-50",
    COMPLETED: "bg-green-50", BLOCKED: "bg-red-50",
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title"><CheckSquare size={20} /> Task Management</h1>
          <p className="page-subtitle">
            {tasks.filter(t => t.status !== "COMPLETED").length} open · {tasks.filter(t => t.status === "COMPLETED").length} completed
          </p>
        </div>
        <Button onClick={crud.openAdd}><Plus size={15} /> Add Task</Button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(({ status, tasks: colTasks }) => (
          <div key={status} className={`rounded-xl border ${colColors[status]} ${colBg[status]} p-3`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <Badge color={taskStatusColor(status)}>{TASK_STATUS_LABELS[status]}</Badge>
              <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>{colTasks.length}</span>
            </div>
            <div className="space-y-2">
              {colTasks.map(t => (
                <div key={t.id} className="bg-white rounded-lg p-3 shadow-sm border border-white hover:border-violet-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium leading-snug" style={{ color: "var(--ink)" }}>{t.name}</span>
                    <Badge color={priorityColor(t.priority)} className="shrink-0">{t.priority[0]}</Badge>
                  </div>
                  {t.owner && <div className="text-xs" style={{ color: "var(--text-muted)" }}>👤 {t.owner}</div>}
                  {t.deadline && (
                    <div className={`text-xs mt-0.5 ${isOverdue(t.deadline) && t.status !== "COMPLETED" ? "text-red-500 font-medium" : ""}`}
                      style={(!isOverdue(t.deadline) || t.status === "COMPLETED") ? { color: "var(--text-faint)" } : {}}>
                      📅 {formatDate(t.deadline)}{isOverdue(t.deadline) && t.status !== "COMPLETED" ? " ⚠️" : ""}
                    </div>
                  )}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {STATUSES.filter(s => s !== status).map(s => (
                      <button type="button" key={s}
                        onClick={() => quickStatus(t.id, s)}
                        className="text-xs hover:underline cursor-pointer"
                        style={{ color: "var(--purple)" }}>
                        → {TASK_STATUS_LABELS[s]}
                      </button>
                    ))}
                    <button type="button" onClick={() => crud.openEdit(t)}
                      className="text-xs hover:underline cursor-pointer ml-auto"
                      style={{ color: "var(--text-faint)" }}>Edit</button>
                    <button type="button" onClick={() => setDeleteId(t.id)}
                      className="text-xs hover:underline cursor-pointer text-red-400">Del</button>
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="text-center py-4 text-xs" style={{ color: "var(--text-faint)" }}>Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={crud.showForm} onClose={crud.closeForm}
        title={crud.editId ? "Edit Task" : "Add Task"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Task Name *" value={crud.form.name ?? ""}
              onChange={e => crud.setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <Input label="Owner / Assignee" value={crud.form.owner ?? ""}
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
          <div className="sm:col-span-2">
            <Input label="Notes" value={crud.form.notes ?? ""}
              onChange={e => crud.setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={crud.closeForm}>Cancel</Button>
          <Button onClick={handleSave} loading={crud.saving}>
            {crud.saving ? "Saving…" : "Save Task"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Task" message="Remove this task?" loading={deleting} />
    </div>
  )
}
