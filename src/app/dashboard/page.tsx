"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Users, Store, DollarSign, Calendar, Bell, CheckSquare, Flame, TrendingUp, TrendingDown } from "lucide-react"
import { formatINR } from "@/lib/utils/currency"
import { daysUntil, formatDate } from "@/lib/utils/date"
import { PageLoader } from "@/components/ui/Spinner"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [wedding, setWedding] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  // Gate theme on client-mount to prevent hydration mismatch
  const isDark = mounted && resolvedTheme === "dark"

  // Chart colour tokens — resolved once so Recharts SVG gets concrete values
  const chartColors = {
    tick:          isDark ? "#7D6E99" : "#9987AE",
    tooltip:       isDark ? "#1A0F2E" : "#FFFFFF",
    tooltipBorder: isDark ? "rgba(201,168,76,0.18)" : "rgba(15,6,18,0.09)",
    tooltipText:   isDark ? "#F0EBF7" : "#0F0612",
    tooltipMuted:  isDark ? "#B8A8D4" : "#5B4A6E",
    grid:          isDark ? "rgba(240,235,247,0.06)" : "rgba(15,6,18,0.06)",
    barPlanned:    isDark ? "rgba(124,58,237,0.20)" : "rgba(124,58,237,0.18)",
  }

  useEffect(() => {
    setMounted(true)
  }, [])

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
        <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">Database not seeded yet</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Go to <Link href="/settings" className="text-violet-500 underline">Settings</Link> and load dummy data
        </p>
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
          <h1 className="text-2xl font-bold text-[var(--ink)]" style={{ fontFamily: "var(--font-cormorant)" }}>
            {data.wedding.groomName} ♥ {data.wedding.brideName}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">{data.wedding.venue} · {formatDate(weddingDate)}</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${countdown > 60 ? "text-violet-500 dark:text-violet-400" : countdown > 14 ? "text-orange-500" : "text-red-500"}`}
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {Math.abs(countdown)}
          </div>
          <div className="text-sm text-[var(--text-muted)]">{countdown > 0 ? "days to go" : "days ago"}</div>
        </div>
      </div>

      {/* Alerts strip */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((a: any) => {
            const cfg =
              a.type === "CRITICAL"
                ? { accent: "#EF4444", light: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", text: "#B91C1C", label: "#991B1B", darkText: "#FCA5A5", darkLabel: "#FECACA", darkLight: "rgba(239,68,68,0.14)", darkBorder: "rgba(239,68,68,0.30)" }
                : a.type === "WARNING"
                ? { accent: "#F59E0B", light: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.28)", text: "#B45309", label: "#92400E", darkText: "#FCD34D", darkLabel: "#FDE68A", darkLight: "rgba(245,158,11,0.14)", darkBorder: "rgba(245,158,11,0.30)" }
                : { accent: "#6366F1", light: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.25)", text: "#4338CA", label: "#3730A3", darkText: "#A5B4FC", darkLabel: "#C7D2FE", darkLight: "rgba(99,102,241,0.14)", darkBorder: "rgba(99,102,241,0.28)" }
            const bg     = isDark ? cfg.darkLight : cfg.light
            const bdClr  = isDark ? cfg.darkBorder : cfg.border
            const txtClr = isDark ? cfg.darkText  : cfg.text
            const lblClr = isDark ? cfg.darkLabel : cfg.label
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: bg,
                  border: `1px solid ${bdClr}`,
                  borderLeft: `3px solid ${cfg.accent}`,
                }}
              >
                <Bell size={14} className="mt-0.5 shrink-0" style={{ color: cfg.accent }} />
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-semibold mr-1.5"
                    style={{ color: lblClr, fontFamily: "var(--font-dm-sans)" }}
                  >
                    {a.title}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: txtClr }}
                  >
                    {a.message}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            href: "/finance",
            icon: <DollarSign size={17} className="text-white" />,
            iconBg: "bg-gradient-to-br from-violet-500 to-violet-700",
            badge: utilPct > 100 ? <TrendingUp size={15} className="text-red-500" /> : <TrendingDown size={15} className="text-emerald-500" />,
            value: formatINR(summary.totalActual), label: `Budget used (${utilPct}%)`,
            sub: `Planned: ${formatINR(summary.totalPlanned)}`,
          },
          {
            href: "/guests",
            icon: <Users size={17} className="text-white" />,
            iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
            badge: <Badge color="green">{Math.round(summary.guestsByRsvp.CONFIRMED / Math.max(summary.totalGuests, 1) * 100)}%</Badge>,
            value: summary.totalGuests, label: "Total guests",
            sub: `Confirmed: ${summary.guestsByRsvp.CONFIRMED}`,
          },
          {
            href: "/vendors",
            icon: <Store size={17} className="text-white" />,
            iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            badge: <Badge color="green">{summary.vendorsByStatus.FINALIZED} finalized</Badge>,
            value: summary.vendorsByStatus.FINALIZED + summary.vendorsByStatus.SHORTLISTED + summary.vendorsByStatus.NEGOTIATING,
            label: "Active vendors", sub: `Shortlisted: ${summary.vendorsByStatus.SHORTLISTED}`,
          },
          {
            href: "/tasks",
            icon: <CheckSquare size={17} className="text-white" />,
            iconBg: "bg-gradient-to-br from-orange-400 to-orange-600",
            badge: <Badge color="green">{summary.tasksByStatus.COMPLETED} done</Badge>,
            value: summary.tasksByStatus.PENDING + summary.tasksByStatus.IN_PROGRESS,
            label: "Open tasks", sub: `Blocked: ${summary.tasksByStatus.BLOCKED}`,
          },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="stat-card cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl shadow-sm ${card.iconBg}`}>{card.icon}</div>
              {card.badge}
            </div>
            <div className="text-2xl font-bold text-[var(--ink)]">{card.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{card.label}</div>
            <div className="text-xs text-[var(--text-faint)]">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 md:col-span-2">
          <h3 className="font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-violet-500" /> Budget by Category
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={budgetChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              style={{ background: "transparent" }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartColors.tick }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartColors.tick }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{ background: chartColors.tooltip, border: `1px solid ${chartColors.tooltipBorder}`, color: chartColors.tooltipText, borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: chartColors.tooltipMuted, fontSize: 11 }}
                cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="planned" fill={chartColors.barPlanned} name="Planned" radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" fill="#7C3AED" name="Actual" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> RSVP Status
          </h3>
          {rsvpChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart style={{ background: "transparent" }}>
                  <Pie data={rsvpChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value"
                    strokeWidth={isDark ? 2 : 1} stroke={isDark ? "#1A0F2E" : "#FFFFFF"}>
                    {rsvpChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} guests`, ""]}
                    contentStyle={{ background: chartColors.tooltip, border: `1px solid ${chartColors.tooltipBorder}`, color: chartColors.tooltipText, borderRadius: 10, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {rsvpChartData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-[var(--text-muted)]">{d.name}</span>
                    </div>
                    <span className="font-semibold text-[var(--ink)]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-[var(--text-faint)] text-center py-8">No guest data yet</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cityData.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-violet-500" /> Top Cities
            </h3>
            <div className="space-y-2">
              {cityData.map(({ city, count }, i) => (
                <div key={city} className="flex items-center gap-3">
                  <div className="text-xs text-[var(--text-faint)] w-5">{i + 1}</div>
                  <div className="flex-1 text-sm text-[var(--ink)]">{city}</div>
                  <div className="text-sm font-medium text-[var(--ink)]">{count as number}</div>
                  <div className="w-24 rounded-full h-1.5" style={{ background: "var(--surface-2)" }}>
                    <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${(count / cityData[0].count) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="font-semibold text-[var(--ink)] mb-4">Quick Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Groom Side", value: summary.guestsBySide.GROOM, color: "text-violet-500 dark:text-violet-400" },
              { label: "Bride Side", value: summary.guestsBySide.BRIDE, color: "text-pink-500 dark:text-pink-400" },
              { label: "Need Pickup", value: 0, color: "text-orange-500" },
              { label: "Need Room", value: 0, color: "text-blue-500 dark:text-blue-400" },
              { label: "Rituals", value: summary.ritualsByStatus.PENDING, color: "text-emerald-500" },
              { label: "Budget Paid", value: formatINR(summary.totalPaid), color: "text-[var(--gold)]" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className={`text-xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-cormorant)" }}>{s.value}</div>
                <div className="text-xs text-[var(--text-faint)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
