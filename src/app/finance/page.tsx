"use client"

import { useEffect, useState } from "react"
import { Plus, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageLoader } from "@/components/ui/Spinner"
import { formatINR, utilization, calcOverrunPct } from "@/lib/utils/currency"
import { formatDate } from "@/lib/utils/date"
import { BUDGET_CATEGORIES } from "@/lib/constants"

type Category = { id: string; category: string; plannedBudget: number; actualCost: number; paidAmount: number }
type Expense = { id: string; category: string; description: string; paidTo?: string; amount: number; paidAmount: number; paymentMode: string; date: string }

const paymentModes = [
  { value: "CASH", label: "Cash" }, { value: "UPI", label: "UPI" }, { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" }, { value: "CHEQUE", label: "Cheque" },
]

export default function FinancePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"budget" | "expenses">("budget")
  const [showExpForm, setShowExpForm] = useState(false)
  const [expForm, setExpForm] = useState<Partial<Expense>>({ paymentMode: "UPI" })
  const [editExpId, setEditExpId] = useState<string | null>(null)
  const [showBudgetEdit, setShowBudgetEdit] = useState<Category | null>(null)
  const [budgetForm, setBudgetForm] = useState<Partial<Category>>({})
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([
      fetch("/api/finance/categories").then(r => r.json()),
      fetch("/api/finance/expenses").then(r => r.json()),
    ]).then(([cats, exps]) => { setCategories(cats); setExpenses(exps) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const totalPlanned = categories.reduce((s, c) => s + c.plannedBudget, 0)
  const totalActual = categories.reduce((s, c) => s + c.actualCost, 0)
  const totalPaid = categories.reduce((s, c) => s + c.paidAmount, 0)
  const utilPct = utilization(totalActual, totalPlanned)

  const saveExpense = async () => {
    setSaving(true)
    const url = editExpId ? `/api/finance/expenses/${editExpId}` : "/api/finance/expenses"
    await fetch(url, { method: editExpId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(expForm) })
    setShowExpForm(false); load(); setSaving(false)
  }

  const saveBudget = async () => {
    if (!showBudgetEdit) return
    setSaving(true)
    await fetch(`/api/finance/categories/${showBudgetEdit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(budgetForm) })
    setShowBudgetEdit(null); load(); setSaving(false)
  }

  const removeExpense = async () => {
    if (!deleteExpId) return
    await fetch(`/api/finance/expenses/${deleteExpId}`, { method: "DELETE" }); setDeleteExpId(null); load()
  }

  const catOptions = BUDGET_CATEGORIES.map(c => ({ value: c, label: c }))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><DollarSign size={20} className="text-violet-600" /> Finance Management</h1>
          <p className="text-sm text-gray-500">Planned: {formatINR(totalPlanned)} · Actual: {formatINR(totalActual)} · Paid: {formatINR(totalPaid)}</p>
        </div>
        <Button onClick={() => { setExpForm({ paymentMode: "UPI" }); setEditExpId(null); setShowExpForm(true) }}>
          <Plus size={15} /> Add Expense
        </Button>
      </div>

      {/* Budget utilization bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Budget Utilization</span>
          <span className={`text-sm font-bold ${utilPct > 100 ? "text-red-600" : utilPct > 80 ? "text-orange-500" : "text-green-600"}`}>{utilPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${utilPct > 100 ? "bg-red-500" : utilPct > 80 ? "bg-orange-400" : "bg-green-500"}`} style={{ width: `${Math.min(utilPct, 100)}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{formatINR(totalActual)} spent</span>
          <span>{formatINR(totalPlanned - totalActual > 0 ? totalPlanned - totalActual : 0)} remaining</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["budget", "expenses"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "budget" ? "Budget Categories" : "Expense Ledger"}
          </button>
        ))}
      </div>

      {tab === "budget" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Category", "Planned", "Actual", "Paid", "Utilization", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => {
                const util = utilization(c.actualCost, c.plannedBudget)
                const over = calcOverrunPct(c.actualCost, c.plannedBudget)
                return (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${over > 0 ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.category}</td>
                    <td className="px-4 py-3 text-gray-700">{formatINR(c.plannedBudget)}</td>
                    <td className={`px-4 py-3 font-medium ${over > 0 ? "text-red-600" : "text-gray-700"}`}>
                      {formatINR(c.actualCost)} {over > 0 && <span className="text-xs ml-1">+{over}%</span>}
                    </td>
                    <td className="px-4 py-3 text-green-700">{formatINR(c.paidAmount)}</td>
                    <td className="px-4 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${util > 100 ? "bg-red-500" : util > 80 ? "bg-orange-400" : "bg-violet-500"}`} style={{ width: `${Math.min(util, 100)}%` }} />
                        </div>
                        <span className={`text-xs w-9 text-right ${util > 100 ? "text-red-600" : "text-gray-500"}`}>{util}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setShowBudgetEdit(c); setBudgetForm({ plannedBudget: c.plannedBudget, actualCost: c.actualCost, paidAmount: c.paidAmount }) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "expenses" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Date", "Category", "Description", "Paid To", "Amount", "Paid", "Mode", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No expenses yet. Add your first expense.</td></tr>
              ) : expenses.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{e.category}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.description}</td>
                  <td className="px-4 py-3 text-gray-600">{e.paidTo ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{formatINR(e.amount)}</td>
                  <td className="px-4 py-3 text-green-700">{formatINR(e.paidAmount)}</td>
                  <td className="px-4 py-3 text-gray-500">{e.paymentMode}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setExpForm({ ...e }); setEditExpId(e.id); setShowExpForm(true) }} className="text-xs text-violet-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteExpId(e.id)} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal open={showExpForm} onClose={() => setShowExpForm(false)} title={editExpId ? "Edit Expense" : "Add Expense"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Category *" value={expForm.category ?? ""} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} options={catOptions} placeholder="Select category" />
          <Input label="Description *" value={expForm.description ?? ""} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} />
          <Input label="Paid To" value={expForm.paidTo ?? ""} onChange={e => setExpForm(p => ({ ...p, paidTo: e.target.value }))} />
          <Input label="Amount (₹) *" type="number" value={expForm.amount ?? ""} onChange={e => setExpForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} />
          <Input label="Amount Paid (₹)" type="number" value={expForm.paidAmount ?? 0} onChange={e => setExpForm(p => ({ ...p, paidAmount: parseFloat(e.target.value) || 0 }))} />
          <Select label="Payment Mode" value={expForm.paymentMode ?? "UPI"} onChange={e => setExpForm(p => ({ ...p, paymentMode: e.target.value }))} options={paymentModes} />
          <Input label="Date" type="date" value={expForm.date ? new Date(expForm.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowExpForm(false)}>Cancel</Button>
          <Button onClick={saveExpense} loading={saving}>Save Expense</Button>
        </div>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal open={!!showBudgetEdit} onClose={() => setShowBudgetEdit(null)} title={`Edit Budget: ${showBudgetEdit?.category}`}>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Planned Budget (₹)" type="number" value={budgetForm.plannedBudget ?? 0} onChange={e => setBudgetForm(p => ({ ...p, plannedBudget: parseFloat(e.target.value) || 0 }))} />
          <Input label="Actual Cost (₹)" type="number" value={budgetForm.actualCost ?? 0} onChange={e => setBudgetForm(p => ({ ...p, actualCost: parseFloat(e.target.value) || 0 }))} hint="Auto-updated when expenses are added" />
          <Input label="Paid Amount (₹)" type="number" value={budgetForm.paidAmount ?? 0} onChange={e => setBudgetForm(p => ({ ...p, paidAmount: parseFloat(e.target.value) || 0 }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setShowBudgetEdit(null)}>Cancel</Button>
          <Button onClick={saveBudget} loading={saving}>Update Budget</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteExpId} onClose={() => setDeleteExpId(null)} onConfirm={removeExpense} title="Delete Expense" message="Remove this expense record?" />
    </div>
  )
}
