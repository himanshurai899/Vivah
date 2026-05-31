import { cn } from "@/lib/utils/cn"
import { type SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wide text-[#5B4A6E] dark:text-[#B8A8D4]"
            style={{ letterSpacing: "0.04em" }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition-colors duration-150 cursor-pointer",
            "bg-[#F5F3F8] border-[rgba(15,6,18,0.10)] text-[#0F0612]",
            "dark:bg-[#2A1842] dark:border-[rgba(201,168,76,0.16)] dark:text-[#F0EBF7]",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            "dark:focus:ring-violet-400",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-400 focus:ring-red-400",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"
