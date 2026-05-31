import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const wid = getWeddingId()
    const [wedding, guests, vendors, budgetCategories, expenses, tasks, rituals, travel, accommodation] = await Promise.all([
      prisma.wedding.findUnique({ where: { id: wid } }),
      prisma.guest.findMany({ where: { weddingId: wid } }),
      prisma.vendor.findMany({ where: { weddingId: wid } }),
      prisma.budgetCategory.findMany({ where: { weddingId: wid } }),
      prisma.expense.findMany({ where: { weddingId: wid } }),
      prisma.task.findMany({ where: { weddingId: wid } }),
      prisma.ritual.findMany({ where: { weddingId: wid } }),
      prisma.travelRecord.findMany({ where: { weddingId: wid } }),
      prisma.hotel.findMany({ where: { weddingId: wid } }),
    ])

    const totalPlanned = budgetCategories.reduce((s, c) => s + c.plannedBudget, 0)
    const totalActual = budgetCategories.reduce((s, c) => s + c.actualCost, 0)
    const totalPaid = budgetCategories.reduce((s, c) => s + c.paidAmount, 0)
    const totalGuests = guests.reduce((s, g) => s + g.guestCount, 0)

    return ok({
      wedding,
      summary: {
        totalPlanned, totalActual, totalPaid,
        totalGuests, totalGuestRecords: guests.length,
        guestsByRsvp: {
          CONFIRMED: guests.filter(g => g.rsvpStatus === "CONFIRMED").reduce((s, g) => s + g.guestCount, 0),
          PENDING: guests.filter(g => g.rsvpStatus === "PENDING").reduce((s, g) => s + g.guestCount, 0),
          DECLINED: guests.filter(g => g.rsvpStatus === "DECLINED").reduce((s, g) => s + g.guestCount, 0),
        },
        guestsBySide: {
          GROOM: guests.filter(g => g.side === "GROOM").reduce((s, g) => s + g.guestCount, 0),
          BRIDE: guests.filter(g => g.side === "BRIDE").reduce((s, g) => s + g.guestCount, 0),
        },
        vendorsByStatus: {
          FINALIZED: vendors.filter(v => v.status === "FINALIZED").length,
          SHORTLISTED: vendors.filter(v => v.status === "SHORTLISTED").length,
          NEGOTIATING: vendors.filter(v => v.status === "NEGOTIATING").length,
          REJECTED: vendors.filter(v => v.status === "REJECTED").length,
        },
        tasksByStatus: {
          COMPLETED: tasks.filter(t => t.status === "COMPLETED").length,
          IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS").length,
          PENDING: tasks.filter(t => t.status === "PENDING").length,
          BLOCKED: tasks.filter(t => t.status === "BLOCKED").length,
        },
        ritualsByStatus: {
          COMPLETED: rituals.filter(r => r.status === "COMPLETED").length,
          PENDING: rituals.filter(r => r.status === "PENDING").length,
        },
        travelByStatus: {
          CONFIRMED: travel.filter(t => t.status === "CONFIRMED").length,
          PENDING: travel.filter(t => t.status === "PENDING").length,
        },
        totalRoomsAvailable: accommodation.reduce((s, h) => s + h.roomsAvailable, 0),
        totalRoomsAllocated: accommodation.reduce((s, h) => s + h.roomsAllocated, 0),
      },
      budgetCategories,
      expenses: expenses.slice(0, 50),
      guestCities: guests.reduce<Record<string, number>>((acc, g) => {
        const city = g.city ?? "Unknown"
        acc[city] = (acc[city] ?? 0) + g.guestCount
        return acc
      }, {}),
    })
  } catch (e) {
    return serverErr(e)
  }
}
