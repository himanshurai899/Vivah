"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  Users,
  Store,
  DollarSign,
  CalendarDays,
  ListChecks,
  MapPin,
  ArrowUp,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Agni-Jal + Bihari wedding ornament token bridge ───────────────────────
const STYLES = `
/* ── Light mode pill tokens ── */
.vivah-footer-wrapper {
  font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1:            rgba(15,6,18,0.06);
  --pill-bg-2:            rgba(15,6,18,0.03);
  --pill-shadow:          rgba(15,6,18,0.14);
  --pill-highlight:       rgba(201,168,76,0.18);
  --pill-inset-shadow:    rgba(250,250,248,0.70);
  --pill-border:          rgba(15,6,18,0.14);
  --pill-text:            #0F0612;
  --pill-text-muted:      #5B4A6E;
  --pill-text-faint:      #9987AE;

  --pill-bg-1-hover:      rgba(124,58,237,0.10);
  --pill-bg-2-hover:      rgba(124,58,237,0.05);
  --pill-border-hover:    rgba(124,58,237,0.35);
  --pill-shadow-hover:    rgba(124,58,237,0.20);
  --pill-highlight-hover: rgba(201,168,76,0.28);
}

/* ── Dark mode pill tokens ── */
.dark .vivah-footer-wrapper {
  --pill-bg-1:            rgba(240,235,247,0.07);
  --pill-bg-2:            rgba(240,235,247,0.03);
  --pill-shadow:          rgba(0,0,0,0.35);
  --pill-highlight:       rgba(201,168,76,0.18);
  --pill-inset-shadow:    rgba(255,255,255,0.06);
  --pill-border:          rgba(201,168,76,0.20);
  --pill-text:            #F0EBF7;
  --pill-text-muted:      #B8A8D4;
  --pill-text-faint:      #7D6E99;

  --pill-bg-1-hover:      rgba(124,58,237,0.18);
  --pill-bg-2-hover:      rgba(124,58,237,0.10);
  --pill-border-hover:    rgba(201,168,76,0.40);
  --pill-shadow-hover:    rgba(201,168,76,0.15);
  --pill-highlight-hover: rgba(201,168,76,0.30);
}

/* ── Keyframes ── */
@keyframes vivah-footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.45; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.80; }
}
@keyframes vivah-footer-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes vivah-footer-heartbeat {
  0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 4px rgba(201,168,76,0.45)); }
  15%, 45% { transform: scale(1.30); filter: drop-shadow(0 0 12px rgba(201,168,76,0.90)); }
  30%      { transform: scale(1); }
}
@keyframes vivah-petal-drift {
  0%   { transform: translateY(0) rotate(0deg);   opacity: 0.6; }
  50%  { transform: translateY(-8px) rotate(8deg); opacity: 1; }
  100% { transform: translateY(0) rotate(0deg);   opacity: 0.6; }
}
@keyframes vivah-divider-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.vivah-footer-breathe   { animation: vivah-footer-breathe  10s ease-in-out infinite alternate; }
.vivah-footer-marquee   { animation: vivah-footer-marquee  50s linear infinite; }
.vivah-footer-heartbeat { animation: vivah-footer-heartbeat 2.4s cubic-bezier(0.25,1,0.5,1) infinite; }
.vivah-petal-drift      { animation: vivah-petal-drift 4s ease-in-out infinite; }

/* ── Paisley/rangoli grid background ── */
.vivah-footer-grid {
  background-size: 48px 48px;
  background-image:
    radial-gradient(circle, rgba(201,168,76,0.07) 1px, transparent 1px),
    radial-gradient(circle, rgba(124,58,237,0.04) 1px, transparent 1px);
  background-position: 0 0, 24px 24px;
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

/* ── Aurora — saffron + marigold + purple glow ── */
.vivah-footer-aurora {
  background: radial-gradient(
    ellipse at 40% 60%,
    rgba(201,168,76,0.14) 0%,
    rgba(124,58,237,0.12) 35%,
    rgba(226,135,67,0.06) 60%,
    transparent 75%
  );
}

/* ── Secondary aurora (gold side) ── */
.vivah-footer-aurora-2 {
  background: radial-gradient(
    ellipse at 70% 30%,
    rgba(201,168,76,0.10) 0%,
    rgba(226,135,67,0.06) 40%,
    transparent 65%
  );
}

/* ── Glass pill ── */
.vivah-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 8px 24px -8px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.vivah-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 16px 36px -8px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--purple);
}

/* ── Giant VIVAH background text — Cormorant editorial ── */
.vivah-footer-bg-text {
  font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
  font-size: 23vw;
  line-height: 0.72;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(201,168,76,0.09);
  background: linear-gradient(
    180deg,
    rgba(124,58,237,0.09) 0%,
    rgba(201,168,76,0.06) 50%,
    transparent 70%
  );
  -webkit-background-clip: text;
  background-clip: text;
}

/* ── Metallic couple heading ── */
.vivah-footer-heading {
  font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
  background: linear-gradient(
    145deg,
    var(--ink) 0%,
    rgba(124,58,237,0.80) 45%,
    var(--gold) 80%,
    rgba(226,135,67,0.90) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 32px rgba(124,58,237,0.18));
}

/* ── Gold shimmer divider ── */
.vivah-shimmer-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201,168,76,0.20) 20%,
    rgba(201,168,76,0.70) 50%,
    rgba(201,168,76,0.20) 80%,
    transparent
  );
  background-size: 200% 100%;
  animation: vivah-divider-shimmer 3s linear infinite;
}

/* ── Ornamental top border (temple arch motif) ── */
.vivah-footer-top-border {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201,168,76,0.15) 15%,
    rgba(201,168,76,0.50) 50%,
    rgba(201,168,76,0.15) 85%,
    transparent 100%
  );
  height: 1px;
}

/* ── Devanagari tagline ── */
.vivah-tagline-script {
  font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  letter-spacing: 0.04em;
}
`;

