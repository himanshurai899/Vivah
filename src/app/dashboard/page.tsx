"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { Users, Store, DollarSign, Calendar, Bell, CheckSquare, Flame, TrendingUp, TrendingDown } from "lucide-react"
import { formatINR } from "@/lib/utils/currency"
import { daysUntil, formatDate } from "@/lib/utils/date"
import { PageLoader } from "@/components/ui/Spinner"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

const PURPLE = ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"]
const GREEN = ["#10B981", "#34D399", "#6EE7B7"]

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [wedding, setWedding] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then(r => r.json()),
      fetch("/api/wedding").then(r => r.json()),
      fetch("/api/alerts").then(r => r.json()),
    ])
      .then(([reports, w, al]) => {
        setData(reports)
        setWedding(w)
        setAlerts(Array.isArray(al) ? al.filter((a: any) => !a.isRead).slice(0, 3) : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data?.wedding) {
    return (
      <div className="text-center py-20">
        <Flame className="mx-auto text-violet-400 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Database not seeded yet</h2>
        <p className="text-gray-500 mb-6">Run <code className="bg-gray-100 px-2 py-0.5 rounded">npm run db:seed</code> to load all default data</p>
      </div>
    )
  }

  const { summary, budgetCategories, guestCities } = data
  const weddingDate = new Date(data.wedding.date)
  const countdown = daysUntil(weddingDate)
  const utilPct = summary.totalPlanned > 0 ? Math.round((summary.totalActual / summary.totalPlanned) * 100) : 0

  const budgetChartData = budgetCategories
    .filter((c: any) => c.plannedBudget > 0)
    .map((c: any) => ({ name: c.category.split(" ")[0], planned: c.plannedBudget, actual: c.actualCost }))
    .slice(0, 8)

  const rsvpChartData = [
    { name: "Confirmed", value: summary.guestsByRsvp.CONFIRMED, color: "#10B981" },
    { name: "Pending", value: summary.guestsByRsvp.PENDING, color: "#F59E0B" },
    { name: "Declined", value: summary.guestsByRsvp.DECLINED, color: "#EF4444" },
  ].filter(d => d.value > 0)

  const cityData = Object.entries(guestCities)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count: count as number }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.wedding.groomName} ♥ {data.wedding.brideName}
          </h1>
          <p className="text-gray-500 text-sm">{data.wedding.venue} · {formatDate(weddingDate)}</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${countdown > 60 ? "text-violet-600" : countdown > 14 ? "text-orange-500" : "text-red-600"}`}>
            {Math.abs(countdown)}
          </div>
          <div className="text-sm text-gray-500">{countdown > 0 ? "days to go" : "days ago"}</div>
        </div>
      </div>

      {/* Alerts strip */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a: any) => (
            <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${a.type === "CRITICAL" ? "bg-red-50 border-red-200 text-red-700" : a.type === "WARNING" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
              <Bell size={15} className="mt-0.5 shrink-0" />
              <span className="font-medium">{a.title}:</span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/finance" className="stat-card hover:border-violet-300 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-violet-100 rounded-lg"><DollarSign size={18} className="text-violet-600" /></div>
            {utilPct > 100 ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-green-500" />}
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatINR(summary.totalActual)}</div>
          <div className="text-xs text-gray-500 mt-0.5">Budget used ({utilPct}%)</div>
          <div className="text-xs text-gray-400">Planned: {formatINR(summary.totalPlanned)}</div>
        </Link>

        <Link href="/guests" className="stat-card hover:border-violet-300 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><Users size={18} className="text-blue-600" /></div>
            <Badge color="green">{Math.round(summary.guestsByRsvp.CONFIRMED / Math.max(summary.totalGuests, 1) * 100)}%</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.totalGuests}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total guests</div>
          <div className="text-xs text-gray-400">Confirmed: {summary.guestsByRsvp.CONFIRMED}</div>
        </Link>

        <Link href="/vendors" className="stat-card hover:border-violet-300 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg"><Store size={18} className="text-emerald-600" /></div>
            <Badge color="green">{summary.vendorsByStatus.FINALIZED} finalized</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.vendorsByStatus.FINALIZED + summary.vendorsByStatus.SHORTLISTED + summary.vendorsByStatus.NEGOTIATING}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active vendors</div>
          <div className="text-xs text-gray-400">Shortlisted: {summary.vendorsByStatus.SHORTLISTED}</div>
        </Link>

        <Link href="/tasks" className="stat-card hover:border-violet-300 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg"><CheckSquare size={18} className="text-orange-600" /></div>
            <Badge color="green">{summary.tasksByStatus.COMPLETED} done</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.tasksByStatus.PENDING + summary.tasksByStatus.IN_PROGRESS}</div>
          <div className="text-xs text-gray-500 mt-0.5">Open tasks</div>
          <div className="text-xs text-gray-400">Blocked: {summary.tasksByStatus.BLOCKED}</div>
        </Link>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget bar chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><DollarSign size={16} className="text-violet-600" /> Budget by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={budgetChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => formatINR(v)} />
              <Bar dataKey="planned" fill="#DDD6FE" name="Planned" radius={[2, 2, 0, 0]} />
              <Bar dataKey="actual" fill="#7C3AED" name="Actual" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RSVP pie */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users size={16} className="text-blue-600" /> RSVP Status</h3>
          {rsvpChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={rsvpChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                    {rsvpChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} guests`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {rsvpChartData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-gray-400 text-center py-8">No guest data yet</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest by city */}
        {cityData.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={16} className="text-violet-600" /> Top Cities</h3>
            <div className="space-y-2">
              {cityData.map(({ city, count }, i) => (
                <div key={city} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-5">{i + 1}</div>
                  <div className="flex-1 text-sm text-gray-700">{city}</div>
                  <div className="text-sm font-medium text-gray-900">{count as number}</div>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${(count / cityData[0].count) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Groom Side", value: summary.guestsBySide.GROOM, color: "text-violet-600" },
              { label: "Bride Side", value: summary.guestsBySide.BRIDE, color: "text-pink-600" },
              { label: "Need Pickup", value: 0, color: "text-orange-600", href: "/travel" },
              { label: "Need Room", value: 0, color: "text-blue-600", href: "/accommodation" },
              { label: "Rituals Planned", value: summary.ritualsByStatus.PENDING, color: "text-green-600", href: "/rituals" },
              { label: "Budget Paid", value: formatINR(summary.totalPaid), color: "text-gray-700", href: "/finance" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
