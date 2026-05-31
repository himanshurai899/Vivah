import { NextResponse } from "next/server"
import { execSync } from "child_process"

export async function POST() {
  try {
    execSync("npx tsx prisma/seed.ts", {
      cwd: process.cwd(),
      timeout: 60000,
      stdio: "pipe",
    })
    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Seed failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
