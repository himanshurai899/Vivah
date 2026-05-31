import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { VivahFooter } from "@/components/ui/motion-footer"
import { ToastProvider } from "@/components/ui/Toast"
import { NavigationProgress } from "@/components/ui/NavigationProgress"
import { GradientBackground } from "@/components/ui/gradient-background"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { ArkToastRegion } from "@/components/ui/basic-toast"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Vivah — Wedding Planning Platform",
    template: "%s | Vivah",
  },
  description:
    "Complete wedding planning platform for Himanshu & Savitri's traditional Bihari wedding on 25 November 2026 in Vadodara, Gujarat. Manage guests, vendors, rituals, finance, and more.",
  keywords: ["wedding planning", "Bihari wedding", "Vadodara", "Indian wedding", "vivah"],
  authors: [{ name: "Himanshu" }],
  creator: "Vivah Platform",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/icons/favicon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Vivah — Wedding Planning Platform",
    description: "One platform to plan the entire wedding journey.",
    siteName: "Vivah",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7C3AED",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <ArkToastRegion />
            <NavigationProgress />
            <GradientBackground className="min-h-screen">
              <a href="#main-content" className="skip-nav">
                Skip to main content
              </a>
              <Navbar />
              <main id="main-content" className="app-main">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
                  {children}
                </div>
              </main>
              <VivahFooter />
            </GradientBackground>
          </ToastProvider>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
