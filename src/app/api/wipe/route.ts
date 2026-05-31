import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST() {
  try {
    // Delete in dependency order (children before parents)
    await prisma.checkIn.deleteMany()
    await prisma.travelRecord.deleteMany()
    await prisma.roomAllocation.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.budgetCategory.deleteMany()
    await prisma.alert.deleteMany()
    await prisma.whatsAppTemplate.deleteMany()
    await prisma.invitationBlock.deleteMany()
    await prisma.ritual.deleteMany()
    await prisma.responsibility.deleteMany()
    await prisma.task.deleteMany()
    await prisma.hotel.deleteMany()
    await prisma.vendor.deleteMany()
    await prisma.event.deleteMany()
    await prisma.guest.deleteMany()

    return NextResponse.json({ success: true, message: "All data wiped successfully" })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Wipe failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
