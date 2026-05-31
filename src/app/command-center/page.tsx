"use client"

import { useEffect, useState } from "react"
import { Command, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { PageLoader } from "@/components/ui/Spinner"
import { formatINR } from "@/lib/utils/currency"

export default function CommandCenterPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = () => {
    setLoading(true)
    fetch("/api/reports").then(r => r.json()).then(d => { setData(d); setLastRefresh(new Date()) }).finally(() => setLoading(false))
  }
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  if (loading && !data) return <PageLoader />
  if (!data?.summary) return <div className="text-center py-20 text-gray-400">No data. Run seed first.</div>

  const { summary } = data

  const panels = [
    {
      title: "Guest Status", icon: "👥", color: "bg-blue-50 border-blue-200",
      stats: [
        { label: "Total Invited", value: summary.totalGuests, color: "text-gray-900" },
        { label: "Confirmed", value: summary.guestsByRsvp.CONFIRMED, color: "text-green-600" },
        { label: "Pending RSVP", value: summary.guestsByRsvp.PENDING, color: "text-yellow-600" },
        { label: "Declined", value: summary.guestsByRsvp.DECLINED, color: "text-red-600" },
      ]
    },
    {
      title: "Finance Status", icon: "💰", color: "bg-violet-50 border-violet-200",
      stats: [
        { label: "Budget", value: formatINR(summary.totalPlanned), color: "text-gray-900" },
        { label: "Spent", value: formatINR(summary.totalActual), color: "text-violet-700" },
        { label: "Paid", value: formatINR(summary.totalPaid), color: "text-green-600" },
        { label: "Remaining", value: formatINR(summary.totalPlanned - summary.totalActual), color: summary.totalActual > summary.totalPlanned ? "text-red-600" : "text-gray-600" },
      ]
    },
    {
      title: "Vendor Status", icon: "🏪", color: "bg-emerald-50 border-emerald-200",
      stats: [
        { label: "Finalized", value: summary.vendorsByStatus.FINALIZED, color: "text-green-600" },
        { label: "Negotiating", value: summary.vendorsByStatus.NEGOTIATING, color: "text-blue-600" },
        { label: "Shortlisted", value: summary.vendorsByStatus.SHORTLISTED, color: "text-yellow-600" },
        { label: "Rejected", value: summary.vendorsByStatus.REJECTED, color: "text-red-600" },
      ]
    },
    {
      title: "Tasks & Rituals", icon: "✅", color: "bg-orange-50 border-orange-200",
      stats: [
        { label: "Tasks Completed", value: summary.tasksByStatus.COMPLETED, color: "text-green-600" },
        { label: "Tasks In Progress", value: summary.tasksByStatus.IN_PROGRESS, color: "text-blue-600" },
        { label: "Tasks Blocked", value: summary.tasksByStatus.BLOCKED, color: "text-red-600" },
        { label: "Rituals Pending", value: summary.ritualsByStatus.PENDING, color: "text-orange-600" },
      ]
    },
    {
      title: "Accommodation", icon: "🏨", color: "bg-pink-50 border-pink-200",
      stats: [
        { label: "Total Rooms", value: summary.totalRoomsAvailable, color: "text-gray-900" },
        { label: "Allocated", value: summary.totalRoomsAllocated, color: "text-violet-700" },
        { label: "Available", value: summary.totalRoomsAvailable - summary.totalRoomsAllocated, color: summary.totalRoomsAvailable - summary.totalRoomsAllocated < 10 ? "text-red-600 font-bold" : "text-green-600" },
      ]
    },
    {
      title: "Travel & Pickups", icon: "✈️", color: "bg-indigo-50 border-indigo-200",
      stats: [
        { label: "Travel Confirmed", value: summary.travelByStatus.CONFIRMED, color: "text-green-600" },
        { label: "Travel Pending", value: summary.travelByStatus.PENDING, color: "text-yellow-600" },
      ]
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Command size={20} className="text-violet-600" /> Wedding Command Center</h1>
          <p className="text-sm text-gray-500">Live overview · Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} loading={loading}><RefreshCw size={14} /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {panels.map(panel => (
          <div key={panel.title} className={`rounded-xl border p-4 ${panel.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{panel.icon}</span>
              <h3 className="font-semibold text-gray-800 text-sm">{panel.title}</h3>
            </div>
            <div className="space-y-2">
              {panel.stats.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Wedding countdown */}
      {data.wedding && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <div className="text-5xl font-bold mb-2">
            {Math.abs(Math.ceil((new Date(data.wedding.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
          </div>
          <div className="text-violet-200 text-lg">
            {new Date(data.wedding.date) > new Date() ? "days until the wedding 🎊" : "days since the wedding"}
          </div>
          <div className="text-violet-100 text-sm mt-1">{data.wedding.groomName} ♥ {data.wedding.brideName} · {new Date(data.wedding.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
      )}
    </div>
  )
}
