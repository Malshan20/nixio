"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const FEATURES = [
  "10 AI-powered blueprint generations per month",
  "Full ebook, workbook, checklist, framework & sales PDFs",
  "Market validation + funnel builder",
  "Priority access to new features",
]

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const upgradeStatus = searchParams.get("upgrade")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
        setUserName(profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "")
      }
    }
    loadUser()
  }, [])

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID,
          source: "onboarding",
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("Could not create checkout session. Please try again.")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <span className="text-white font-black text-sm">N</span>
        </div>
        <span className="text-foreground font-bold text-xl tracking-tight">Nixio</span>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {userName && (
            <p className="text-sm font-medium text-primary mb-2">Welcome, {userName}!</p>
          )}
          <h1 className="text-3xl font-black text-foreground mb-3 text-balance">
            One last step to get started
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Start your <span className="font-semibold text-foreground">3-day free trial</span> — no charge today. Cancel anytime before the trial ends.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Plan header */}
          <div className="px-6 py-5 border-b border-border" style={{ background: "linear-gradient(135deg, #3730a3 0%, #6366f1 100%)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-bold text-lg">Starter Plan</span>
              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-2xl">$19.99</span>
                <span className="text-indigo-200 text-sm">/month</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: "rgba(255,255,255,0.18)", color: "#e0e7ff" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1l1.2 2.6H9l-2.3 1.7.9 2.7L5 6.5 2.4 8l.9-2.7L1 3.6h2.8L5 1Z" fill="currentColor"/>
              </svg>
              3-day free trial — starts today
            </div>
          </div>

          {/* Features */}
          <div className="px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">What you get</p>
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}/>
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Trial notice */}
          <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Free for 3 days.</span> Your card will be charged <span className="font-semibold text-foreground">$19.99/month</span> after the trial unless you cancel.
            </p>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6">
            {upgradeStatus === "error" && (
              <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                Payment could not be verified. Please try again.
              </div>
            )}
            {error && (
              <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Redirecting to checkout...
                </span>
              ) : (
                "Start free trial — $0 today"
              )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground mt-3">
              Secured by Polar · Cancel anytime during trial · No surprise charges
            </p>
          </div>
        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Already subscribed?{" "}
          <a href="/auth/login" className="text-primary hover:underline font-medium">Sign in</a>
        </p>
      </div>
    </div>
  )
}
