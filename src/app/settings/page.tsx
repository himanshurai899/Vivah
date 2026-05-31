"use client"

import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PageLoader } from "@/components/ui/Spinner"

export default function SettingsPage() {
  const [wedding, setWedding] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/wedding").then(r => r.json()).then(w => { setWedding(w); setForm({ ...w, date: w.date ? new Date(w.date).toISOString().split("T")[0] : "" }) }).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch("/api/wedding", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Settings size={20} className="text-violet-600" /> Wedding Settings</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Wedding Details</h2>
        <Input label="Wedding Title" value={form.name ?? ""} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
        <Input label="Groom Name" value={form.groomName ?? ""} onChange={e => setForm((p: any) => ({ ...p, groomName: e.target.value }))} />
        <Input label="Bride Name" value={form.brideName ?? ""} onChange={e => setForm((p: any) => ({ ...p, brideName: e.target.value }))} />
        <Input label="Wedding Date" type="date" value={form.date ?? ""} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))} />
        <Input label="Venue" value={form.venue ?? ""} onChange={e => setForm((p: any) => ({ ...p, venue: e.target.value }))} />
        <Input label="City" value={form.city ?? ""} onChange={e => setForm((p: any) => ({ ...p, city: e.target.value }))} />
        <Input label="State" value={form.state ?? ""} onChange={e => setForm((p: any) => ({ ...p, state: e.target.value }))} />
        <Button onClick={save} loading={saving} className="w-full">{saved ? "✅ Saved!" : "Save Settings"}</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Database</h2>
        <p className="text-sm text-gray-600">Re-seed the database to restore all default Bihari wedding functions, rituals, vendors, and templates.</p>
        <p className="text-xs text-orange-600 font-medium">⚠️ This will add default data but will not delete existing records.</p>
        <Button variant="outline" onClick={async () => { await fetch("/api/seed", { method: "POST" }); window.location.reload() }}>
          🌱 Re-seed Default Data
        </Button>
      </div>
    </div>
  )
}
