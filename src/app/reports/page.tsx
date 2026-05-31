"use client"

import { useEffect, useState, useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BarChart2, Download, ChevronDown, Users, Store, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PageLoader } from "@/components/ui/Spinner"
import { formatINR } from "@/lib/utils/currency"
import { formatDate } from "@/lib/utils/date"
import { exportBudgetPDF, exportGuestsPDF, exportVendorsPDF, exportBudgetCSV } from "@/lib/utils/pdf-export"

const CHART_COLORS = ["#7C3AED", "#C9A84C", "#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#EC4899", "#14B8A6"]

function ExportMenu({ data }: { data: any }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const items = [
    { label: "Budget PDF",       icon: <DollarSign size={13} />, action: () => exportBudgetPDF(data) },
    { label: "Guest List PDF",   icon: <Users size={13} />,      action: () => exportGuestsPDF({ wedding: data.wedding, guests: data.guests }) },
    { label: "Vendor PDF",       icon: <Store size={13} />,      action: () => exportVendorsPDF({ wedding: data.wedding, vendors: data.vendors }) },
    { label: "Budget CSV",       icon: <Download size={13} />,   action: () => exportBudgetCSV(data.budgetCategories) },
  ]

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" onClick={() => setOpen(o => !o)}>
        <Download size={14} /> Export <ChevronDown size={12} />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => { item.action(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              <span className="text-gray-400">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"budget" | "guests" | "vendors">("budget")
  const [guestFilter, setGuestFilter] = useState<"ALL" | "GROOM" | "BRIDE">("ALL")

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then(r => r.json()),
      fetch("/api/guests").then(r => r.json()),
      fetch("/api/vendors").then(r => r.json()),
    ]).then(([rep, g, v]) => {
      setData(rep)
      setGuests(Array.isArray(g) ? g : [])
      setVendors(Array.isArray(v) ? v : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data?.summary) return (
    <div className="text-center py-20 text-gray-400">
      <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
      <p>No data available. Run <code className="bg-gray-100 px-1 rounded text-sm">npm run db:seed</code> first.</p>
    </div>
  )

  const { summary, budgetCategories, guestCities, wedding } = data
  const enrichedData = { ...data, guests, vendors }

  const budgetChartData = budgetCategories.slice(0, 10).map((c: any) => ({
    name: c.category.replace(/_/g, " ").split(" ")[0],
    planned: c.plannedBudget,
    actual: c.actualCost,
  }))

  const taskChartData = Object.entries(summary.tasksByStatus ?? {}).map(([k, v]) => ({ name: k, value: v as number }))
  const rsvpData = [
    { name: "Confirmed", value: summary.guestsByRsvp?.CONFIRMED ?? 0 },
    { name: "Pending",   value: summary.guestsByRsvp?.PENDING  ?? 0 },
    { name: "Declined",  value: summary.guestsByRsvp?.DECLINED ?? 0 },
  ].filter(d => d.value > 0)

  const vendorStatusData = Object.entries(summary.vendorsByStatus ?? {}).map(([k, v]) => ({ name: k, value: v as number }))

  const filteredGuests = guestFilter === "ALL" ? guests : guests.filter((g: any) => g.side === guestFilter)

  const tabs = [
    { id: "budget" as const, label: "Budget", icon: <DollarSign size={14} /> },
    { id: "guests" as const, label: "Guests", icon: <Users size={14} /> },
    { id: "vendors" as const, label: "Vendors", icon: <Store size={14} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart2 size={24} className="text-violet-600" /> Reports
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {wedding?.name} · {formatDate(wedding?.date)}
          </p>
        </div>
        <ExportMenu data={enrichedData} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget",   value: formatINR(summary.totalPlanned),                   sub: "planned total" },
          { label: "Spent So Far",   value: formatINR(summary.totalActual),                    sub: `${Math.round((summary.totalActual / summary.totalPlanned) * 100)}% utilized` },
          { label: "Total Guests",   value: summary.totalGuests,                               sub: `${summary.guestsByRsvp?.CONFIRMED ?? 0} confirmed` },
          { label: "Vendors",        value: (summary.vendorsByStatus?.FINALIZED ?? 0) + (summary.vendorsByStatus?.SHORTLISTED ?? 0), sub: `${summary.vendorsByStatus?.FINALIZED ?? 0} finalized` },
        ].map(s => (
          <div key={s.label} className="card text-center p-4">
            <p className="stat-number text-2xl text-violet-700">{s.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Budget tab */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Planned vs Actual by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Bar dataKey="planned" fill="#DDD6FE" name="Planned" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actual"  fill="#7C3AED" name="Actual"  radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Task Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={taskChartData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {taskChartData.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Budget Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["Category", "Planned", "Actual", "Paid", "Balance", "Utilization"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budgetCategories.map((c: any) => {
                    const util = c.plannedBudget > 0 ? Math.round((c.actualCost / c.plannedBudget) * 100) : 0
                    const over = c.actualCost > c.plannedBudget
                    return (
                      <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${over ? "bg-red-50/60" : ""}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{c.category}</td>
                        <td className="px-4 py-3 text-gray-600">{formatINR(c.plannedBudget)}</td>
                        <td className={`px-4 py-3 font-medium ${over ? "text-red-600" : "text-gray-800"}`}>{formatINR(c.actualCost)}</td>
                        <td className="px-4 py-3 text-green-700">{formatINR(c.paidAmount)}</td>
                        <td className={`px-4 py-3 ${over ? "text-red-500" : "text-gray-600"}`}>{formatINR(c.plannedBudget - c.actualCost)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                              <div className={`h-full rounded-full ${over ? "bg-red-500" : "bg-violet-500"}`} style={{ width: `${Math.min(util, 100)}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${over ? "text-red-600" : "text-gray-500"}`}>{util}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-violet-50 font-semibold border-t-2 border-violet-200">
                    <td className="px-4 py-3 text-gray-900">TOTAL</td>
                    <td className="px-4 py-3">{formatINR(summary.totalPlanned)}</td>
                    <td className="px-4 py-3">{formatINR(summary.totalActual)}</td>
                    <td className="px-4 py-3 text-green-700">{formatINR(summary.totalPaid)}</td>
                    <td className="px-4 py-3">{formatINR(summary.totalPlanned - summary.totalActual)}</td>
                    <td className="px-4 py-3 text-violet-700">{Math.round((summary.totalActual / summary.totalPlanned) * 100)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Guests tab */}
      {activeTab === "guests" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">RSVP Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={rsvpData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {rsvpData.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {Object.keys(guestCities).length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Top Cities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(guestCities).sort((a: any, b: any) => b[1] - a[1]).slice(0, 9).map(([city, count]) => (
                    <div key={city} className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="stat-number text-xl text-violet-700">{count as number}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{city}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Guest List ({filteredGuests.length})</h3>
              <div className="flex gap-1">
                {(["ALL", "GROOM", "BRIDE"] as const).map(f => (
                  <button key={f} type="button" onClick={() => setGuestFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${guestFilter === f ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["Name", "Family", "Side", "City", "Count", "RSVP", "Accommodation", "Pickup"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((g: any) => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{g.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{g.familyName}</td>
                      <td className="px-4 py-2.5 text-gray-500">{g.side}</td>
                      <td className="px-4 py-2.5 text-gray-500">{g.city ?? "—"}</td>
                      <td className="px-4 py-2.5 text-gray-700">{g.guestCount}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium ${g.rsvpStatus === "CONFIRMED" ? "text-green-600" : g.rsvpStatus === "DECLINED" ? "text-red-500" : "text-amber-600"}`}>
                          {g.rsvpStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{g.accommodationNeeded ? "Yes" : "No"}</td>
                      <td className="px-4 py-2.5 text-gray-500">{g.pickupNeeded ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendors tab */}
      {activeTab === "vendors" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Vendor Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={vendorStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {vendorStatusData.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
              {(() => {
                const finalized = vendors.filter((v: any) => v.status === "FINALIZED")
                const totalFinal = finalized.reduce((s: number, v: any) => s + (v.finalAmount ?? 0), 0)
                const totalPaid  = finalized.reduce((s: number, v: any) => s + (v.advancePaid ?? 0), 0)
                return (
                  <div className="space-y-3">
                    {[
                      { label: "Contracted (finalized)",  value: formatINR(totalFinal),            color: "text-gray-800" },
                      { label: "Advance Paid",             value: formatINR(totalPaid),             color: "text-green-600" },
                      { label: "Balance Due",              value: formatINR(totalFinal - totalPaid), color: "text-amber-600" },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">{r.label}</span>
                        <span className={`font-semibold ${r.color}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Vendor Payment Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["Vendor", "Category", "Status", "Final Amount", "Advance Paid", "Balance Due"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v: any) => {
                    const balance = (v.finalAmount ?? 0) - (v.advancePaid ?? 0)
                    return (
                      <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                        <td className="px-4 py-3 text-gray-500">{v.category}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${v.status === "FINALIZED" ? "text-green-600" : v.status === "REJECTED" ? "text-red-500" : "text-amber-600"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{v.finalAmount ? formatINR(v.finalAmount) : "—"}</td>
                        <td className="px-4 py-3 text-green-700">{formatINR(v.advancePaid ?? 0)}</td>
                        <td className="px-4 py-3 text-amber-700 font-medium">{v.finalAmount ? formatINR(balance) : "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
