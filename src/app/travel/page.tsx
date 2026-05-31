"use client"

import { useEffect, useState } from "react"
import { Plus, Plane } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatDate } from "@/lib/utils/date"
import { TRANSPORT_TYPES } from "@/lib/constants"

type TravelRecord = {
  id: string; guestName: string; arrivalDate?: string; arrivalTime?: string
  transportType: string; pnrBookingId?: string; pickupNeeded: boolean
  pickupCoordinator?: string; vehicleNumber?: string; status: string
}

const transportOpts = Object.entries(TRANSPORT_TYPES).map(([v, l]) => ({ value: v, label: l }))
const statusOpts = [{ value: "PENDING", label: "Pending" }, { value: "CONFIRMED", label: "Confirmed" }, { value: "DELAYED", label: "Delayed" }, { value: "COMPLETED", label: "Completed" }]
const statusColors: Record<string, "yellow" | "green" | "red" | "blue"> = { PENDING: "yellow", CONFIRMED: "green", DELAYED: "red", COMPLETED: "blue" }
const transportIcons: Record<string, string> = { FLIGHT: "✈️", TRAIN: "🚂", BUS: "🚌", CAB: "🚕", PRIVATE_VEHICLE: "🚗" }

export default function TravelPage() {
  const [records, setRecords] = useState<TravelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<TravelRecord>>({ transportType: "TRAIN", status: "PENDING", pickupNeeded: false })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/travel").then(r => r.json()).then(setRecords).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const needPickup = records.filter(r => r.pickupNeeded && r.status !== "COMPLETED")
  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/travel/${editId}` : "/api/travel"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/travel/${deleteId}`, { method: "DELETE" }); setDeleteId(null); void load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Plane size={20} className="text-violet-600" /> Travel Management</h1>
          <p className="text-sm text-gray-500">{records.length} travel records · {needPickup.length} need pickup</p>
        </div>
        <Button onClick={() => { setForm({ transportType: "TRAIN", status: "PENDING", pickupNeeded: false }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Record
        </Button>
      </div>

      {needPickup.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-700 mb-2">🚗 Pickup Required ({needPickup.length} guests)</h3>
          <div className="flex flex-wrap gap-2">
            {needPickup.map(r => (
              <span key={r.id} className="text-xs bg-white border border-orange-200 rounded-lg px-2 py-1 text-orange-700">
                {r.guestName} · {transportIcons[r.transportType] ?? ""} {r.arrivalDate ? formatDate(r.arrivalDate) : "Date TBD"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Guest", "Arrival", "Mode", "PNR/Booking", "Pickup", "Coordinator", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No travel records yet.</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.guestName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.arrivalDate ? formatDate(r.arrivalDate) : "—"}{r.arrivalTime ? ` ${r.arrivalTime}` : ""}</td>
                  <td className="px-4 py-3">{transportIcons[r.transportType] ?? ""} {TRANSPORT_TYPES[r.transportType]}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.pnrBookingId ?? "—"}</td>
                  <td className="px-4 py-3">{r.pickupNeeded ? "🚗 Yes" : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.pickupCoordinator ?? "—"}</td>
                  <td className="px-4 py-3"><Badge color={statusColors[r.status] ?? "gray"}>{r.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setForm({ ...r }); setEditId(r.id); setShowForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteId(r.id)} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Travel Record" : "Add Travel Record"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Guest Name *" value={form.guestName ?? ""} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} />
          <Select label="Transport" value={form.transportType ?? "TRAIN"} onChange={e => setForm(p => ({ ...p, transportType: e.target.value }))} options={transportOpts} />
          <Input label="Arrival Date" type="date" value={form.arrivalDate ? new Date(form.arrivalDate).toISOString().split("T")[0] : ""} onChange={e => setForm(p => ({ ...p, arrivalDate: e.target.value }))} />
          <Input label="Arrival Time" type="time" value={form.arrivalTime ?? ""} onChange={e => setForm(p => ({ ...p, arrivalTime: e.target.value }))} />
          <Input label="PNR / Booking ID" value={form.pnrBookingId ?? ""} onChange={e => setForm(p => ({ ...p, pnrBookingId: e.target.value }))} />
          <Select label="Status" value={form.status ?? "PENDING"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={statusOpts} />
          <label className="flex items-center gap-2 text-sm cursor-pointer pt-6">
            <input type="checkbox" checked={form.pickupNeeded ?? false} onChange={e => setForm(p => ({ ...p, pickupNeeded: e.target.checked }))} className="rounded" />
            Pickup Required
          </label>
          <Input label="Pickup Coordinator" value={form.pickupCoordinator ?? ""} onChange={e => setForm(p => ({ ...p, pickupCoordinator: e.target.value }))} />
          <Input label="Vehicle Number" value={form.vehicleNumber ?? ""} onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Record</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Record" message="Remove this travel record?" />
    </div>
  )
}

