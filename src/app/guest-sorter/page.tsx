"use client"

import {
  useState, useCallback, useRef, useMemo, useEffect,
  type DragEvent,
} from "react"
import {
  Upload, Users, CheckCheck, X, Plus, Info,
  CalendarDays, Loader2, RefreshCw, Star,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { useToastContext } from "@/components/ui/Toast"
import { cn } from "@/lib/utils/cn"

// ─── Types ─────────────────────────────────────────────────────────────────

interface SorterContact {
  id: number
  name: string
  phones: string[]
}

interface WeddingEvent {
  id: string
  name: string
  eventType: string
  date?: string | null
  isMainFunction?: boolean
}

interface ExistingGuest {
  mobile?: string | null
  name: string
  familyName: string
}

type SideChoice = "GROOM" | "BRIDE"

const LS_KEY = "vivah_sorter_contacts"

const EVENT_COLORS = [
  { text: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/30",  border: "border-purple-300 dark:border-purple-700", active: "bg-purple-600"  },
  { text: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-900/30",  border: "border-orange-300 dark:border-orange-700", active: "bg-orange-600"  },
  { text: "text-green-700 dark:text-green-300",   bg: "bg-green-50 dark:bg-green-900/30",    border: "border-green-300 dark:border-green-700",   active: "bg-green-600"   },
  { text: "text-blue-700 dark:text-blue-300",     bg: "bg-blue-50 dark:bg-blue-900/30",      border: "border-blue-300 dark:border-blue-700",     active: "bg-blue-600"    },
  { text: "text-rose-700 dark:text-rose-300",     bg: "bg-rose-50 dark:bg-rose-900/30",      border: "border-rose-300 dark:border-rose-700",     active: "bg-rose-600"    },
  { text: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-900/30",    border: "border-amber-300 dark:border-amber-700",   active: "bg-amber-600"   },
  { text: "text-teal-700 dark:text-teal-300",     bg: "bg-teal-50 dark:bg-teal-900/30",      border: "border-teal-300 dark:border-teal-700",     active: "bg-teal-600"    },
  { text: "text-pink-700 dark:text-pink-300",     bg: "bg-pink-50 dark:bg-pink-900/30",      border: "border-pink-300 dark:border-pink-700",     active: "bg-pink-600"    },
]

function eventColor(idx: number) {
  return EVENT_COLORS[idx % EVENT_COLORS.length]
}

// ─── Helpers ───────────────────────────────────────────────────────────────

let _nextId = 1
function newId() { return _nextId++ }

function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "")
  return d.length > 10 ? d.slice(-10) : d
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function splitName(full: string): { given: string; family: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { given: "Unknown", family: "Unknown" }
  if (parts.length === 1) return { given: parts[0], family: parts[0] }
  return { given: parts.slice(0, -1).join(" "), family: parts[parts.length - 1] }
}

// ─── Parsers ───────────────────────────────────────────────────────────────

function parseVCF(text: string): SorterContact[] {
  const out: SorterContact[] = []
  for (const block of text.split(/BEGIN:VCARD/i).slice(1)) {
    let name = ""
    const phones: string[] = []
    for (const raw of block.split("\n")) {
      const line = raw.replace(/\r$/, "").trim()
      if (/^FN:/i.test(line)) name = line.replace(/^FN:/i, "").trim()
      else if (/^N:/i.test(line) && !name) {
        const p = line.replace(/^N:/i, "").split(";")
        name = [p[1], p[0]].filter(Boolean).join(" ").trim()
      } else if (/^TEL/i.test(line)) {
        const ph = line.replace(/^TEL[^:]*:/i, "").replace(/\s+/g, "").trim()
        if (ph && !phones.includes(ph)) phones.push(ph)
      }
    }
    if (name || phones.length) out.push({ id: newId(), name: name || phones[0] || "", phones })
  }
  return out
}

function splitCSVLine(line: string): string[] {
  const cols: string[] = []; let cur = ""; let inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = "" }
    else cur += ch
  }
  cols.push(cur.trim())
  return cols.map(c => c.replace(/^"|"$/g, "").trim())
}

function findIdx(hdrs: string[], candidates: string[]): number {
  for (const c of candidates) { const i = hdrs.indexOf(c); if (i >= 0) return i }
  return -1
}

function parseCSV(text: string): SorterContact[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const hdrsRaw = splitCSVLine(lines[0])
  const hdrs = hdrsRaw.map(h => h.toLowerCase())
  const isGoogle = hdrs.includes("first name") || hdrs.some(h => /phone.*value/.test(h))
  if (isGoogle) {
    const fnIdx  = findIdx(hdrs, ["first name", "given name"])
    const lnIdx  = findIdx(hdrs, ["last name", "family name", "surname"])
    const nmIdx  = findIdx(hdrs, ["name", "full name"])
    const phIdxs = hdrs.map((h, i) => ({ h, i })).filter(({ h }) => /phone.*value/.test(h)).map(({ i }) => i)
    return lines.slice(1).flatMap(line => {
      const c = splitCSVLine(line)
      const name = (nmIdx >= 0 ? c[nmIdx] : [c[fnIdx] || "", c[lnIdx] || ""].filter(Boolean).join(" ")).trim()
      const phones = phIdxs.map(i => (c[i] || "").replace(/\s+/g, "")).filter(Boolean)
      return (name || phones.length) ? [{ id: newId(), name, phones }] : []
    })
  }
  const nmIdx  = findIdx(hdrs, ["name", "full name", "fullname", "contact name", "contact", "person"])
  const phIdxs = hdrs.map((h, i) => ({ h, i })).filter(({ h }) => h.includes("phone") || h.includes("mobile") || h.includes("tel")).map(({ i }) => i)
  return lines.slice(1).flatMap(line => {
    const c = splitCSVLine(line)
    const name = ((nmIdx >= 0 ? c[nmIdx] : c[0]) || "").trim()
    const phones = phIdxs.map(i => (c[i] || "").replace(/\s+/g, "")).filter(Boolean)
    return (name || phones.length) ? [{ id: newId(), name, phones }] : []
  })
}

function parseJSON(text: string): SorterContact[] {
  try {
    let data = JSON.parse(text)
    if (!Array.isArray(data)) data = data.contacts || data.data || data.guests || []
    if (!Array.isArray(data)) return []
    return (data as Record<string, unknown>[]).map(item => {
      const name = String(item.name || item.fullName || item.full_name || item.Name || "").trim()
      const phones: string[] = []
      const add = (v: unknown) => { const s = String(v ?? "").replace(/\s+/g, "").trim(); if (s && !phones.includes(s)) phones.push(s) }
      if (item.phone) add(item.phone)
      if (item.mobile) add(item.mobile)
      if (Array.isArray(item.phones)) item.phones.forEach(add)
      return { id: newId(), name, phones }
    }).filter(c => c.name || c.phones.length)
  } catch { return [] }
}

async function parseExcel(buffer: ArrayBuffer): Promise<SorterContact[]> {
  const XLSX = (await import("xlsx")).default
  const wb = XLSX.read(new Uint8Array(buffer), { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
  return rows.map(row => {
    const keys = Object.keys(row)
    const nameKey = keys.find(k => /^(name|full.?name|contact.*name|person)$/i.test(k)) || keys[0]
    const phones = keys.filter(k => /phone|mobile|tel|number/i.test(k))
      .map(k => String(row[k]).replace(/\s+/g, "").trim()).filter(Boolean)
    return { id: newId(), name: String(row[nameKey] || "").trim(), phones }
  }).filter(c => c.name || c.phones.length)
}

// ─── Deduplication ─────────────────────────────────────────────────────────

function mergeIntoList(existing: SorterContact[], incoming: SorterContact[]): SorterContact[] {
  const phoneIdx = new Map<string, number>()
  const nameIdx  = new Map<string, number>()
  const result   = [...existing]
  existing.forEach((c, i) => {
    c.phones.forEach(p => { const n = normalizePhone(p); if (n.length >= 7) phoneIdx.set(n, i) })
    const nn = c.name.trim().toLowerCase(); if (nn.length > 2) nameIdx.set(nn, i)
  })
  for (const nc of incoming) {
    const ncNorms = nc.phones.map(normalizePhone).filter(p => p.length >= 7)
    const ncName  = nc.name.trim().toLowerCase()
    let matchIdx: number | undefined
    for (const norm of ncNorms) { if (phoneIdx.has(norm)) { matchIdx = phoneIdx.get(norm); break } }
    if (matchIdx == null && ncName.length > 2) matchIdx = nameIdx.get(ncName)
    if (matchIdx != null) {
      const master = result[matchIdx]
      const masterNorms = master.phones.map(normalizePhone)
      nc.phones.forEach(p => {
        const n = normalizePhone(p)
        if (n.length >= 7 && !masterNorms.includes(n)) { master.phones.push(p); masterNorms.push(n); phoneIdx.set(n, matchIdx as number) }
      })
      if (nc.name.trim().length > master.name.trim().length) {
        nameIdx.delete(master.name.trim().toLowerCase()); master.name = nc.name.trim(); nameIdx.set(ncName, matchIdx as number)
      }
    } else {
      const contact = { ...nc, id: newId() }
      const idx = result.length; result.push(contact)
      ncNorms.forEach(n => phoneIdx.set(n, idx))
      if (ncName.length > 2) nameIdx.set(ncName, idx)
    }
  }
  return result
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ContactAvatar({ name }: { name: string }) {
  return (
    <div
      className="sorter-avatar w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold select-none"
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function GuestSorterPage() {
  const { toast } = useToastContext()

  const [contacts, setContactsState] = useState<SorterContact[]>([])
  const [hydrated, setHydrated]      = useState(false)
  const [selectedIds, setSelected]   = useState<Set<number>>(new Set())
  const [tags, setTags]              = useState<Record<number, string[]>>({})
  const [search, setSearch]          = useState("")
  const [visibleCount, setVisible]   = useState(100)

  const [events, setEvents]           = useState<WeddingEvent[]>([])
  const [eventsLoading, setEvLoading] = useState(true)

  const [existingSigs, setExistingSigs] = useState<Set<string>>(new Set())
  const [guestDbCount, setGuestDbCount] = useState<number | null>(null)

  const dragId   = useRef<number | null>(null)
  const dragLane = useRef<"import" | "selected" | null>(null)
  const [zoneActive, setZoneActive]     = useState(false)
  const [importOver, setImportOver]     = useState(false)
  const [selectedOver, setSelectedOver] = useState(false)

  const [pushOpen, setPushOpen] = useState(false)
  const [pushSide, setPushSide] = useState<SideChoice>("GROOM")
  const [pushing, setPushing]   = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Persist contacts ──────────────────────────────────────────────────────
  const setContacts = useCallback((updater: SorterContact[] | ((prev: SorterContact[]) => SorterContact[])) => {
    setContactsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* storage full */ }
      return next
    })
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed: SorterContact[] = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) {
          const maxId = parsed.reduce((m, c) => Math.max(m, c.id), 0)
          _nextId = Math.max(_nextId, maxId + 1)
          setContactsState(parsed)
        }
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // ── Fetch events ──────────────────────────────────────────────────────────
  const fetchEvents = useCallback(() => {
    setEvLoading(true)
    fetch("/api/events")
      .then(r => r.json())
      .then((data: WeddingEvent[]) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setEvLoading(false))
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // ── Guest count (chip) — lightweight count endpoint ───────────────────────
  const refreshGuestCount = useCallback(() => {
    fetch("/api/guests/count")
      .then(r => r.json())
      .then((data: { count: number }) => { if (typeof data.count === "number") setGuestDbCount(data.count) })
      .catch(() => { /* non-fatal */ })
  }, [])

  // ── Existing sigs (left-lane filter) — full list on mount only ────────────
  const refreshExistingSigs = useCallback(() => {
    fetch("/api/guests")
      .then(r => r.json())
      .then((data: ExistingGuest[]) => {
        if (!Array.isArray(data)) return
        const sigs = new Set<string>()
        data.forEach(g => {
          if (g.mobile) { const n = normalizePhone(g.mobile); if (n.length >= 7) sigs.add(`p:${n}`) }
          const name = `${g.name} ${g.familyName}`.trim().toLowerCase()
          if (name.length > 2) sigs.add(`n:${name}`)
        })
        setExistingSigs(sigs)
      })
      .catch(() => { /* non-fatal */ })
  }, [])

  useEffect(() => {
    refreshGuestCount()
    refreshExistingSigs()
  }, [refreshGuestCount, refreshExistingSigs])

  // ── Derived ──────────────────────────────────────────────────────────────
  const filteredImport = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts.filter(c => {
      if (selectedIds.has(c.id)) return false
      const alreadyAdded =
        c.phones.some(p => { const n = normalizePhone(p); return n.length >= 7 && existingSigs.has(`p:${n}`) }) ||
        existingSigs.has(`n:${c.name.trim().toLowerCase()}`)
      if (alreadyAdded) return false
      if (!q) return true
      return c.name.toLowerCase().includes(q) || c.phones.some(p => p.includes(q))
    })
  }, [contacts, selectedIds, search, existingSigs])

  const selectedContacts = useMemo(() =>
    Array.from(selectedIds).map(id => contacts.find(c => c.id === id)).filter(Boolean) as SorterContact[]
  , [contacts, selectedIds])

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    let untagged = 0
    selectedIds.forEach(id => {
      const evIds = tags[id] ?? []
      if (!evIds.length) untagged++
      else evIds.forEach(eid => { counts[eid] = (counts[eid] ?? 0) + 1 })
    })
    return { perEvent: counts, untagged }
  }, [selectedIds, tags])

  const taggedCount = useMemo(() =>
    selectedContacts.filter(c => (tags[c.id] ?? []).length > 0).length
  , [selectedContacts, tags])

  // ── Import ────────────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return
    let totalNew = 0
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      let parsed: SorterContact[] = []
      if (ext === "vcf") parsed = parseVCF(await file.text())
      else if (ext === "json") parsed = parseJSON(await file.text())
      else if (ext === "csv") parsed = parseCSV(await file.text())
      else if (ext === "xlsx" || ext === "xls") parsed = await parseExcel(await file.arrayBuffer())
      else parsed = parseCSV(await file.text())
      setContacts(prev => {
        const next = mergeIntoList(prev, parsed)
        totalNew += next.length - prev.length
        return next
      })
    }
    setVisible(100)
    toast({ message: `Imported ${totalNew} new contacts`, variant: "success" })
  }, [toast, setContacts])

  // ── Drag/drop ─────────────────────────────────────────────────────────────
  const onCardDragStart = (id: number, lane: "import" | "selected") => (e: DragEvent) => {
    dragId.current = id; dragLane.current = lane
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(id))
  }
  const onDropSelected = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setSelectedOver(false)
    if (dragId.current !== null && dragLane.current === "import")
      setSelected(prev => new Set([...prev, dragId.current!]))
    dragId.current = null
  }
  const onDropImport = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setImportOver(false)
    const id = dragId.current
    if (id !== null && dragLane.current === "selected") {
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
      setTags(prev => { const t = { ...prev }; delete t[id]; return t })
    }
    dragId.current = null
  }

  // ── Tag toggle ────────────────────────────────────────────────────────────
  const toggleTag = (contactId: number, eventId: string) => {
    setTags(prev => {
      const cur = prev[contactId] ?? []
      const next = cur.includes(eventId) ? cur.filter(e => e !== eventId) : [...cur, eventId]
      if (!next.length) { const t = { ...prev }; delete t[contactId]; return t }
      return { ...prev, [contactId]: next }
    })
  }

  // ── Push to guest list ────────────────────────────────────────────────────
  const handlePushToGuests = async () => {
    const toSend = selectedContacts.filter(c => (tags[c.id] ?? []).length > 0)
    if (!toSend.length) {
      toast({ message: "Tag contacts with an event before adding to guest list", variant: "error" })
      return
    }
    setPushing(true)
    try {
      const payload = toSend.map(c => {
        const { given, family } = splitName(c.name)
        const eventNames = (tags[c.id] ?? [])
          .map(eid => events.find(ev => ev.id === eid)?.name ?? eid)
          .join(", ")
        return { name: given, familyName: family, mobile: c.phones[0] || undefined, side: pushSide, notes: eventNames }
      })
      const res = await fetch("/api/guests/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to add guests")

      const pushedIds = new Set(toSend.map(c => c.id))
      setContacts(prev => prev.filter(c => !pushedIds.has(c.id)))
      setSelected(prev => { const s = new Set(prev); pushedIds.forEach(id => s.delete(id)); return s })
      setTags(prev => { const t = { ...prev }; pushedIds.forEach(id => delete t[id]); return t })

      toast({ message: data.message || `Added ${data.created} guests`, variant: "success" })
      // Re-fetch the authoritative count and update sigs
      refreshGuestCount()
      refreshExistingSigs()
      setPushOpen(false)
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Failed", variant: "error" })
    } finally {
      setPushing(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-vivah-purple" />
      </div>
    )
  }

  const mainEvents = events.filter(ev => ev.isMainFunction)

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 lg:p-6 min-h-screen bg-vivah-ivory">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Guest Sorter</h1>
          <p className="text-sm mt-0.5 text-ink-dim">
            Import contacts · tag by event · push to guest list
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {contacts.length > 0 && (
            <button
              type="button"
              className="text-xs text-red-500 hover:underline cursor-pointer"
              onClick={() => {
                if (!confirm("Clear all imported contacts? This cannot be undone.")) return
                setContacts([])
                setSelected(new Set())
                setTags({})
              }}
            >
              Clear all contacts
            </button>
          )}
          {selectedIds.size > 0 && (
            <Button variant="outline" size="sm" onClick={() => { setSelected(new Set()); setTags({}) }}>
              <X size={13} /> Clear selection
            </Button>
          )}
          <Button size="sm" onClick={() => setPushOpen(true)} disabled={taggedCount === 0}>
            <Users size={14} />
            Add to Guest List{taggedCount > 0 ? ` (${taggedCount})` : ""}
          </Button>
        </div>
      </div>

      {/* ── Stats chips ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Contacts",     value: contacts.length,              cls: "" },
          { label: "Selected",     value: selectedIds.size,             cls: "text-purple-600 dark:text-purple-400" },
          ...(guestDbCount !== null ? [{ label: "In guest list", value: guestDbCount, cls: "text-green-600 dark:text-green-400" }] : []),
          ...mainEvents.map((ev, i) => ({
            label: ev.name,
            value: tagCounts.perEvent[ev.id] ?? 0,
            cls: eventColor(i).text,
          })),
          ...(tagCounts.untagged ? [{ label: "Untagged", value: tagCounts.untagged, cls: "text-amber-600 dark:text-amber-400" }] : []),
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-2 px-3 py-1.5 rounded-lg">
            <span className={cn("stat-number text-lg leading-none", s.cls)}>{s.value.toLocaleString("en-IN")}</span>
            <span className="text-xs text-ink-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── No main functions warning ─────────────────────────────────────── */}
      {!eventsLoading && mainEvents.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
          <CalendarDays size={15} className="shrink-0" />
          <span>
            No main functions found. Go to{" "}
            <a href="/functions" className="underline font-semibold">Functions</a>{" "}
            and mark events as main functions — they will appear as tags here.
          </span>
          <button type="button" onClick={fetchEvents} className="ml-auto cursor-pointer shrink-0" aria-label="Refresh events">
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* ── Import zone ──────────────────────────────────────────────────── */}
      <div
        onDragOver={e => { e.preventDefault(); setZoneActive(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setZoneActive(false) }}
        onDrop={e => { e.preventDefault(); setZoneActive(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "card rounded-xl border-2 border-dashed p-5 cursor-pointer transition-colors duration-150 select-none",
          zoneActive ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-[var(--border)]"
        )}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Upload size={22} />
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold text-sm text-vivah-ink">
              Drop contact files here or click to browse
              {contacts.length > 0 && (
                <span className="ml-2 text-xs font-normal text-ink-hint">
                  ({contacts.length.toLocaleString("en-IN")} saved · merge-safe)
                </span>
              )}
            </p>
            <p className="text-xs mt-0.5 text-ink-muted">
              VCF · JSON · CSV · Excel (.xlsx) · Google Contacts CSV
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
            <Plus size={13} /> Browse
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vcf,.json,.csv,.xlsx,.xls"
          multiple
          className="sr-only"
          onChange={e => { handleFiles(e.target.files); e.target.value = "" }}
          aria-label="Select contact files"
        />
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      {contacts.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="search"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisible(100) }}
              placeholder="Search by name or number…"
              className="w-full h-9 pl-9 pr-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-[var(--surface)] border-[var(--border)] text-vivah-ink"
              aria-label="Search contacts"
            />
            <svg className="absolute left-2.5 top-2.5 opacity-40 pointer-events-none text-vivah-ink" width="15" height="15"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span className="text-xs text-ink-muted">
            {selectedIds.size > 0 && `${selectedIds.size.toLocaleString("en-IN")} selected · `}
            {filteredImport.length.toLocaleString("en-IN")} available
          </span>
        </div>
      )}

      {/* ── Board ────────────────────────────────────────────────────────── */}
      {contacts.length === 0 ? (
        <div className="card rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <Users size={40} className="text-vivah-purple opacity-25" />
          <p className="font-semibold text-ink-muted">Import contacts to get started</p>
          <p className="text-sm text-ink-faint">Drop a file above or click Browse</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── Import lane ──────────────────────────────────────────────── */}
          <section
            className={cn("card rounded-xl flex flex-col overflow-hidden sorter-lane", importOver && "ring-2 ring-purple-400")}
            onDragOver={e => { e.preventDefault(); setImportOver(true) }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setImportOver(false) }}
            onDrop={onDropImport}
            aria-label="Available contacts"
          >
            <div className="sorter-import-hdr flex items-center gap-2 px-4 py-3 border-b shrink-0">
              <h2 className="font-semibold text-sm flex-1 flex items-center gap-1.5 text-vivah-ink">
                <Users size={14} className="opacity-50" aria-hidden="true" />
                Contacts
                <span className="sorter-badge ml-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full">
                  {filteredImport.length.toLocaleString("en-IN")}
                </span>
              </h2>
              <span className="text-[11px] text-ink-hint">Click or drag →</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {filteredImport.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-ink-faint">
                  <Users size={28} />
                  <p className="text-sm font-medium">All contacts selected</p>
                </div>
              ) : (
                filteredImport.slice(0, visibleCount).map(c => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={onCardDragStart(c.id, "import")}
                    onClick={() => setSelected(prev => new Set([...prev, c.id]))}
                    className="sorter-contact-card flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all duration-150 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm hover:-translate-y-px active:translate-y-0"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(prev => new Set([...prev, c.id])) }}}
                    aria-label={`${c.name}${c.phones[0] ? ", " + c.phones[0] : ""} — click to select`}
                  >
                    <ContactAvatar name={c.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-vivah-ink">{c.name || <em>No name</em>}</p>
                      <p className="text-xs truncate text-ink-sub">
                        {c.phones[0]}{c.phones[1] ? " · " + c.phones[1] : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer — load more + select all, outside the scrollable area */}
            <div className="px-3 py-2 border-t border-[var(--border)] shrink-0 flex flex-col gap-1">
              {filteredImport.length > visibleCount && (
                <button
                  type="button"
                  className="w-full text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
                  onClick={() => setVisible(v => v + 100)}
                >
                  Load {Math.min(100, filteredImport.length - visibleCount).toLocaleString("en-IN")} more
                  ({(filteredImport.length - visibleCount).toLocaleString("en-IN")} remaining)
                </button>
              )}
              {filteredImport.length > 0 && (
                <button
                  type="button"
                  className="w-full text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
                  onClick={() => setSelected(prev => new Set([...prev, ...filteredImport.slice(0, visibleCount).map(c => c.id)]))}
                >
                  Select all {Math.min(filteredImport.length, visibleCount).toLocaleString("en-IN")} visible
                </button>
              )}
            </div>
          </section>

          {/* ── Selected lane ────────────────────────────────────────────── */}
          <section
            className={cn("card rounded-xl flex flex-col overflow-hidden sorter-lane bg-[var(--surface-2)]", selectedOver && "ring-2 ring-purple-400")}
            onDragOver={e => { e.preventDefault(); setSelectedOver(true) }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSelectedOver(false) }}
            onDrop={onDropSelected}
            aria-label="Selected guests"
          >
            <div className="sorter-sel-hdr flex items-center gap-2 px-4 py-3 border-b shrink-0">
              <h2 className="font-semibold text-sm flex-1 flex items-center gap-1.5 text-vivah-ink">
                <CheckCheck size={14} className="opacity-60" aria-hidden="true" />
                Selected Guests
                <span className="ml-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-600 text-white">
                  {selectedIds.size.toLocaleString("en-IN")}
                </span>
              </h2>
              <span className="text-[11px] text-ink-hint">← Drag to deselect</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              {selectedContacts.length === 0 ? (
                <div className="sorter-empty-sel flex flex-col items-center justify-center gap-2 py-10 text-center border-2 border-dashed rounded-lg m-2 text-ink-hint">
                  <CheckCheck size={28} />
                  <p className="text-sm font-medium">Drop contacts here</p>
                  <p className="text-xs">or click them in the Contacts lane</p>
                </div>
              ) : selectedContacts.map(c => {
                const cTags = tags[c.id] ?? []
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={onCardDragStart(c.id, "selected")}
                    className="sorter-sel-card rounded-lg border px-3 pt-2 pb-2 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <ContactAvatar name={c.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-vivah-ink">{c.name}</p>
                        <p className="text-xs truncate text-ink-sub">
                          {c.phones[0]}{c.phones[1] ? " · " + c.phones[1] : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(prev => { const s = new Set(prev); s.delete(c.id); return s })
                          setTags(prev => { const t = { ...prev }; delete t[c.id]; return t })
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors text-ink-hint"
                        aria-label={`Remove ${c.name}`}
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Main-function event tags */}
                    {eventsLoading ? (
                      <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-purple-100 dark:border-purple-900/40 text-xs text-purple-400">
                        <Loader2 size={11} className="animate-spin" /> Loading events…
                      </div>
                    ) : mainEvents.length === 0 ? (
                      <div className="mt-2 pt-1.5 border-t border-purple-100 dark:border-purple-900/40 text-xs text-amber-700 dark:text-amber-400">
                        No main functions —{" "}
                        <a href="/functions" className="underline font-semibold">mark functions as main</a>
                      </div>
                    ) : (
                      <div
                        className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-purple-100 dark:border-purple-900/40"
                        role="group"
                        aria-label={`Events for ${c.name}`}
                      >
                        {mainEvents.map((ev, i) => {
                          const active = cTags.includes(ev.id)
                          const col = eventColor(i)
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => toggleTag(c.id, ev.id)}
                              className={cn(
                                "h-6 px-2 rounded text-[11px] font-semibold border transition-colors duration-150 cursor-pointer flex items-center gap-1",
                                active
                                  ? cn("text-white border-transparent", col.active)
                                  : cn("bg-transparent border-current", col.text, col.bg)
                              )}
                            >
                              <Star size={9} className={active ? "fill-white text-white" : "fill-current"} aria-hidden />
                              {ev.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* ── Push to Guest List modal ──────────────────────────────────────── */}
      <Modal open={pushOpen} onClose={() => setPushOpen(false)} title="Add to Guest List">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Info size={15} className="shrink-0 mt-0.5" />
            <p>
              <strong>{taggedCount.toLocaleString("en-IN")} tagged contacts</strong> will be added.
              {tagCounts.untagged > 0 && ` ${tagCounts.untagged} untagged will be skipped.`}
              {" "}After adding, they are removed from the sorter.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-vivah-ink">
              Which side are these guests?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["GROOM", "BRIDE"] as SideChoice[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPushSide(s)}
                  className={cn(
                    "h-11 rounded-lg border-2 text-sm font-semibold transition-all duration-150 cursor-pointer",
                    pushSide === s
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "border-[var(--border)] bg-[var(--surface)] text-vivah-ink hover:border-purple-300"
                  )}
                >
                  {s === "GROOM" ? "🤵 Groom's side" : "👰 Bride's side"}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(tagCounts.perEvent).length > 0 && (
            <div className="text-sm space-y-1.5">
              <p className="font-semibold text-xs uppercase tracking-wide text-ink-muted">Breakdown by event</p>
              {mainEvents.filter(ev => tagCounts.perEvent[ev.id]).map((ev, i) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <span className={cn("font-medium text-sm", eventColor(i).text)}>{ev.name}</span>
                  <span className="font-bold text-sm text-vivah-ink">
                    {(tagCounts.perEvent[ev.id] ?? 0).toLocaleString("en-IN")} guest{tagCounts.perEvent[ev.id] !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setPushOpen(false)} disabled={pushing}>Cancel</Button>
            <Button onClick={handlePushToGuests} disabled={pushing || taggedCount === 0}>
              {pushing ? "Adding…" : `Add ${taggedCount} to Guest List`}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
