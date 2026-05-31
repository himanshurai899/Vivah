import { format, differenceInCalendarDays, isPast } from "date-fns"

export function daysUntil(date: Date): number {
  return differenceInCalendarDays(date, new Date())
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return format(new Date(date), "dd MMM yyyy")
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return format(new Date(date), "dd/MM/yyyy")
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return format(new Date(date), "dd MMM yyyy, hh:mm a")
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return isPast(new Date(date))
}

export function weddingCountdown(weddingDate: Date): { days: number; label: string } {
  const days = daysUntil(weddingDate)
  if (days > 0) return { days, label: `${days} days to go` }
  if (days === 0) return { days: 0, label: "Today is the big day! 🎊" }
  return { days: Math.abs(days), label: `${Math.abs(days)} days since the wedding` }
}
