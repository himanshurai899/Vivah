"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { QrCode, Plus, CheckCircle, Printer, X, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { PageLoader } from "@/components/ui/Spinner"
import { formatDateTime } from "@/lib/utils/date"
import QRCode from "qrcode"
import { buildQrPayload, calculateCheckInStats } from "@/lib/utils/checkin"

type CheckIn = {
  id: string
  guestName: string
  familyName?: string
  eventName: string
  status: string
  arrivalTime?: string
  qrCode?: string
  notes?: string
}
type Event = { id: string; name: string }

function QRModal({ record, onClose }: { record: CheckIn; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const payload = buildQrPayload(record)
    QRCode.toCanvas(canvasRef.current, payload, { width: 240, margin: 2, color: { dark: "#0F0612", light: "#FAFAF8" } })
  }, [record])

  const handlePrint = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html><head><title>QR — ${record.guestName}</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#fff; }
        .label { text-align:center; padding:24px; border:2px solid #7C3AED; border-radius:12px; }
        h2 { margin:12px 0 4px; font-size:18px; color:#0F0612; }
        p  { margin:0; color:#555; font-size:13px; }
        img { display:block; margin:0 auto; }
        @media print { body { margin:0; } }
      </style></head>
      <body>
        <div class="label">
          <img src="${canvas.toDataURL()}" width="200" height="200" />
          <h2>${record.guestName}</h2>
          <p>${record.familyName ?? ""}</p>
          <p style="margin-top:6px;color:#7C3AED;font-weight:600">${record.eventName}</p>
        </div>
        <script>window.onload=()=>window.print()</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <Modal open onClose={onClose} title={`QR Code — ${record.guestName}`}>
      <div className="flex flex-col items-center gap-4 py-2">
        <canvas ref={canvasRef} className="rounded-xl border border-gray-100 shadow" />
        <div className="text-center">
          <p className="font-semibold text-gray-900">{record.guestName}</p>
          {record.familyName && <p className="text-sm text-gray-500">{record.familyName} family</p>}
          <p className="text-sm text-violet-600 font-medium mt-1">{record.eventName}</p>
        </div>
        <div className="flex gap-3 mt-1">
          <Button variant="secondary" onClick={onClose}><X size={14} /> Close</Button>
          <Button onClick={handlePrint}><Printer size={14} /> Print Label</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function CheckInPage() {
  const [records, setRecords] = useState<CheckIn[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [qrRecord, setQrRecord] = useState<CheckIn | null>(null)
  const [form, setForm] = useState<Partial<CheckIn & { eventId: string }>>({ status: "PENDING" })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    const p = new URLSearchParams()
    if (filterEvent) p.set("eventId", filterEvent)
    if (filterStatus) p.set("status", filterStatus)
    Promise.all([
      fetch(`/api/checkin?${p}`).then(r => r.json()),
      fetch("/api/events").then(r => r.json()),
    ]).then(([ci, ev]) => {
      setRecords(Array.isArray(ci) ? ci : [])
      setEvents(Array.isArray(ev) ? ev : [])
    }).finally(() => setLoading(false))
  }, [filterEvent, filterStatus])

  useEffect(() => { load() }, [load])

  const checkinNow = async (id: string) => {
    await fetch(`/api/checkin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CHECKED_IN", arrivalTime: new Date().toISOString() }),
    })
    load()
  }

  const save = async () => {
    setSaving(true)
    const selectedEvent = events.find(e => e.id === form.eventId)
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventName: selectedEvent?.name ?? form.eventId ?? "" }),
    })
    setShowForm(false)
    load()
    setSaving(false)
  }

  const printAll = () => {
    const pending = records.filter(r => r.status === "PENDING")
    if (!pending.length) return
    const win = window.open("", "_blank")
    if (!win) return

    const labels = pending.map(r => ({ record: r, payload: buildQrPayload(r) }))

    win.document.write(`
      <html><head><title>QR Labels — All Pending</title>
      <style>
        body { font-family: sans-serif; margin: 24px; }
        .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .label { text-align:center; padding:16px; border:1.5px solid #7C3AED; border-radius:8px; }
        .label h3 { margin:8px 0 2px; font-size:14px; }
        .label p  { margin:0; font-size:11px; color:#555; }
        .label .evt { color:#7C3AED; font-weight:600; }
        canvas { display:block; margin:0 auto; }
        @media print { body { margin:0; } }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      </head><body>
      <div class="grid" id="grid"></div>
      <script>
        const labels = ${JSON.stringify(labels)};
        const grid = document.getElementById('grid');
        labels.forEach(({ record, payload }) => {
          const div = document.createElement('div');
          div.className = 'label';
          const qrDiv = document.createElement('div');
          div.appendChild(qrDiv);
          div.innerHTML += '<h3>' + record.guestName + '</h3><p>' + (record.familyName ?? '') + '</p><p class="evt">' + record.eventName + '</p>';
          grid.appendChild(div);
          new QRCode(qrDiv, { text: payload, width: 128, height: 128 });
        });
        setTimeout(() => window.print(), 1200);
      </script>
      </body></html>
    `)
    win.document.close()
  }

  const totals = calculateCheckInStats(records)

  const eventOpts = events.map(e => ({ value: e.id, label: e.name }))
  const statusOpts = [
    { value: "PENDING", label: "Pending" },
    { value: "CHECKED_IN", label: "Checked In" },
    { value: "ABSENT", label: "Absent" },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <QrCode size={24} className="text-violet-600" /> Guest Check-In
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totals.total} records · {totals.checkedIn} checked in · {totals.pending} pending
            {totals.absent > 0 && ` · ${totals.absent} absent`}
          </p>
        </div>
        <div className="flex gap-2">
          {totals.pending > 0 && (
            <Button variant="secondary" onClick={printAll}>
              <Printer size={15} /> Print All QRs
            </Button>
          )}
          <Button onClick={() => { setForm({ status: "PENDING" }); setShowForm(true) }}>
            <Plus size={15} /> Add Check-In
          </Button>
        </div>
      </div>

      {/* Progress */}
      {totals.total > 0 && (
        <div className="card p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Check-In Progress</span>
            <span className="text-green-600 font-bold">
              {Math.round((totals.checkedIn / totals.total) * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="progress-bar h-full bg-green-500 rounded-full"
              style={{ "--progress": `${(totals.checkedIn / totals.total) * 100}%` } as React.CSSProperties}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>{totals.checkedIn} checked in</span>
            <span>{totals.pending} pending</span>
          </div>
        </div>
      )}

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: totals.total, color: "text-gray-700" },
          { label: "Checked In", value: totals.checkedIn, color: "text-green-600" },
          { label: "Pending", value: totals.pending, color: "text-amber-600" },
          { label: "Absent", value: totals.absent, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="card px-4 py-2 flex items-center gap-2">
            <span className={`stat-number text-xl ${s.color}`}>{s.value}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filterEvent}
          onChange={e => setFilterEvent(e.target.value)}
          options={eventOpts}
          placeholder="All Events"
          className="w-48"
        />
        <Select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          options={statusOpts}
          placeholder="All Statuses"
          className="w-40"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Guest", "Family", "Event", "Status", "Arrival Time", "QR", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <ScanLine size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No check-in records yet.</p>
                    <p className="text-xs mt-1">Add guests and generate QR codes for the wedding day.</p>
                  </td>
                </tr>
              ) : records.map(r => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${r.status === "CHECKED_IN" ? "bg-green-50/60" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{r.guestName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.familyName ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.eventName}</td>
                  <td className="px-4 py-3">
                    <Badge
                      color={r.status === "CHECKED_IN" ? "green" : r.status === "ABSENT" ? "red" : "yellow"}
                    >
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.arrivalTime ? formatDateTime(r.arrivalTime) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setQrRecord(r)}
                      className="flex items-center gap-1 text-xs text-violet-600 hover:underline font-medium"
                    >
                      <QrCode size={13} /> View QR
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => checkinNow(r.id)}
                        className="flex items-center gap-1 text-xs text-green-600 hover:underline font-medium"
                      >
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

      {/* Add form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Check-In Record">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Guest Name *"
            value={form.guestName ?? ""}
            onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
          />
          <Input
            label="Family Name"
            value={form.familyName ?? ""}
            onChange={e => setForm(p => ({ ...p, familyName: e.target.value }))}
          />
          <Select
            label="Event"
            value={(form as CheckIn & { eventId: string }).eventId ?? ""}
            onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))}
            options={eventOpts}
            placeholder="Select event"
          />
          <Select
            label="Status"
            value={form.status ?? "PENDING"}
            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            options={statusOpts}
          />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </div>
      </Modal>

      {/* QR modal */}
      {qrRecord && <QRModal record={qrRecord} onClose={() => setQrRecord(null)} />}
    </div>
  )
}
