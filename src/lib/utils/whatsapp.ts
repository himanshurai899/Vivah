export type BatchFilter = "ALL" | "GROOM" | "BRIDE" | "PENDING_RSVP"

export type GuestForBatch = {
  id: string
  name: string
  familyName: string
  side: string
  rsvpStatus: string
  mobile?: string
}

const PERSONAL_VAR_NAMES = new Set(["GuestName", "Name", "guestName", "name"])

export function substituteVars(message: string, vars: Record<string, string>): string {
  return message.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `[${key}]`)
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "")
  if (digits.startsWith("0")) return "91" + digits.slice(1)
  if (digits.length === 10) return "91" + digits
  return digits
}

export function isPersonalVar(varName: string): boolean {
  return PERSONAL_VAR_NAMES.has(varName)
}

export function filterGuestsForBatch(guests: GuestForBatch[], filter: BatchFilter): GuestForBatch[] {
  return guests.filter(g => {
    if (!g.mobile) return false
    if (filter === "GROOM") return g.side === "GROOM"
    if (filter === "BRIDE") return g.side === "BRIDE"
    if (filter === "PENDING_RSVP") return g.rsvpStatus === "PENDING"
    return true
  })
}
