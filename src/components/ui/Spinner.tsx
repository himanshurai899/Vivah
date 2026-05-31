// Agni-Jal themed spinner — matches the Bihari wedding design system

export function Spinner({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      role="img"
    >
      <defs>
        <linearGradient id="sp-agni" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#E8C56A" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F1FB5" />
        </linearGradient>
        <linearGradient id="sp-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#E8C56A" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
      </defs>

      {/* Outer petal ring — slow clockwise */}
      <g style={{ transformOrigin: "24px 24px", animation: "sp-cw 2.4s linear infinite" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <ellipse
            key={angle}
            cx="24" cy="7" rx="1.6" ry="4"
            fill="url(#sp-petal)" opacity="0.55"
            transform={`rotate(${angle} 24 24)`}
          />
        ))}
      </g>

      {/* Counter-rotating dashed ring */}
      <g style={{ transformOrigin: "24px 24px", animation: "sp-ccw 1.8s linear infinite" }}>
        <circle cx="24" cy="24" r="13" stroke="#7C3AED" strokeWidth="1"
          strokeDasharray="3 5" fill="none" opacity="0.22" />
      </g>

      {/* Centre disc */}
      <circle cx="24" cy="24" r="8.5" fill="#FAFAF8" opacity="0.97" />

      {/* Flame — breathes */}
      <g style={{ transformOrigin: "24px 24px", animation: "sp-breathe 1.4s ease-in-out infinite" }}>
        <path
          d="M24 17 C26 19.5, 29.5 22, 28 25.5 C26.5 28.5, 24 29.5, 24 29.5 C24 29.5, 21.5 28.5, 20 25.5 C18.5 22, 22 19.5, 24 17Z"
          fill="url(#sp-agni)"
        />
        <path
          d="M24 19.5 C25.2 21, 27 22.5, 26.2 25 C25.5 27, 24 27.8, 24 27.8 C24 27.8, 22.5 27, 21.8 25 C21 22.5, 22.8 21, 24 19.5Z"
          fill="#E8C56A" opacity="0.28"
        />
      </g>

      {/* ॐ */}
      <text x="24" y="26.5"
        fontFamily="'Segoe UI', Arial, sans-serif" fontSize="5.5"
        fontWeight="600" textAnchor="middle" fill="#FAFAF8" opacity="0.88">
        ॐ
      </text>
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={80} />
        <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
          Loading…
        </p>
      </div>
    </div>
  )
}

export function InlineSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      style={{ animation: "sp-cw 0.8s linear infinite", transformOrigin: "8px 8px" }}
      aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="#C9A84C" strokeWidth="2"
        strokeDasharray="28 10" strokeLinecap="round" />
    </svg>
  )
}
