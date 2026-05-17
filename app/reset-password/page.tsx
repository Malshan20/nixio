"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    // After reset-callback exchanges the code, the user has an active session here
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      } else {
        // Fallback: listen for auth state change in case session is still settling
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
            setSessionReady(true)
            subscription.unsubscribe()
          }
        })
      }
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push("/auth/login"), 3000)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Password updated</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your password has been changed successfully. Redirecting you to login&hellip;
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-6 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity text-center"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Verifying your reset link&hellip;</p>
          <p className="text-muted-foreground text-xs mt-3">
            Link expired or invalid?{" "}
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Request a new one
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="text-foreground font-semibold text-xl tracking-tight">Nixio</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Set new password</h1>
          <p className="text-muted-foreground text-sm">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5Z" stroke="currentColor" strokeWidth="1.25"/>
                    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5Z" stroke="currentColor" strokeWidth="1.25"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25"/>
                  </svg>
                )}
              </button>
            </div>
            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      background: password.length >= i * 3
                        ? password.length < 6 ? "#ef4444"
                          : password.length < 10 ? "#f59e0b"
                          : "#22c55e"
                        : "var(--border)"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="confirm">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5Z" stroke="currentColor" strokeWidth="1.25"/>
                    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5Z" stroke="currentColor" strokeWidth="1.25"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25"/>
                  </svg>
                )}
              </button>
            </div>
            {confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password !== confirm || password.length < 8}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>

      </div>
    </div>
  )
}
