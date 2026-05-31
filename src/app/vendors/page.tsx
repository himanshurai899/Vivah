"use client"

import { useEffect, useState } from "react"
import { Plus, Store } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge, vendorStatusColor } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { formatINR } from "@/lib/utils/currency"
import { VENDOR_CATEGORIES, VENDOR_STATUS_LABELS } from "@/lib/constants"

type Vendor = {
  id: string; name: string; category: string; contactPerson?: string; phone?: string; email?: string
  quotation?: number; negotiatedAmount?: number; finalAmount?: number; advancePaid: number
  contractNotes?: string; status: string; rating?: number; notes?: string
}

const catOptions = Object.entries(VENDOR_CATEGORIES).map(([value, label]) => ({ value, label }))
const statusOptions = Object.entries(VENDOR_STATUS_LABELS).map(([value, label]) => ({ value, label }))
const emptyVendor = (): Partial<Vendor> => ({ category: "PHOTOGRAPHER", status: "SHORTLISTED", advancePaid: 0 })

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Vendor>>(emptyVendor())
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    const p = new URLSearchParams()
    if (filterCat) p.set("category", filterCat)
    if (filterStatus) p.set("status", filterStatus)
    fetch(`/api/vendors?${p}`).then(r => r.json()).then(setVendors).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filterCat, filterStatus])

  const openAdd = () => { setForm(emptyVendor()); setEditId(null); setShowForm(true) }
  const openEdit = (v: Vendor) => { setForm({ ...v }); setEditId(v.id); setShowForm(true) }

  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/vendors/${editId}` : "/api/vendors"
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false); load(); setSaving(false)
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/vendors/${deleteId}`, { method: "DELETE" }); setDeleteId(null); void load()
  }

  const totalFinalized = vendors.filter(v => v.status === "FINALIZED").reduce((s, v) => s + (v.finalAmount ?? v.negotiatedAmount ?? v.quotation ?? 0), 0)
  const totalAdvance = vendors.reduce((s, v) => s + v.advancePaid, 0)

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Store size={20} className="text-violet-600" /> Vendor Management</h1>
          <p className="text-sm text-gray-500">{vendors.length} vendors · Finalized value: {formatINR(totalFinalized)} · Advance paid: {formatINR(totalAdvance)}</p>
        </div>
        <Button onClick={openAdd}><Plus size={15} /> Add Vendor</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} options={catOptions} placeholder="All Categories" className="w-44" />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={statusOptions} placeholder="All Statuses" className="w-40" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Vendor", "Category", "Phone", "Quotation", "Negotiated", "Advance Paid", "Status", "Rating", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No vendors yet. Add vendors to get started.</td></tr>
              ) : vendors.map(v => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{v.name}</div>
                    {v.contactPerson && <div className="text-xs text-gray-500">{v.contactPerson}</div>}
                  </td>
                  <td className="px-4 py-3"><Badge color="purple">{VENDOR_CATEGORIES[v.category] ?? v.category}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{v.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{v.quotation ? formatINR(v.quotation) : "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{v.negotiatedAmount ? formatINR(v.negotiatedAmount) : "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatINR(v.advancePaid)}</td>
                  <td className="px-4 py-3"><Badge color={vendorStatusColor(v.status)}>{VENDOR_STATUS_LABELS[v.status]}</Badge></td>
                  <td className="px-4 py-3 text-yellow-500">{v.rating ? "★".repeat(v.rating) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(v)} className="text-xs text-violet-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteId(v.id)} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null) }} title={editId ? "Edit Vendor" : "Add Vendor"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Vendor Name *" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Select label="Category *" value={form.category ?? "PHOTOGRAPHER"} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={catOptions} />
          <Input label="Contact Person" value={form.contactPerson ?? ""} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
          <Input label="Phone" value={form.phone ?? ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Email" value={form.email ?? ""} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Select label="Status" value={form.status ?? "SHORTLISTED"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={statusOptions} />
          <Input label="Quotation (₹)" type="number" value={form.quotation ?? ""} onChange={e => setForm(p => ({ ...p, quotation: parseFloat(e.target.value) || undefined }))} />
          <Input label="Negotiated (₹)" type="number" value={form.negotiatedAmount ?? ""} onChange={e => setForm(p => ({ ...p, negotiatedAmount: parseFloat(e.target.value) || undefined }))} />
          <Input label="Final Amount (₹)" type="number" value={form.finalAmount ?? ""} onChange={e => setForm(p => ({ ...p, finalAmount: parseFloat(e.target.value) || undefined }))} />
          <Input label="Advance Paid (₹)" type="number" value={form.advancePaid ?? 0} onChange={e => setForm(p => ({ ...p, advancePaid: parseFloat(e.target.value) || 0 }))} />
          <Input label="Rating (1–5)" type="number" min="1" max="5" value={form.rating ?? ""} onChange={e => setForm(p => ({ ...p, rating: parseInt(e.target.value) || undefined }))} />
        </div>
        <div className="mt-3">
          <Input label="Contract Notes" value={form.contractNotes ?? ""} onChange={e => setForm(p => ({ ...p, contractNotes: e.target.value }))} />
        </div>
        <div className="mt-3">
          <Input label="Internal Notes" value={form.notes ?? ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save Vendor</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete Vendor" message="Are you sure you want to remove this vendor?" />
    </div>
  )
}

