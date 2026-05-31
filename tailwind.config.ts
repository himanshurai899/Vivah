import type { Config } from "tailwindcss"

// $10K Checklist — #03 Restrained color system (4 tokens, no rainbow)
// #02 Typography: Cormorant Garamond + DM Sans via CSS variables
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map Tailwind classes to CSS design tokens
        vivah: {
          ink:    "var(--ink)",
          purple: "var(--purple)",
          gold:   "var(--gold)",
          ivory:  "var(--ivory)",
          muted:  "var(--text-muted)",
          faint:  "var(--text-faint)",
        },
      },
      fontFamily: {
        // Named after the actual fonts — never Inter or Roboto by default
        display: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans:    ["var(--font-dm-sans)",   "DM Sans",            "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
        xl:   "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card:   "0 1px 2px rgba(15,6,18,0.04), 0 4px 12px rgba(15,6,18,0.05)",
        "card-hover": "0 2px 4px rgba(15,6,18,0.06), 0 8px 24px rgba(124,58,237,0.10)",
        dropdown: "0 8px 32px rgba(15,6,18,0.12), 0 2px 8px rgba(15,6,18,0.06)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "220ms",
      },
    },
  },
  plugins: [],
}

export default config
