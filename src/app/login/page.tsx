"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Flame } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params?.get("callbackUrl") ?? "/dashboard"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Invalid email or password.")
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "var(--purple)" }}>
            <Flame size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "2rem", color: "var(--ink)", fontWeight: 700 }}>
            Vivah
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Wedding Planning Platform</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.4rem", color: "var(--ink)", marginBottom: "1.5rem", fontWeight: 600 }}>
            Sign in to continue
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--ink)" }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", "--tw-ring-color": "var(--purple)" } as React.CSSProperties}
                placeholder="planner@vivah.app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--ink)" }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", "--tw-ring-color": "var(--purple)" } as React.CSSProperties}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60 mt-2"
              style={{ background: "var(--purple)" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
            Contact the wedding planner for access credentials.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
