"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils/cn"
import {
  LayoutDashboard, Users, Store, DollarSign, CheckSquare, Calendar,
  Hotel, Plane, ScrollText, UserCheck, Mail, BarChart2,
  Command, Bell, QrCode, MessageCircle, Image, Phone, Settings,
  ChevronDown, Menu, X, MoreHorizontal,
} from "lucide-react"
import { SkyToggle } from "@/components/ui/sky-toggle"

const navGroups = [
  {
    group: "Planning",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/functions", label: "Functions", icon: Calendar },
      { href: "/guests", label: "Guests", icon: Users },
      { href: "/vendors", label: "Vendors", icon: Store },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/accommodation", label: "Accommodation", icon: Hotel },
      { href: "/travel", label: "Travel", icon: Plane },
      { href: "/rituals", label: "Rituals", icon: ScrollText },
      { href: "/responsibilities", label: "Responsibilities", icon: UserCheck },
    ],
  },
  {
    group: "Management",
    items: [
      { href: "/finance", label: "Finance", icon: DollarSign },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/reports", label: "Reports", icon: BarChart2 },
      { href: "/invitation", label: "Invitation", icon: Mail },
    ],
  },
  {
    group: "Execution",
    items: [
      { href: "/command-center", label: "Command Center", icon: Command },
      { href: "/alerts", label: "Alerts", icon: Bell },
      { href: "/checkin", label: "Check-In", icon: QrCode },
      { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/gallery", label: "Gallery", icon: Image },
      { href: "/emergency", label: "Emergency", icon: Phone },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
]

// Mobile bottom nav — 5 primary items, designed for thumb reach (#07)
const mobileBottomNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
]

export function Navbar() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && (pathname ?? "").startsWith(href + "/"))

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 nav-header">
        <div className="flex items-center h-full px-4 gap-3 max-w-screen-2xl mx-auto">

          {/* Logo — Agni-Jal SVG mark */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group" aria-label="Vivah home">
            {/* SVG favicon mark */}
            <div
              className="w-8 h-8 rounded-lg overflow-hidden shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{ background: "var(--ivory)", border: "1px solid var(--gold-border)" }}
              aria-hidden="true"
            >
              {/* Inline Agni-Jal mark — no external image flash */}
              <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
                <defs>
                  <linearGradient id="nav-agni" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#C9A84C"/>
                    <stop offset="55%"  stopColor="#7C3AED"/>
                    <stop offset="100%" stopColor="#4F1FB5"/>
                  </linearGradient>
                  <linearGradient id="nav-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#E8C56A"/>
                    <stop offset="100%" stopColor="#C9A84C"/>
                  </linearGradient>
                </defs>
                <g transform="translate(16,16)">
                  {/* 8-petal ring */}
                  {[0,45,90,135,180,225,270,315].map(a => (
                    <ellipse key={a} cx="0" cy="-10" rx="1.8" ry="3.6" fill="url(#nav-ring)" opacity="0.45" transform={`rotate(${a})`}/>
                  ))}
                  <circle r="8" fill="#FAFAF8" opacity="0.97"/>
                  {/* Lotus base */}
                  <path d="M-4.5 3 Q-2 -0.5 0 3 Q2 -0.5 4.5 3 Q2 5 0 6 Q-2 5 -4.5 3Z" fill="#C9A84C" opacity="0.26"/>
                  {/* Flame */}
                  <path d="M0 -6.5 C1.8 -3, 4 0.5, 2.5 3 C1 5.5, -1 5.5, -2.5 3 C-4 0.5, -1.8 -3, 0 -6.5Z" fill="url(#nav-agni)"/>
                  {/* Highlight */}
                  <path d="M0 -4 C0.9 -2.2, 2 0.5, 1.2 2 C0.4 3.5, -0.4 3.5, -1.2 2 C-2 0.5, -0.9 -2.2, 0 -4Z" fill="#E8C56A" opacity="0.30"/>
                  <circle r="0.9" fill="#FAFAF8" opacity="0.90"/>
                </g>
              </svg>
            </div>
            {/* Brand wordmark */}
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className="nav-brand-text"
                style={{
                  background: "linear-gradient(120deg, var(--ink) 0%, var(--purple) 55%, var(--gold) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Vivah
              </span>
              <span
                className="text-[0.55rem] font-semibold tracking-[0.18em] uppercase"
                style={{ color: "var(--gold)", opacity: 0.75, lineHeight: 1 }}
              >
                शुभ विवाह
              </span>
            </div>
          </Link>

          {/* Desktop navigation — hover dropdowns, no ARIA menu role (not a true menubar) */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-4 flex-1" aria-label="Main navigation">
            {navGroups.map((group) => {
              const groupActive = group.items.some((i) => isActive(i.href))
              return (
                <div key={group.group} className="relative group">
                  <button
                    type="button"
                    className={cn("nav-group-btn", groupActive && "active")}
                    aria-haspopup="true"
                  >
                    {group.group}
                    <ChevronDown size={13} className="opacity-40" />
                  </button>

                  <div className="nav-dropdown">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn("nav-dropdown-item", active && "active")}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
                          {item.label}
                          {active && <div className="nav-indicator" aria-hidden="true" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="nav-tag hidden md:block">Vivah 2026 · Vadodara</span>
            <div className="sky-toggle-wrap">
              <SkyToggle />
            </div>
            <button
              type="button"
              className="nav-toggle lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen ? "true" : "false"}
              aria-controls="mobile-drawer"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile full-module drawer ─────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="nav-drawer-overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <nav id="mobile-drawer" className="nav-drawer">
            <div className="nav-drawer-header">
              <span className="nav-drawer-title">Navigate</span>
              <button
                type="button"
                className="nav-toggle"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {navGroups.map((group) => (
              <div key={group.group} className="py-2">
                <p className="nav-drawer-section">{group.group}</p>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn("nav-drawer-item", active && "active")}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={16} className={active ? "opacity-100" : "opacity-40"} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* ── Mobile bottom nav — designed for phone, not compressed (#07) ─── */}
      <nav className="mobile-bottom-nav lg:hidden" aria-label="Primary mobile navigation">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("mobile-nav-item", active && "active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => setDrawerOpen(true)}
          aria-label="More navigation options"
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
