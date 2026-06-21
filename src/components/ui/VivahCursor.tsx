"use client"

import { useEffect, useRef, useState } from "react"

const IDLE_DELAY_MS = 3000
const LERP = 0.09

const INTERACTIVE_SELECTOR = [
  "a[href]", "button", "input", "select", "textarea",
  '[role="button"]', '[role="link"]', '[role="menuitem"]', '[role="menu"]',
  '[role="tab"]', '[role="checkbox"]', '[role="radio"]', '[role="slider"]',
  '[role="switch"]', '[role="dialog"]', '[role="alertdialog"]',
  ".card", "table", "td", "th", "label", "video", "audio", "dialog",
  "[tabindex]:not([tabindex='-1'])",
  ".btn-primary", ".nav-group-btn", ".nav-dropdown-item",
  ".nav-drawer-item", ".nav-drawer-overlay",
].join(",")

export function VivahCursor() {
  const dotWrapRef  = useRef<HTMLDivElement>(null)
  const glowWrapRef = useRef<HTMLDivElement>(null)
  const dotRef      = useRef<HTMLDivElement>(null)
  const glowRef     = useRef<HTMLDivElement>(null)

  // Only React state: enabled (set once on mount, never again)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(pointer: coarse)").matches
    ) setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const dotWrap  = dotWrapRef.current!
    const glowWrap = glowWrapRef.current!
    const dot      = dotRef.current!
    const glow     = glowRef.current!

    // All cursor state as plain JS variables — zero React re-renders
    const pos  = { x: -500, y: -500 }
    const gPos = { x: -500, y: -500 }
    let visible   = false
    let idle      = false
    let over      = false
    let moved     = false   // true when cursor moved since last RAF tick
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let raf: number | null = null

    const checkInteractive = (x: number, y: number): boolean => {
      try {
        return document.elementsFromPoint(x, y).some(el => {
          if (el === dotWrap || el === glowWrap || el === dot || el === glow) return false
          return (el instanceof Element) && el.matches(INTERACTIVE_SELECTOR)
        })
      } catch { return false }
    }

    const syncClasses = () => {
      const show = visible && !over
      dot.classList.toggle("is-shown", show)
      dot.classList.toggle("is-idle",  show && idle)
      glow.classList.toggle("is-shown", show)
      glow.classList.toggle("is-idle",  show && idle)
      document.body.style.cursor = show ? "none" : ""
    }

    const tick = () => {
      // Hit-test only when cursor actually moved — not every frame
      if (moved) {
        over  = checkInteractive(pos.x, pos.y)
        moved = false
      }

      // Lerp glow toward dot position
      gPos.x += (pos.x - gPos.x) * LERP
      gPos.y += (pos.y - gPos.y) * LERP

      dotWrap.style.transform  = `translate(${pos.x}px,${pos.y}px)`
      glowWrap.style.transform = `translate(${gPos.x}px,${gPos.y}px)`

      syncClasses()
      raf = requestAnimationFrame(tick)
    }

    // Start/stop RAF — pauses completely when cursor leaves the window
    const startRaf = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const stopRaf  = () => { if (raf) { cancelAnimationFrame(raf); raf = null } }

    const onMove = (e: MouseEvent) => {
      pos.x   = e.clientX
      pos.y   = e.clientY
      moved   = true
      visible = true
      idle    = false
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { idle = true }, IDLE_DELAY_MS)
      startRaf()
    }

    const onLeave = () => { visible = false; syncClasses(); stopRaf() }
    const onEnter = () => { visible = true;  startRaf() }

    document.addEventListener("mousemove", onMove,  { passive: true })
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)

    return () => {
      stopRaf()
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      if (idleTimer) clearTimeout(idleTimer)
      document.body.style.cursor = ""
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={dotWrapRef}  className="vc-pos" aria-hidden="true">
        <div ref={dotRef}  className="vc-dot" />
      </div>
      <div ref={glowWrapRef} className="vc-pos" aria-hidden="true">
        <div ref={glowRef} className="vc-glow" />
      </div>
    </>
  )
}
