import { cn } from "@/lib/utils/cn"

type Color = "purple" | "green" | "yellow" | "red" | "blue" | "gray" | "orange"

interface BadgeProps {
  children: React.ReactNode
  color?: Color
  className?: string
}

const colors: Record<Color, string> = {
  purple: "bg-violet-100 text-violet-700",
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
  orange: "bg-orange-100 text-orange-700",
}

export function Badge({ children, color = "gray", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", colors[color], className)}>
      {children}
    </span>
  )
}

export function rsvpColor(status: string): Color {
  if (status === "CONFIRMED") return "green"
  if (status === "DECLINED") return "red"
  return "yellow"
}

export function vendorStatusColor(status: string): Color {
  if (status === "FINALIZED") return "green"
  if (status === "NEGOTIATING") return "blue"
  if (status === "REJECTED") return "red"
  return "yellow"
}

export function taskStatusColor(status: string): Color {
  if (status === "COMPLETED") return "green"
  if (status === "IN_PROGRESS") return "blue"
  if (status === "BLOCKED") return "red"
  return "gray"
}

export function priorityColor(priority: string): Color {
  if (priority === "CRITICAL") return "red"
  if (priority === "HIGH") return "orange"
  if (priority === "MEDIUM") return "yellow"
  return "gray"
}
