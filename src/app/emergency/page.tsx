"use client"

import { Phone, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"

const defaultContacts = [
  { category: "🏥 Medical", name: "Sterling Hospital Vadodara", phone: "+91 265 2970000", address: "Jetalpur Road, Vadodara" },
  { category: "🏥 Medical", name: "Baroda Medical College Hospital", phone: "+91 265 2413737", address: "Mandvi, Vadodara" },
  { category: "🚨 Emergency", name: "Police Control Room", phone: "100", address: "Vadodara" },
  { category: "🚨 Emergency", name: "Fire Brigade", phone: "101", address: "Vadodara" },
  { category: "🚑 Ambulance", name: "Ambulance (National)", phone: "108", address: "Gujarat" },
  { category: "⚡ Utilities", name: "Electrician — Wedding Venue", phone: "+91 99XXXXXXXX", address: "On-call, Wedding Venue" },
  { category: "⚡ Utilities", name: "Generator Backup Service", phone: "+91 98XXXXXXXX", address: "Vadodara" },
  { category: "🚗 Transport", name: "Shiv Travels (Fleet)", phone: "+91 98XXXXXXXX", address: "Vadodara" },
  { category: "👨‍👩‍👧 Family", name: "Suresh Kumar (Father — Groom)", phone: "+91 94XXXXXXXX", address: "Patna, Bihar" },
  { category: "👨‍👩‍👧 Family", name: "Mohan Verma (Father — Bride)", phone: "+91 96XXXXXXXX", address: "Patna, Bihar" },
  { category: "👨‍👩‍👧 Family", name: "Rahul Kumar (Pickup Coordinator)", phone: "+91 93XXXXXXXX", address: "Vadodara" },
  { category: "🏪 Vendor", name: "Pt. Ramakant Shastri (Priest)", phone: "+91 98XXXXXXXX", address: "Vadodara" },
  { category: "🏪 Vendor", name: "Banyan Paradise Resort — Front Desk", phone: "+91 265 XXXXXXX", address: "NH-8, Vadodara" },
]

type Contact = { category: string; name: string; phone: string; address: string }

export default function EmergencyPage() {
  const [extra, setExtra] = useState<Contact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Contact>>({})

  const all = [...defaultContacts, ...extra]
  const categories = Array.from(new Set(all.map(c => c.category)))

  const addContact = () => {
    if (form.name && form.phone) {
      setExtra(p => [...p, { category: form.category ?? "📋 Other", name: form.name!, phone: form.phone!, address: form.address ?? "" }])
    }
    setShowForm(false)
    setForm({})
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Phone size={20} className="text-red-600" /> Emergency Contacts</h1>
          <p className="text-sm text-gray-500">{all.length} contacts ready for wedding day</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={15} /> Add Contact</Button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
        🚨 Emergency Hotlines: Police 100 · Fire 101 · Ambulance 108 · Women Helpline 1091
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {all.filter(c => c.category === cat).map((c, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="font-semibold text-gray-900 mb-1">{c.name}</div>
                <a href={`tel:${c.phone}`} className="text-violet-600 font-mono font-bold text-sm hover:underline block">{c.phone}</a>
                {c.address && <div className="text-xs text-gray-500 mt-1">📍 {c.address}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Emergency Contact">
        <div className="space-y-4">
          <Input label="Category (e.g. 🏥 Medical)" value={form.category ?? ""} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          <Input label="Name *" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Phone *" value={form.phone ?? ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Address" value={form.address ?? ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={addContact}>Add Contact</Button>
        </div>
      </Modal>
    </div>
  )
}
