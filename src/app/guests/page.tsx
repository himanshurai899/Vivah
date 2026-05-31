"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Download, Users } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge, rsvpColor } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"
import { useCrud } from "@/lib/hooks/useCrud"
import { RSVP_LABELS } from "@/lib/constants"

type Guest = {
  id: string; name: string; familyName: string; mobile?: string; city?: string
  state?: string; relationship?: string; side: string; guestCount: number
  accommodationNeeded: boolean; pickupNeeded: boolean; invitationSent: boolean
  rsvpStatus: string; giftReceived: boolean; notes?: string
}

const EMPTY = (): Partial<Guest> => ({
  side: "GROOM", guestCount: 1, rsvpStatus: "PENDING",
  accommodationNeeded: false, pickupNeeded: false, invitationSent: false, giftReceived: false,
})

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterSide, setFilterSide] = useState("")
  const [filterRsvp, setFilterRsvp] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToastContext()
  const crud = useCrud<Partial<Guest>>(EMPTY())

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (filterSide) params.set("side", filterSide)
    if (filterRsvp) params.set("rsvp", filterRsvp)
    return fetch(`/api/guests?${params}`).then(r => r.json()).then(setGuests).finally(() => setLoading(false))
  }, [filterSide, filterRsvp])

  useEffect(() => { load() }, [load])

  const filtered = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.familyName.toLowerCase().includes(search.toLowerCase()) ||
    (g.city ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const totals = {
    total: filtered.reduce((s, g) => s + g.guestCount, 0),
    confirmed: filtered.filter(g => g.rsvpStatus === "CONFIRMED").reduce((s, g) => s + g.guestCount, 0),
    groom: filtered.filter(g => g.side === "GROOM").reduce((s, g) => s + g.guestCount, 0),
    bride: filtered.filter(g => g.side === "BRIDE").reduce((s, g) => s + g.guestCount, 0),
  }

  const handleSave = async () => {
    if (!crud.form.name || !crud.form.familyName || !crud.form.side) {
      toast({ message: "Name, family name and side are required", variant: "error" })
      return
    }
    const isEdit = !!crud.editId
    try {
      await crud.save("/api/guests")
      await load()
      toast({ message: isEdit ? "Guest updated" : "Guest added", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Failed to save", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/guests/${encodeURIComponent(deleteId)}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? "Delete failed")
      }
      setDeleteId(null)
      await load()
      toast({ message: "Guest removed", variant: "success" })
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Delete failed", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const exportCsv = () => {
    const headers = "Name,Family,Side,City,State,Phone,RSVP,Count,Accommodation,Pickup"
    const rows = filtered.map(g =>
      `${g.name},${g.familyName},${g.side},${g.city ?? ""},${g.state ?? ""},${g.mobile ?? ""},${g.rsvpStatus},${g.guestCount},${g.accommodationNeeded},${g.pickupNeeded}`
    )
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "guests.csv"; a.click()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title"><Users size={22} aria-hidden /> Guest Management</h1>
          <p className="page-subtitle">
            {totals.total} guests · {totals.confirmed} confirmed · {totals.groom} groom · {totals.bride} bride side
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Button>
          <Button onClick={() => crud.openAdd()}><Plus size={15} /> Add Guest</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, family, city..."
            className="field-input pl-8" />
        </div>
        <Select value={filterSide} onChange={e => setFilterSide(e.target.value)}
          options={[{ value: "GROOM", label: "Groom Side" }, { value: "BRIDE", label: "Bride Side" }]}
          placeholder="All Sides" className="w-36" />
        <Select value={filterRsvp} onChange={e => setFilterRsvp(e.target.value)}
          options={[{ value: "CONFIRMED", label: "Confirmed" }, { value: "PENDING", label: "Pending" }, { value: "DECLINED", label: "Declined" }]}
          placeholder="All RSVP" className="w-36" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {["Name", "Family", "Side", "City", "Phone", "Count", "RSVP", "Accom.", "Pickup", ""].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12" style={{ color: "var(--text-faint)" }}>
                  No guests found. Add your first guest!
                </td></tr>
              ) : filtered.map(g => (
                <tr key={g.id}>
                  <td className="font-medium" style={{ color: "var(--ink)" }}>{g.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{g.familyName}</td>
                  <td><Badge color={g.side === "GROOM" ? "purple" : "orange"}>{g.side}</Badge></td>
                  <td style={{ color: "var(--text-muted)" }}>{g.city ?? "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{g.mobile ?? "—"}</td>
                  <td className="text-center font-medium">{g.guestCount}</td>
                  <td><Badge color={rsvpColor(g.rsvpStatus)}>{RSVP_LABELS[g.rsvpStatus]}</Badge></td>
                  <td className="text-center">{g.accommodationNeeded ? "✅" : "—"}</td>
                  <td className="text-center">{g.pickupNeeded ? "🚗" : "—"}</td>
                  <td>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => crud.openEdit(g)}
                        className="text-xs cursor-pointer hover:underline" style={{ color: "var(--purple)" }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteId(g.id)}
                        className="text-xs text-red-500 cursor-pointer hover:underline">
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={crud.showForm} onClose={crud.closeForm}
        title={crud.editId ? "Edit Guest" : "Add Guest"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" value={crud.form.name ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Family Name *" value={crud.form.familyName ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, familyName: e.target.value }))} />
          <Select label="Side *" value={crud.form.side ?? "GROOM"}
            onChange={e => crud.setForm(p => ({ ...p, side: e.target.value }))}
            options={[{ value: "GROOM", label: "Groom Side" }, { value: "BRIDE", label: "Bride Side" }]} />
          <Input label="Mobile" value={crud.form.mobile ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, mobile: e.target.value }))} />
          <Input label="City" value={crud.form.city ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, city: e.target.value }))} />
          <Input label="State" value={crud.form.state ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, state: e.target.value }))} />
          <Input label="Relationship" value={crud.form.relationship ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, relationship: e.target.value }))} />
          <Input label="Guest Count" type="number" min="1" value={crud.form.guestCount ?? 1}
            onChange={e => crud.setForm(p => ({ ...p, guestCount: parseInt(e.target.value) || 1 }))} />
          <Select label="RSVP Status" value={crud.form.rsvpStatus ?? "PENDING"}
            onChange={e => crud.setForm(p => ({ ...p, rsvpStatus: e.target.value }))}
            options={[{ value: "PENDING", label: "Pending" }, { value: "CONFIRMED", label: "Confirmed" }, { value: "DECLINED", label: "Declined" }]} />
          <div className="flex flex-col gap-2 pt-5">
            {([
              ["accommodationNeeded", "Needs Accommodation"],
              ["pickupNeeded", "Needs Pickup"],
              ["invitationSent", "Invitation Sent"],
              ["giftReceived", "Gift Received"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox"
                  checked={(crud.form as Record<string, unknown>)[key] as boolean ?? false}
                  onChange={e => crud.setForm(p => ({ ...p, [key]: e.target.checked }))}
                  className="rounded" style={{ accentColor: "var(--purple)" }} />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <Input label="Notes" value={crud.form.notes ?? ""}
            onChange={e => crud.setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={crud.closeForm}>Cancel</Button>
          <Button onClick={handleSave} loading={crud.saving}>
            {crud.editId ? "Update Guest" : "Save Guest"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Guest" message="Remove this guest? This cannot be undone." loading={deleting} />
    </div>
  )
}
