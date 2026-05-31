export type CheckInStatus = "PENDING" | "CHECKED_IN" | "ABSENT"

export type CheckInRecord = {
  id: string
  guestName: string
  familyName?: string
  eventName: string
  status: CheckInStatus
  arrivalTime?: string
  qrCode?: string
  notes?: string
}

export type CheckInStats = {
  total: number
  checkedIn: number
  pending: number
  absent: number
  progressPct: number
}

export function buildQrPayload(record: Pick<CheckInRecord, "id" | "guestName" | "eventName">): string {
  return JSON.stringify({ id: record.id, guest: record.guestName, event: record.eventName })
}

export function calculateCheckInStats(records: Pick<CheckInRecord, "status">[]): CheckInStats {
  const total = records.length
  const checkedIn = records.filter(r => r.status === "CHECKED_IN").length
  const pending = records.filter(r => r.status === "PENDING").length
  const absent = records.filter(r => r.status === "ABSENT").length
  const progressPct = total === 0 ? 0 : Math.round((checkedIn / total) * 100)
  return { total, checkedIn, pending, absent, progressPct }
}
