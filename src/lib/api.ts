import { NextResponse } from "next/server"
import { WEDDING_ID } from "./constants"

export function getWeddingId(): string {
  return WEDDING_ID
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function serverErr(e: unknown) {
  console.error(e)
  const message = e instanceof Error ? e.message : "Internal server error"
  return NextResponse.json({ error: message }, { status: 500 })
}
