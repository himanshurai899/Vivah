import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatINR } from "./currency"
import { formatDate } from "./date"

const PURPLE = [124, 58, 237] as [number, number, number]
const GOLD   = [201, 168, 76] as [number, number, number]
const INK    = [15, 6, 18] as [number, number, number]

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...PURPLE)
  doc.rect(0, 0, 210, 18, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text("Vivah — Wedding Planning", 14, 7)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(subtitle, 14, 13)

  doc.setTextColor(...INK)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, 28)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.line(14, 31, 196, 31)
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Generated ${new Date().toLocaleDateString("en-IN")} · Vivah Platform`, 14, 290)
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" })
  }
}

export function exportBudgetPDF(data: {
  wedding: { name: string; date: string }
  budgetCategories: { category: string; plannedBudget: number; actualCost: number; paidAmount: number }[]
  summary: { totalPlanned: number; totalActual: number; totalPaid: number }
}) {
  const doc = new jsPDF()
  addHeader(doc, "Budget Report", `${data.wedding.name} · ${formatDate(data.wedding.date)}`)

  const rows = data.budgetCategories.map(c => {
    const util = c.plannedBudget > 0 ? Math.round((c.actualCost / c.plannedBudget) * 100) : 0
    const balance = c.plannedBudget - c.actualCost
    return [
      c.category,
      formatINR(c.plannedBudget),
      formatINR(c.actualCost),
      formatINR(c.paidAmount),
      formatINR(balance),
      `${util}%`,
    ]
  })

  rows.push([
    "TOTAL",
    formatINR(data.summary.totalPlanned),
    formatINR(data.summary.totalActual),
    formatINR(data.summary.totalPaid),
    formatINR(data.summary.totalPlanned - data.summary.totalActual),
    `${Math.round((data.summary.totalActual / data.summary.totalPlanned) * 100)}%`,
  ])

  autoTable(doc, {
    startY: 36,
    head: [["Category", "Planned", "Actual", "Paid", "Balance", "Utilization"]],
    body: rows,
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8.5, textColor: INK },
    alternateRowStyles: { fillColor: [250, 248, 255] },
    footStyles: { fillColor: [240, 235, 255], fontStyle: "bold" },
    didParseCell: (hook) => {
      if (hook.row.index === rows.length - 1) {
        hook.cell.styles.fontStyle = "bold"
        hook.cell.styles.fillColor = [240, 235, 255]
      }
    },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`vivah-budget-report-${Date.now()}.pdf`)
}

export function exportGuestsPDF(data: {
  wedding: { name: string; date: string }
  guests: {
    name: string; familyName: string; side: string; city?: string
    guestCount: number; rsvpStatus: string; accommodationNeeded: boolean; pickupNeeded: boolean
  }[]
}) {
  const doc = new jsPDF({ orientation: "landscape" })
  addHeader(doc, "Guest List", `${data.wedding.name} · ${data.guests.length} guests total`)

  const groom = data.guests.filter(g => g.side === "GROOM")
  const bride = data.guests.filter(g => g.side === "BRIDE")
  const confirmed = data.guests.filter(g => g.rsvpStatus === "CONFIRMED").length
  const totalCount = data.guests.reduce((s, g) => s + g.guestCount, 0)

  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(`Groom-side: ${groom.length}  ·  Bride-side: ${bride.length}  ·  Confirmed: ${confirmed}  ·  Total headcount: ${totalCount}`, 14, 36)

  const rows = data.guests.map(g => [
    g.name,
    g.familyName,
    g.side,
    g.city ?? "—",
    String(g.guestCount),
    g.rsvpStatus,
    g.accommodationNeeded ? "Yes" : "No",
    g.pickupNeeded ? "Yes" : "No",
  ])

  autoTable(doc, {
    startY: 41,
    head: [["Name", "Family", "Side", "City", "Count", "RSVP", "Accommodation", "Pickup"]],
    body: rows,
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: INK },
    alternateRowStyles: { fillColor: [250, 248, 255] },
    didParseCell: (hook) => {
      if (hook.section === "body" && hook.column.index === 5) {
        const v = hook.cell.raw as string
        if (v === "CONFIRMED") hook.cell.styles.textColor = [16, 185, 129]
        if (v === "DECLINED")  hook.cell.styles.textColor = [239, 68, 68]
      }
    },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`vivah-guest-list-${Date.now()}.pdf`)
}

export function exportVendorsPDF(data: {
  wedding: { name: string; date: string }
  vendors: {
    name: string; category: string; status: string
    finalAmount?: number; advancePaid: number; phone?: string
  }[]
}) {
  const doc = new jsPDF({ orientation: "landscape" })
  addHeader(doc, "Vendor Payment Schedule", `${data.wedding.name} · ${formatDate(data.wedding.date)}`)

  const finalized = data.vendors.filter(v => v.status === "FINALIZED")
  const totalFinal = finalized.reduce((s, v) => s + (v.finalAmount ?? 0), 0)
  const totalPaid  = finalized.reduce((s, v) => s + v.advancePaid, 0)

  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(
    `${finalized.length} finalized vendors  ·  Total contracted: ${formatINR(totalFinal)}  ·  Advance paid: ${formatINR(totalPaid)}  ·  Balance due: ${formatINR(totalFinal - totalPaid)}`,
    14, 36
  )

  const rows = data.vendors.map(v => {
    const balance = (v.finalAmount ?? 0) - v.advancePaid
    return [
      v.name,
      v.category,
      v.status,
      v.phone ?? "—",
      v.finalAmount ? formatINR(v.finalAmount) : "—",
      formatINR(v.advancePaid),
      formatINR(balance),
    ]
  })

  autoTable(doc, {
    startY: 41,
    head: [["Vendor", "Category", "Status", "Phone", "Final Amount", "Advance Paid", "Balance Due"]],
    body: rows,
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: INK },
    alternateRowStyles: { fillColor: [250, 248, 255] },
    didParseCell: (hook) => {
      if (hook.section === "body" && hook.column.index === 2) {
        const v = hook.cell.raw as string
        if (v === "FINALIZED") hook.cell.styles.textColor = [16, 185, 129]
        if (v === "REJECTED")  hook.cell.styles.textColor = [239, 68, 68]
      }
    },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`vivah-vendor-payments-${Date.now()}.pdf`)
}

export function exportBudgetCSV(budgetCategories: { category: string; plannedBudget: number; actualCost: number; paidAmount: number }[]) {
  const header = "Category,Planned (INR),Actual (INR),Paid (INR),Balance (INR),Utilization %"
  const rows = budgetCategories.map(c => {
    const util = c.plannedBudget > 0 ? Math.round((c.actualCost / c.plannedBudget) * 100) : 0
    return `${c.category},${c.plannedBudget},${c.actualCost},${c.paidAmount},${c.plannedBudget - c.actualCost},${util}`
  })
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `vivah-budget-${Date.now()}.csv`
  a.click()
}
