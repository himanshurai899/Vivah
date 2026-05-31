import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name:     z.string().min(1),
  role:     z.enum(["PLANNER", "VIEWER", "ADMIN"]).default("VIEWER"),
  secret:   z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 })

  if (parsed.data.secret !== (process.env.ADMIN_SECRET ?? "vivah-setup-2026")) {
    return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const user = await prisma.user.create({
    data: { email: parsed.data.email, passwordHash, name: parsed.data.name, role: parsed.data.role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  return NextResponse.json(user, { status: 201 })
}
