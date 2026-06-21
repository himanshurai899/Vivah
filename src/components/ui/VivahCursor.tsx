"use client"

import { useEffect, useRef, useState } from "react"

const IDLE_DELAY_MS = 3000
const LERP = 0.20  // snappy-enough glow lag

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

  // Only React state: set once on mount, never touched again
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

    // Cursor state — plain JS variables, zero React involvement
    const pos  = { x: -500, y: -500 }
    const gPos = { x: -500, y: -500 }
    let visible = false, idle = false, over = false, moved = false

    // Last-written DOM values — skip write when nothing changed
    let lastDotX = NaN, lastDotY = NaN
    let lastGlowX = NaN, lastGlowY = NaN
    let lastShow = false, lastIdle = false
    let lastCursor = ""

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

    const tick = () => {
      // Hit-test only when cursor actually moved (not every frame)
      if (moved) { over = checkInteractive(pos.x, pos.y); moved = false }

      // Lerp glow toward dot
      gPos.x += (pos.x - gPos.x) * LERP
      gPos.y += (pos.y - gPos.y) * LERP

      // Write dot transform only when position changed
      if (pos.x !== lastDotX || pos.y !== lastDotY) {
        dotWrap.style.transform = `translate(${pos.x}px,${pos.y}px)`
        lastDotX = pos.x; lastDotY = pos.y
      }

      // Round glow to 1dp — stops infinite micro-float drift from generating
      // new strings (and new composite jobs) every frame when cursor is still
      const gx = Math.round(gPos.x * 10) / 10
      const gy = Math.round(gPos.y * 10) / 10
      if (gx !== lastGlowX || gy !== lastGlowY) {
        glowWrap.style.transform = `translate(${gx}px,${gy}px)`
        lastGlowX = gx; lastGlowY = gy
      }

      // classList.toggle only when show/idle state flips
      const show = visible && !over
      if (show !== lastShow || idle !== lastIdle) {
        lastShow = show; lastIdle = idle
        dot.classList.toggle("is-shown", show)
        dot.classList.toggle("is-idle",  show && idle)
        glow.classList.toggle("is-shown", show)
        glow.classList.toggle("is-idle",  show && idle)
      }

      // body.style.cursor triggers a full cascade style-recalc if re-set every
      // frame — only write it when the value actually changes
      const cur = show ? "none" : ""
      if (cur !== lastCursor) { document.body.style.cursor = cur; lastCursor = cur }

      raf = requestAnimationFrame(tick)
    }

    const startRaf = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const stopRaf  = () => { if (raf) { cancelAnimationFrame(raf); raf = null } }

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX; pos.y = e.clientY
      moved = true; visible = true; idle = false
      if (idleTimer) clearTimeout(idleTimer)
      // Restart RAF on idle timer so is-idle class is applied even after RAF
      // would have otherwise gone quiet with a stationary cursor
      idleTimer = setTimeout(() => { idle = true; startRaf() }, IDLE_DELAY_MS)
      startRaf()
    }

    const onLeave = () => {
      visible = false
      // Flush immediately without waiting for next RAF tick
      if (lastShow) {
        dot.classList.remove("is-shown", "is-idle")
        glow.classList.remove("is-shown", "is-idle")
        lastShow = false; lastIdle = false
      }
      if (lastCursor) { document.body.style.cursor = ""; lastCursor = "" }
      stopRaf()
    }
    const onEnter = () => { visible = true; startRaf() }

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
