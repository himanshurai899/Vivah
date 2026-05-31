"use client"

import { useEffect, useState } from "react"
import { QrCode, Plus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { PageLoader } from "@/components/ui/Spinner"
import { formatDateTime } from "@/lib/utils/date"

type CheckIn = { id: string; guestName: string; familyName?: string; eventName: string; status: string; arrivalTime?: string; notes?: string }
type Event = { id: string; name: string }

export default function CheckInPage() {
  const [records, setRecords] = useState<CheckIn[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<CheckIn & { eventId: string }>>({ status: "PENDING" })
  const [saving, setSaving] = useState(false)

  const load = () => {
    const p = new URLSearchParams()
    if (filterEvent) p.set("eventId", filterEvent)
    if (filterStatus) p.set("status", filterStatus)
    Promise.all([
      fetch(`/api/checkin?${p}`).then(r => r.json()),
      fetch("/api/events").then(r => r.json()),
    ]).then(([ci, ev]) => { setRecords(ci); setEvents(ev) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filterEvent, filterStatus])

  const checkinNow = async (id: string) => {
    await fetch(`/api/checkin/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CHECKED_IN" }) })
    load()
  }

  const save = async () => {
    setSaving(true)
    const selectedEvent = events.find(e => e.id === form.eventId)
    await fetch("/api/checkin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventName: selectedEvent?.name ?? form.eventId ?? "" }),
    })
    setShowForm(false); load(); setSaving(false)
  }

  const totals = { total: records.length, checkedIn: records.filter(r => r.status === "CHECKED_IN").length, pending: records.filter(r => r.status === "PENDING").length }
  const eventOpts = events.map(e => ({ value: e.id, label: e.name }))
  const statusOpts = [{ value: "PENDING", label: "Pending" }, { value: "CHECKED_IN", label: "Checked In" }, { value: "ABSENT", label: "Absent" }]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><QrCode size={20} className="text-violet-600" /> Guest Check-In</h1>
          <p className="text-sm text-gray-500">{totals.total} records · {totals.checkedIn} checked in · {totals.pending} pending</p>
        </div>
        <Button onClick={() => { setForm({ status: "PENDING" }); setShowForm(true) }}>
          <Plus size={15} /> Add Check-In
        </Button>
      </div>

      {/* Progress bar */}
      {totals.total > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Check-In Progress</span>
            <span className="text-green-600 font-bold">{Math.round(totals.checkedIn / totals.total * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${totals.checkedIn / totals.total * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{totals.checkedIn} checked in</span>
            <span>{totals.pending} pending</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} options={eventOpts} placeholder="All Events" className="w-48" />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={statusOpts} placeholder="All Statuses" className="w-40" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              {["Guest", "Family", "Event", "Status", "Arrival Time", ""].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No check-in records. Add guests to check-in system.</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${r.status === "CHECKED_IN" ? "bg-green-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.guestName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.familyName ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.eventName}</td>
                  <td className="px-4 py-3">
                    <Badge color={r.status === "CHECKED_IN" ? "green" : r.status === "ABSENT" ? "red" : "yellow"}>{r.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.arrivalTime ? formatDateTime(r.arrivalTime) : "—"}</td>
                  <td className="px-4 py-3">
                    {r.status === "PENDING" && (
                      <button onClick={() => checkinNow(r.id)} className="flex items-center gap-1 text-xs text-green-600 hover:underline font-medium">
                        <CheckCircle size={13} /> Check In
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Check-In Record">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Guest Name *" value={form.guestName ?? ""} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} />
          <Input label="Family Name" value={form.familyName ?? ""} onChange={e => setForm(p => ({ ...p, familyName: e.target.value }))} />
          <Select label="Event" value={(form as any).eventId ?? ""} onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))} options={eventOpts} placeholder="Select event" />
          <Select label="Status" value={form.status ?? "PENDING"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={statusOpts} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
