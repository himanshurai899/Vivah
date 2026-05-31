"use client"

import { cn } from "@/lib/utils/cn"
import { type ButtonHTMLAttributes, forwardRef } from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 dark:bg-violet-500 dark:hover:bg-violet-600",
  secondary:
    "bg-[#F0EBF7] text-[#5B4A6E] hover:bg-[#E5DEF0] focus:ring-violet-300 dark:bg-[#2A1842] dark:text-[#B8A8D4] dark:hover:bg-[#3A2458] dark:focus:ring-violet-700",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800",
  ghost:
    "text-[#5B4A6E] hover:bg-[#F0EBF7] focus:ring-violet-300 dark:text-[#B8A8D4] dark:hover:bg-[#2A1842] dark:focus:ring-violet-700",
  outline:
    "border border-violet-600 text-violet-600 hover:bg-violet-50 focus:ring-violet-500 dark:border-violet-400 dark:text-violet-300 dark:hover:bg-violet-900/30 dark:focus:ring-violet-600",
}

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "dark:focus:ring-offset-[#1A0F2E]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)

Button.displayName = "Button"
