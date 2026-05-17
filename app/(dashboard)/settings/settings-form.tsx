"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Props {
  userId: string
  email: string
  fullName: string
  plan: string
  generationsUsed: number
  generationsLimit: number
  polarCustomerId: string | null
  polarSubscriptionId: string | null
  memberSince: string | null
}

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pro:     { label: "Pro",     color: "#6366f1", bg: "#eff0ff", border: "#c7d2fe" },
  starter: { label: "Starter", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  free:    { label: "Free",    color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1" },
}

export function SettingsForm({
  userId, email, fullName, plan,
  generationsUsed, generationsLimit,
  polarCustomerId, polarSubscriptionId, memberSince,
}: Props) {
  const [name, setName] = useState(fullName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const usagePercent = Math.min(100, Math.round((generationsUsed / generationsLimit) * 100))
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.free
  const hasBilling = !!polarCustomerId

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", userId)
    if (error) setSaveError(error.message)
    else setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function openBillingPortal() {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const res = await fetch("/api/polar/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setPortalError(data.error || "Could not open billing portal. Try again.")
        return
      }
      window.location.href = data.url
    } catch {
      setPortalError("Could not open billing portal. Try again.")
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* ── Account ─────────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Full name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              value={email}
              disabled
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-muted-foreground text-sm cursor-not-allowed"
            />
          </div>
          {memberSince && (
            <p className="text-xs text-muted-foreground">
              Member since {new Date(memberSince).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
          {saveError && <p className="text-xs text-destructive">{saveError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* ── Plan & Usage ─────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Plan & Usage</h2>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: planMeta.color, background: planMeta.bg, borderColor: planMeta.border }}
          >
            {planMeta.label}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">AI generations this month</span>
            <span className="text-foreground font-semibold">
              {generationsUsed} / {plan === "pro" ? "Unlimited" : generationsLimit}
            </span>
          </div>
          {plan !== "pro" && (
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent >= 80 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>

        {plan === "free" && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 3.5L12 6 8.5 7.5 7 11 5.5 7.5 2 6l3.5-1.5L7 1Z" fill="currentColor"/>
            </svg>
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* ── Billing & Subscription ───────────────────────────────── */}
      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Billing & Subscription</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage payments, cancel, or update your subscription via the Polar portal.
            </p>
          </div>
          {/* Polar badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wide">POLAR</span>
          </div>
        </div>

        {hasBilling ? (
          <div className="space-y-4">
            {/* Subscription info row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary border border-border p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current plan</p>
                <p className="text-sm font-bold" style={{ color: planMeta.color }}>{planMeta.label}</p>
              </div>
              <div className="rounded-lg bg-secondary border border-border p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-sm font-semibold text-foreground">Active</p>
                </div>
              </div>
            </div>

            {polarSubscriptionId && (
              <div className="rounded-lg bg-secondary border border-border p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subscription ID</p>
                <p className="text-xs font-mono text-foreground truncate">{polarSubscriptionId}</p>
              </div>
            )}

            {/* What you can do in the portal */}
            <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In the billing portal you can</p>
              <ul className="space-y-1.5">
                {[
                  "View invoices and payment history",
                  "Update payment method (card, billing address)",
                  "Cancel or pause your subscription",
                  "Upgrade or switch plans",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <path d="M2.5 7l3 3 6-6" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {portalError && (
              <p className="text-xs text-destructive">{portalError}</p>
            )}

            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {portalLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                  Opening portal...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M1 6h14" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Manage Billing on Polar
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto opacity-40">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        ) : (
          /* No billing on file — not yet subscribed */
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1.5" y="4" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No active subscription</p>
              <p className="text-xs text-muted-foreground mt-0.5">Start a plan to unlock AI generations and billing management.</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-card border border-destructive/20 space-y-3">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <p className="text-xs text-muted-foreground">Deleting your account is permanent and cannot be undone.</p>
        <button className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-colors">
          Delete account
        </button>
      </div>

    </div>
  )
}
