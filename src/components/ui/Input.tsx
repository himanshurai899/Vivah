import { cn } from "@/lib/utils/cn"
import { type InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wide text-[#5B4A6E] dark:text-[#B8A8D4]"
            style={{ letterSpacing: "0.04em" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition-colors duration-150",
            "bg-[#F5F3F8] border-[rgba(15,6,18,0.10)] text-[#0F0612] placeholder:text-[#9987AE]",
            "dark:bg-[#2A1842] dark:border-[rgba(201,168,76,0.16)] dark:text-[#F0EBF7] dark:placeholder:text-[#7D6E99]",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            "dark:focus:ring-violet-400 dark:focus:ring-offset-[#1A0F2E]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-400 focus:ring-red-400 dark:border-red-400",
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[#9987AE] dark:text-[#7D6E99]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
