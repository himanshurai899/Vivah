const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "₹0"
  const value = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(value)) return "₹0"
  return INR.format(value)
}

export function parseINR(value: string): number {
  if (!value) return 0
  return parseFloat(value.replace(/[₹,\s]/g, "")) || 0
}

export function calcOverrunPct(actual: number, planned: number): number {
  if (planned <= 0) return 0
  const overrun = actual - planned
  if (overrun <= 0) return 0
  return Math.round((overrun / planned) * 100)
}

export function utilization(actual: number, planned: number): number {
  if (planned <= 0) return 0
  return Math.min(Math.round((actual / planned) * 100), 999)
}