// ── Magnetic wrapper ───────────────────────────────────────────────────────
export type MagneticProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const Magnetic = React.forwardRef<HTMLElement, MagneticProps>(
  ({ className, children, as: Tag = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = localRef.current;
      if (!el) return;

      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, {
            x: x * 0.32,
            y: y * 0.32,
            rotationX: -y * 0.10,
            rotationY: x * 0.10,
            scale: 1.04,
            ease: "power2.out",
            duration: 0.35,
          });
        };
        const onLeave = () => {
          gsap.to(el, {
            x: 0, y: 0,
            rotationX: 0, rotationY: 0,
            scale: 1,
            ease: "elastic.out(1,0.3)",
            duration: 1.1,
          });
        };
        el.addEventListener("mousemove", onMove as EventListener);
        el.addEventListener("mouseleave", onLeave);
        return () => {
          el.removeEventListener("mousemove", onMove as EventListener);
          el.removeEventListener("mouseleave", onLeave);
        };
      }, el);

      return () => ctx.revert();
    }, []);

    return (
      <Tag
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Magnetic.displayName = "Magnetic";

// ── Marquee — Bihari wedding ceremonies with Sanskrit ─────────────────────
const RITUALS = [
  { en: "Tilak Ceremony",   hi: "तिलक" },
  { en: "Matkor Puja",      hi: "मटकोर" },
  { en: "Haldi Ritual",     hi: "हल्दी" },
  { en: "Mehendi Night",    hi: "मेहँदी" },
  { en: "Mandap Decoration",hi: "मंडप" },
  { en: "Saat Phere",       hi: "सात फेरे" },
  { en: "Sindoor Daan",     hi: "सिंदूर दान" },
  { en: "Vidaai",           hi: "विदाई" },
];

const MarqueeStrip = () => (
  <div className="flex items-center gap-8 px-6 whitespace-nowrap">
    {RITUALS.map((r, i) => (
      <React.Fragment key={i}>
        <span className="flex items-center gap-2">
          <span style={{ color: "var(--gold)", opacity: 0.6, fontSize: "0.75em" }}>
            {r.hi}
          </span>
          <span>{r.en}</span>
        </span>
        <span style={{ color: "var(--gold)", opacity: 0.5 }} aria-hidden>✦</span>
      </React.Fragment>
    ))}
  </div>
);

// ── Nav quick links ────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/dashboard", icon: CalendarDays, label: "Dashboard" },
  { href: "/guests",    icon: Users,        label: "Guests"    },
  { href: "/finance",   icon: DollarSign,   label: "Finance"   },
  { href: "/vendors",   icon: Store,        label: "Vendors"   },
  { href: "/tasks",     icon: ListChecks,   label: "Tasks"     },
  { href: "/rituals",   icon: CalendarDays, label: "Rituals"   },
];

