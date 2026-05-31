"use client"

import { useEffect, useState, useCallback } from "react"
import { Phone, Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { useToastContext } from "@/components/ui/Toast"

type Contact = { id: string; category: string; name: string; phone: string; address?: string; notes?: string }

const CATEGORY_OPTS = [
  { value: "🏥 Medical",    label: "🏥 Medical"    },
  { value: "🚨 Emergency",  label: "🚨 Emergency"  },
  { value: "🚑 Ambulance",  label: "🚑 Ambulance"  },
  { value: "⚡ Utilities",  label: "⚡ Utilities"  },
  { value: "🚗 Transport",  label: "🚗 Transport"  },
  { value: "👨‍👩‍👧 Family",    label: "👨‍👩‍👧 Family"    },
  { value: "🏪 Vendor",     label: "🏪 Vendor"     },
  { value: "📋 Other",      label: "📋 Other"      },
]

const DEFAULT_CONTACTS: Omit<Contact, "id">[] = [
  { category: "🏥 Medical",   name: "Sterling Hospital Vadodara",       phone: "+91 265 2970000",  address: "Jetalpur Road, Vadodara" },
  { category: "🏥 Medical",   name: "Baroda Medical College Hospital",   phone: "+91 265 2413737",  address: "Mandvi, Vadodara" },
  { category: "🚨 Emergency", name: "Police Control Room",               phone: "100",              address: "Vadodara" },
  { category: "🚨 Emergency", name: "Fire Brigade",                      phone: "101",              address: "Vadodara" },
  { category: "🚑 Ambulance", name: "Ambulance (National)",              phone: "108",              address: "Gujarat" },
  { category: "⚡ Utilities", name: "Electrician — Wedding Venue",       phone: "+91 99XXXXXXXX",   address: "On-call, Wedding Venue" },
  { category: "⚡ Utilities", name: "Generator Backup Service",          phone: "+91 98XXXXXXXX",   address: "Vadodara" },
  { category: "🚗 Transport", name: "Shiv Travels (Fleet)",              phone: "+91 98XXXXXXXX",   address: "Vadodara" },
  { category: "👨‍👩‍👧 Family",  name: "Suresh Kumar (Father — Groom)",   phone: "+91 94XXXXXXXX",   address: "Patna, Bihar" },
  { category: "👨‍👩‍👧 Family",  name: "Mohan Verma (Father — Bride)",    phone: "+91 96XXXXXXXX",   address: "Patna, Bihar" },
  { category: "🏪 Vendor",    name: "Pt. Ramakant Shastri (Priest)",    phone: "+91 98XXXXXXXX",   address: "Vadodara" },
]

const EMPTY_FORM = (): Partial<Contact> => ({ category: "📋 Other" })

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Contact>>(EMPTY_FORM())
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToastContext()

  const load = useCallback(() =>
    fetch("/api/emergency").then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : [])).finally(() => setLoading(false)),
    []
  )

  useEffect(() => { load() }, [load])

  const seedDefaults = async () => {
    setSeeding(true)
    try {
      await Promise.all(
        DEFAULT_CONTACTS.map(c =>
          fetch("/api/emergency", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) })
        )
      )
      toast({ message: "Default contacts loaded", variant: "success" })
      load()
    } catch {
      toast({ message: "Failed to load defaults", variant: "error" })
    } finally {
      setSeeding(false)
    }
  }

  const save = async () => {
    if (!form.name || !form.phone) { toast({ message: "Name and phone are required", variant: "error" }); return }
    setSaving(true)
    try {
      const url    = editId ? `/api/emergency/${editId}` : "/api/emergency"
      const method = editId ? "PUT" : "POST"
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      toast({ message: editId ? "Contact updated" : "Contact added", variant: "success" })
      setShowForm(false)
      load()
    } catch {
      toast({ message: "Failed to save contact", variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    await fetch(`/api/emergency/${deleteId}`, { method: "DELETE" })
    setDeleteId(null)
    load()
  }

  const openEdit = (c: Contact) => {
    setForm(c)
    setEditId(c.id)
    setShowForm(true)
  }

  const categories = Array.from(new Set(contacts.map(c => c.category)))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Phone size={24} className="text-red-600" /> Emergency Contacts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{contacts.length} contacts ready for wedding day</p>
        </div>
        <div className="flex gap-2">
          {contacts.length === 0 && (
            <Button variant="secondary" onClick={seedDefaults} loading={seeding}>
              Load Defaults
            </Button>
          )}
          <Button onClick={() => { setForm(EMPTY_FORM()); setEditId(null); setShowForm(true) }}>
            <Plus size={15} /> Add Contact
          </Button>
        </div>
      </div>

      {/* Hotline strip */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium flex flex-wrap gap-4">
        <span>🚨 Quick Dial:</span>
        {[["Police", "100"], ["Fire", "101"], ["Ambulance", "108"], ["Women Helpline", "1091"]].map(([label, num]) => (
          <a key={num} href={`tel:${num}`} className="flex items-center gap-1 hover:underline font-bold">
            {label} <span className="font-mono">{num}</span>
          </a>
        ))}
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <Phone size={32} className="mx-auto mb-3 opacity-30" />
          <p className="mb-4">No contacts yet.</p>
          <Button onClick={seedDefaults} loading={seeding}>Load Default Contacts</Button>
        </div>
      )}

      {/* Contact groups */}
      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {contacts.filter(c => c.category === cat).map(c => (
              <div key={c.id} className="card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{c.name}</p>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => openEdit(c)} className="text-gray-400 hover:text-violet-600 p-1 rounded-md hover:bg-violet-50 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => setDeleteId(c.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-violet-600 font-mono font-bold text-sm hover:underline w-fit">
                  <ExternalLink size={11} />{c.phone}
                </a>
                {c.address && <p className="text-xs text-gray-500">📍 {c.address}</p>}
                {c.notes && <p className="text-xs text-gray-400 italic">{c.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Contact" : "Add Emergency Contact"}>
        <div className="space-y-4">
          <Select
            label="Category"
            value={form.category ?? "📋 Other"}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            options={CATEGORY_OPTS}
          />
          <Input label="Name *" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Phone *" value={form.phone ?? ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
          <Input label="Address" value={form.address ?? ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          <Input label="Notes" value={form.notes ?? ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>{editId ? "Update" : "Add Contact"}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Remove Contact"
        message="Remove this emergency contact? You can add it back anytime."
      />
    </div>
  )
}
