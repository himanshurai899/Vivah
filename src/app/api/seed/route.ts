import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/db/seed-runner"

export async function POST() {
  try {
    await seedDatabase()
    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Seed failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
