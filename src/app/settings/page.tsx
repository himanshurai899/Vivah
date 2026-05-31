"use client"

import { useEffect, useState } from "react"
import { Settings, Database, Trash2, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PageLoader } from "@/components/ui/Spinner"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToastContext } from "@/components/ui/Toast"

export default function SettingsPage() {
  const [wedding, setWedding] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const { toast } = useToastContext()

  useEffect(() => {
    fetch("/api/wedding")
      .then(r => r.json())
      .then(w => {
        setWedding(w)
        setForm({ ...w, date: w.date ? new Date(w.date).toISOString().split("T")[0] : "" })
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await fetch("/api/wedding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      toast({ message: "Wedding settings saved", variant: "success" })
    } catch {
      toast({ message: "Failed to save settings", variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleLoadDummyData = async () => {
    setSeeding(true)
    try {
      const res = await fetch("/api/seed", { method: "POST" })
      if (!res.ok) throw new Error("Seed failed")
      toast({ message: "Dummy data loaded — refresh to see changes", variant: "success" })
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      toast({ message: "Failed to load dummy data", variant: "error" })
    } finally {
      setSeeding(false)
    }
  }

  const handleWipe = async () => {
    setWiping(true)
    try {
      const res = await fetch("/api/wipe", { method: "POST" })
      if (!res.ok) throw new Error("Wipe failed")
      toast({ message: "All data wiped successfully", variant: "success" })
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      toast({ message: "Failed to wipe data", variant: "error" })
    } finally {
      setWiping(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings size={22} aria-hidden /> Wedding Settings
        </h1>
        <p className="page-subtitle">Manage wedding details and database</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left: Wedding Details (spans 2 cols) ──────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: "var(--border)" }}>
              <CheckCircle2 size={16} style={{ color: "var(--purple)" }} />
              <h2 className="font-semibold" style={{ color: "var(--ink)", fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
                Wedding Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Wedding Title"
                  value={form.name ?? ""}
                  onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <Input
                label="Groom Name"
                value={form.groomName ?? ""}
                onChange={e => setForm((p: any) => ({ ...p, groomName: e.target.value }))}
              />
              <Input
                label="Bride Name"
                value={form.brideName ?? ""}
                onChange={e => setForm((p: any) => ({ ...p, brideName: e.target.value }))}
              />
              <Input
                label="Wedding Date"
                type="date"
                value={form.date ?? ""}
                onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))}
              />
              <Input
                label="City"
                value={form.city ?? ""}
                onChange={e => setForm((p: any) => ({ ...p, city: e.target.value }))}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Venue"
                  value={form.venue ?? ""}
                  onChange={e => setForm((p: any) => ({ ...p, venue: e.target.value }))}
                />
              </div>
              <Input
                label="State"
                value={form.state ?? ""}
                onChange={e => setForm((p: any) => ({ ...p, state: e.target.value }))}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button onClick={save} loading={saving} className="min-w-[140px]">
                {saved ? <><CheckCircle2 size={15} /> Saved!</> : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right: Data Management ─────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Load Dummy Data */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: "var(--border)" }}>
              <Database size={15} style={{ color: "var(--purple)" }} />
              <h2 className="font-semibold" style={{ color: "var(--ink)", fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
                Database
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Load sample Bihari wedding data — guests, vendors, rituals, tasks, budget categories, and more.
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--gold)" }}>
              ✦ Existing records are preserved when loading dummy data.
            </p>
            <Button
              variant="outline"
              onClick={handleLoadDummyData}
              loading={seeding}
              className="w-full"
            >
              <Sparkles size={14} />
              {seeding ? "Loading…" : "Load Dummy Data"}
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="card p-5 space-y-3" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.02)" }}>
            <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
              <AlertTriangle size={15} className="text-red-500" />
              <h2 className="font-semibold text-red-600" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
                Danger Zone
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Permanently delete all guests, vendors, tasks, rituals, expenses, and other records. Wedding details are kept.
            </p>
            <p className="text-xs font-medium text-red-500">
              ⚠ This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setConfirmWipe(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              <Trash2 size={14} />
              Wipe All Data
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        onConfirm={handleWipe}
        title="Wipe All Data"
        message="This will permanently delete all guests, vendors, tasks, rituals, finance records, travel, accommodation, and more. Wedding details will be preserved. This cannot be undone."
        loading={wiping}
      />
    </div>
  )
}
