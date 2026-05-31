"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, Suspense } from "react"

function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevRoute = useRef(`${pathname}?${searchParams}`)

  useEffect(() => {
    const current = `${pathname}?${searchParams}`
    if (current === prevRoute.current) return
    prevRoute.current = current

    // Start the bar
    setVisible(true)
    setWidth(15)

    // Ramp to ~80% quickly, then slow down
    const ramp = () => {
      setWidth(w => {
        if (w >= 80) return w + 0.3
        if (w >= 60) return w + 1.2
        return w + 2.5
      })
      timerRef.current = setTimeout(ramp, 120)
    }
    timerRef.current = setTimeout(ramp, 120)

    // Complete on next tick (route has committed)
    rafRef.current = requestAnimationFrame(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setWidth(100)
      setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 350)
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  if (!visible && width === 0) return null

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, var(--gold) 0%, var(--purple) 60%, var(--gold) 100%)",
          backgroundSize: "200% 100%",
          animation: "nav-shimmer 1.4s linear infinite",
          transition: width === 100
            ? "width 250ms var(--ease)"
            : "width 120ms linear",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 8px rgba(124,58,237,0.5)",
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  )
}

// Suspense required because useSearchParams() needs it in App Router
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  )
}
