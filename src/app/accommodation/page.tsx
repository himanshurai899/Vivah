"use client"

import { useEffect, useState } from "react"
import { Plus, Hotel } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatINR } from "@/lib/utils/currency"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/Badge"

type HotelType = { id: string; name: string; type: string; address?: string; contactPerson?: string; phone?: string; roomsAvailable: number; roomsAllocated: number; checkInDate?: string; checkOutDate?: string; costPerNight?: number }

const typeOpts = [{ value: "HOTEL", label: "Hotel" }, { value: "GUEST_HOUSE", label: "Guest House" }, { value: "RELATIVE_HOME", label: "Relative Home" }, { value: "RESORT", label: "Resort" }]

export default function AccommodationPage() {
  const [hotels, setHotels] = useState<HotelType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<HotelType>>({ type: "HOTEL", roomsAvailable: 0, roomsAllocated: 0 })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/accommodation").then(r => r.json()).then(setHotels).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const totalRooms = hotels.reduce((s, h) => s + h.roomsAvailable, 0)
  const allocatedRooms = hotels.reduce((s, h) => s + h.roomsAllocated, 0)

  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/accommodation/${editId}` : "/api/accommodation"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/accommodation/${deleteId}`, { method: "DELETE" }); setDeleteId(null); void load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Hotel size={20} className="text-violet-600" /> Accommodation Planner</h1>
          <p className="text-sm text-gray-500">{totalRooms} total rooms · {allocatedRooms} allocated · {totalRooms - allocatedRooms} available</p>
        </div>
        <Button onClick={() => { setForm({ type: "HOTEL", roomsAvailable: 0, roomsAllocated: 0 }); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {hotels.map(h => {
          const avail = h.roomsAvailable - h.roomsAllocated
          const util = h.roomsAvailable > 0 ? Math.round(h.roomsAllocated / h.roomsAvailable * 100) : 0
          return (
            <div key={h.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{h.name}</h3>
                  <Badge color={h.type === "HOTEL" ? "blue" : h.type === "RESORT" ? "purple" : "gray"} className="mt-1">{h.type.replace("_", " ")}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{h.roomsAvailable}</div>
                  <div className="text-xs text-gray-500">rooms</div>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                {h.address && <div className="text-xs text-gray-500">📍 {h.address}</div>}
                {h.phone && <div>📞 {h.phone}</div>}
                {h.contactPerson && <div>👤 {h.contactPerson}</div>}
                {h.checkInDate && <div>Check-in: {formatDate(h.checkInDate)} → {formatDate(h.checkOutDate)}</div>}
                {h.costPerNight && <div>💰 {formatINR(h.costPerNight)}/night</div>}
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Allocated: {h.roomsAllocated}</span>
                  <span className={avail < 5 ? "text-orange-500 font-medium" : ""}>{avail} available</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${util > 80 ? "bg-orange-400" : "bg-violet-500"}`} style={{ width: `${util}%` }} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => { setForm({ ...h }); setEditId(h.id); setShowForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(h.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          )
        })}
        {hotels.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No accommodation properties added yet.</div>}
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Property" : "Add Property"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Property Name *" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Select label="Type" value={form.type ?? "HOTEL"} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={typeOpts} />
          <div className="sm:col-span-2"><Input label="Address" value={form.address ?? ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <Input label="Contact Person" value={form.contactPerson ?? ""} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
          <Input label="Phone" value={form.phone ?? ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Rooms Available" type="number" value={form.roomsAvailable ?? 0} onChange={e => setForm(p => ({ ...p, roomsAvailable: parseInt(e.target.value) || 0 }))} />
          <Input label="Rooms Allocated" type="number" value={form.roomsAllocated ?? 0} onChange={e => setForm(p => ({ ...p, roomsAllocated: parseInt(e.target.value) || 0 }))} />
          <Input label="Check-In Date" type="date" value={form.checkInDate ? new Date(form.checkInDate).toISOString().split("T")[0] : ""} onChange={e => setForm(p => ({ ...p, checkInDate: e.target.value }))} />
          <Input label="Check-Out Date" type="date" value={form.checkOutDate ? new Date(form.checkOutDate).toISOString().split("T")[0] : ""} onChange={e => setForm(p => ({ ...p, checkOutDate: e.target.value }))} />
          <Input label="Cost Per Night (₹)" type="number" value={form.costPerNight ?? ""} onChange={e => setForm(p => ({ ...p, costPerNight: parseFloat(e.target.value) || undefined }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Property</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Property" message="Remove this accommodation property?" />
    </div>
  )
}

