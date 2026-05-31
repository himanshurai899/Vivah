"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BarChart2, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PageLoader } from "@/components/ui/Spinner"
import { formatINR } from "@/lib/utils/currency"
import { formatDate } from "@/lib/utils/date"

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/reports").then(r => r.json()).then(setData).finally(() => setLoading(false)) }, [])

  const exportCSV = () => {
    if (!data?.budgetCategories) return
    const header = "Category,Planned,Actual,Paid,Utilization%"
    const rows = data.budgetCategories.map((c: any) => `${c.category},${c.plannedBudget},${c.actualCost},${c.paidAmount},${c.plannedBudget > 0 ? Math.round(c.actualCost / c.plannedBudget * 100) : 0}`)
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "budget-report.csv"; a.click()
  }

  if (loading) return <PageLoader />
  if (!data?.summary) return <div className="text-center py-20 text-gray-400">No data available. Run the seed first.</div>

  const { summary, budgetCategories, guestCities, wedding } = data
  const budgetData = budgetCategories.slice(0, 10).map((c: any) => ({ name: c.category.split(" ")[0], planned: c.plannedBudget, actual: c.actualCost }))
  const taskData = Object.entries(summary.tasksByStatus).map(([k, v]) => ({ name: k, value: v as number }))
  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BarChart2 size={20} className="text-violet-600" /> Reports</h1>
          <p className="text-sm text-gray-500">Wedding: {wedding?.name} · {formatDate(wedding?.date)}</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download size={14} /> Export Budget CSV</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: formatINR(summary.totalPlanned), sub: "planned" },
          { label: "Spent So Far", value: formatINR(summary.totalActual), sub: `${Math.round(summary.totalActual / summary.totalPlanned * 100)}% utilized` },
          { label: "Total Guests", value: summary.totalGuests, sub: `${summary.guestsByRsvp.CONFIRMED} confirmed` },
          { label: "Vendors", value: summary.vendorsByStatus.FINALIZED + summary.vendorsByStatus.SHORTLISTED, sub: `${summary.vendorsByStatus.FINALIZED} finalized` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-violet-700">{s.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{s.label}</div>
            <div className="text-xs text-gray-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Budget: Planned vs Actual</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => formatINR(v)} />
              <Bar dataKey="planned" fill="#DDD6FE" name="Planned" />
              <Bar dataKey="actual" fill="#7C3AED" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Task Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={taskData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {taskData.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Detail Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800">Budget Breakdown by Category</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              {["Category", "Planned", "Actual", "Paid", "Balance", "Utilization"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {budgetCategories.map((c: any) => {
                const util = c.plannedBudget > 0 ? Math.round(c.actualCost / c.plannedBudget * 100) : 0
                const over = c.actualCost > c.plannedBudget
                return (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${over ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.category}</td>
                    <td className="px-4 py-3">{formatINR(c.plannedBudget)}</td>
                    <td className={`px-4 py-3 font-medium ${over ? "text-red-600" : "text-gray-700"}`}>{formatINR(c.actualCost)}</td>
                    <td className="px-4 py-3 text-green-700">{formatINR(c.paidAmount)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatINR(c.plannedBudget - c.actualCost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full"><div className={`h-full rounded-full ${over ? "bg-red-500" : "bg-violet-500"}`} style={{ width: `${Math.min(util, 100)}%` }} /></div>
                        <span className={`text-xs ${over ? "text-red-600 font-medium" : "text-gray-500"}`}>{util}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-violet-50 font-semibold">
                <td className="px-4 py-3 text-gray-900">TOTAL</td>
                <td className="px-4 py-3">{formatINR(summary.totalPlanned)}</td>
                <td className="px-4 py-3">{formatINR(summary.totalActual)}</td>
                <td className="px-4 py-3 text-green-700">{formatINR(summary.totalPaid)}</td>
                <td className="px-4 py-3">{formatINR(summary.totalPlanned - summary.totalActual)}</td>
                <td className="px-4 py-3">{Math.round(summary.totalActual / summary.totalPlanned * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest city breakdown */}
      {Object.keys(guestCities).length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Guests by City</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(guestCities).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([city, count]) => (
              <div key={city} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-violet-700">{count as number}</div>
                <div className="text-xs text-gray-600">{city}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