const LEGAL_LINKS = [
  { href: "/settings",       label: "Settings"   },
  { href: "/reports",        label: "Reports"    },
  { href: "/emergency",      label: "Emergency"  },
];

// ── Decorative lotus / petal ornament (pure CSS, no image) ────────────────
const LotusOrnament = () => (
  <div className="flex items-center justify-center gap-1 select-none pointer-events-none" aria-hidden>
    <span style={{ color: "var(--gold)", opacity: 0.35, fontSize: "0.65rem" }}>❧</span>
    <span style={{ color: "var(--gold)", opacity: 0.55, fontSize: "0.85rem" }}>✾</span>
    <span style={{ color: "var(--gold)", opacity: 0.75, fontSize: "1.1rem" }}>ॐ</span>
    <span style={{ color: "var(--gold)", opacity: 0.55, fontSize: "0.85rem" }}>✾</span>
    <span style={{ color: "var(--gold)", opacity: 0.35, fontSize: "0.65rem" }}>❧</span>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
export function VivahFooter() {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const bgTextRef   = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const sublineRef  = useRef<HTMLDivElement>(null);
  const linksRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Giant text parallax
      gsap.fromTo(
        bgTextRef.current,
        { y: "10vh", scale: 0.82, opacity: 0 },
        {
          y: "0vh", scale: 1, opacity: 1, ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 90%",
            end: "bottom bottom",
            scrub: 1.4,
          },
        }
      );
      // Staggered content reveal
      gsap.fromTo(
        [headingRef.current, sublineRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.10, ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 50%",
            end: "center bottom",
            scrub: 1.1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Curtain-reveal wrapper */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden vivah-footer-wrapper"
          style={{ background: "var(--ivory)", color: "var(--ink)" }}
        >
          {/* ── Dual aurora glow (purple + saffron) ── */}
          <div
            aria-hidden
            className="vivah-footer-aurora vivah-footer-breathe pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px] z-0"
          />
          <div
            aria-hidden
            className="vivah-footer-aurora-2 pointer-events-none absolute right-[-10%] bottom-[-10%] h-[50vh] w-[60vw] rounded-[50%] blur-[80px] z-0"
            style={{ opacity: 0.7 }}
          />

          {/* ── Paisley dot grid ── */}
          <div aria-hidden className="vivah-footer-grid pointer-events-none absolute inset-0 z-0" />

          {/* ── Giant VIVAH background text ── */}
          <div
            ref={bgTextRef}
            aria-hidden
            className="vivah-footer-bg-text pointer-events-none select-none absolute -bottom-[8vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0"
          >
            VIVAH
          </div>

          {/* ── Top ornamental border ── */}
          <div aria-hidden className="vivah-footer-top-border absolute top-0 left-0 w-full z-10" />

          {/* ── Diagonal marquee with ritual names ── */}
          <div
            aria-hidden
            className="absolute top-8 left-0 w-full overflow-hidden py-3 z-10 -rotate-[1.2deg] scale-[1.08]"
            style={{
              borderTop: "1px solid rgba(201,168,76,0.12)",
              borderBottom: "1px solid rgba(201,168,76,0.12)",
              background: "var(--ivory)",
              opacity: 0.9,
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="vivah-footer-marquee flex w-max text-[0.62rem] md:text-[0.7rem] font-semibold tracking-[0.22em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              <MarqueeStrip />
              <MarqueeStrip />
            </div>
          </div>

          {/* ── Centre content ── */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-28 w-full max-w-4xl mx-auto">

            {/* Lotus ornament above heading */}
            <LotusOrnament />

            {/* Shimmer divider */}
            <div className="vivah-shimmer-divider w-48 md:w-64 mt-3 mb-5" aria-hidden />

            {/* Couple heading */}
            <h2
              ref={headingRef}
              className="vivah-footer-heading text-5xl md:text-[5.5rem] font-bold tracking-tight text-center leading-none mb-2"
            >
              Himanshu ♥ Samiksha
            </h2>

            {/* Tagline */}
            <p
              className="vivah-tagline-script text-sm md:text-base mb-2 text-center"
              style={{ color: "var(--gold)", opacity: 0.85 }}
            >
              शुभ विवाह — Auspicious Union
            </p>

            {/* Venue line */}
            <div ref={sublineRef}>
              <p
                className="text-[0.65rem] md:text-xs tracking-widest uppercase mb-8 flex items-center gap-2"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}
              >
                <MapPin size={12} aria-hidden />
                25 November 2026 · Vadodara, Gujarat
              </p>
            </div>

            {/* Shimmer divider bottom */}
            <div className="vivah-shimmer-divider w-32 md:w-48 mb-7" aria-hidden />

            {/* Nav quick links */}
            <div ref={linksRef} className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-wrap justify-center gap-2.5 w-full">
                {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                  <Magnetic
                    key={href}
                    as={Link}
                    href={href}
                    className="vivah-glass-pill px-5 py-2.5 rounded-full font-medium text-xs md:text-sm flex items-center gap-2 group"
                    style={{ color: "var(--pill-text)" }}
                  >
                    <Icon
                      size={13}
                      aria-hidden
                      className="opacity-45 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--gold)" }}
                    />
                    {label}
                  </Magnetic>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 w-full">
                {LEGAL_LINKS.map(({ href, label }) => (
                  <Magnetic
                    key={href}
                    as={Link}
                    href={href}
                    className="vivah-glass-pill px-4 py-2 rounded-full text-[0.68rem] md:text-xs font-medium"
                    style={{ color: "var(--pill-text-muted)" }}
                  >
                    {label}
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12">
            {/* Top shimmer separator */}
            <div className="vivah-shimmer-divider w-full mb-6" aria-hidden />

            <div className="flex flex-col md:flex-row items-center justify-between gap-5">

              {/* Copyright */}
              <p
                className="text-[0.6rem] md:text-[0.68rem] font-semibold tracking-widest uppercase order-2 md:order-1"
                style={{ color: "var(--pill-text-faint)" }}
              >
                © 2026 Vivah Platform · All rights reserved
              </p>

              {/* "Made with love" badge */}
              <div
                className="vivah-glass-pill px-5 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default"
              >
                <span
                  className="text-[0.6rem] md:text-[0.68rem] font-semibold tracking-widest uppercase"
                  style={{ color: "var(--pill-text-faint)" }}
                >
                  Crafted with
                </span>
                <Heart
                  size={12}
                  aria-hidden
                  className="vivah-footer-heartbeat"
                  fill="var(--gold)"
                  style={{ color: "var(--gold)" }}
                />
                <span
                  className="text-[0.6rem] md:text-[0.68rem] font-semibold tracking-widest uppercase"
                  style={{ color: "var(--pill-text-faint)" }}
                >
                  for
                </span>
                <span
                  className="font-bold text-xs md:text-sm ml-0.5"
                  style={{ color: "var(--purple)", fontFamily: "var(--font-cormorant)" }}
                >
                  Himanshu & Samiksha
                </span>
              </div>

              {/* Back to top */}
              <Magnetic
                as="button"
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="vivah-glass-pill w-11 h-11 rounded-full flex items-center justify-center order-3 group"
                style={{ color: "var(--pill-text-muted)" }}
              >
                <ArrowUp
                  size={17}
                  aria-hidden
                  className="transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ color: "var(--purple)" }}
                />
              </Magnetic>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
