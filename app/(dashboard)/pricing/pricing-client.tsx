"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "19.99",
    trial: "3-day free trial",
    description: "Perfect for creators validating ideas and building products consistently.",
    productId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID || "",
    highlight: false,
    features: [
      "10 blueprint generations / month",
      "Full product architecture",
      "Content outlines & lesson scripts",
      "Launch funnel builder",
      "PDF export & in-app viewer",
      "Blueprint history",
      "Email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "49.99",
    trial: "3-day free trial",
    description: "Unlimited power for solopreneurs shipping multiple products.",
    productId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || "",
    highlight: true,
    features: [
      "Unlimited blueprint generations",
      "Everything in Starter",
      "Priority AI processing",
      "Branded PDF downloads",
      "Early access to new features",
      "Prioritized support",
      "API access (coming soon)",
    ],
  },
]

const faqItems = [
  {
    q: "What counts as a generation?",
    a: "Each time you click Synthesize to build a full blueprint from your input, that counts as one generation. Viewing or re-downloading existing blueprints does not.",
  },
  {
    q: "How does the 3-day free trial work?",
    a: "You get full access to your chosen plan for 3 days — no restrictions. No charge until the trial ends. Cancel before then and pay nothing.",
  },
  {
    q: "Can I upgrade from Starter to Pro?",
    a: "Yes. Cancel your Starter plan and subscribe to Pro anytime. Your blueprints are always saved to your account regardless of plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel from your Polar billing dashboard at any time. Access continues until the end of your billing period.",
  },
  {
    q: "Is my data secure?",
    a: "All data is stored with Row Level Security — only you can access your blueprints and account data. Nothing is shared or used for model training.",
  },
]

export default function PricingClient({ currentPlan }: { currentPlan: string | null }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleCheckout(productId: string) {
    if (!productId) return
    setLoadingId(productId)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/auth/sign-up"; return }

      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        alert("Something went wrong. Please try again.")
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-balance">Upgrade your plan</h1>
        <p className="text-muted-foreground text-sm sm:text-base">3-day free trial on all plans. Cancel anytime.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key
          const isLoading = loadingId === plan.productId

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-5 sm:p-6 transition-all ${
                plan.highlight
                  ? "border-primary bg-white shadow-lg ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30"
              } ${isCurrentPlan ? "opacity-60" : ""}`}
            >
              {/* Most Popular badge */}
              {plan.highlight && !isCurrentPlan && (
                <div className="absolute -top-3 left-5">
                  <span className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-md">Most Popular</span>
                </div>
              )}

              {/* Current plan badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-5">
                  <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-bold shadow-sm">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? "text-primary" : "text-foreground"}`}>${plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">/month</span>
                </div>
                {!isCurrentPlan && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    <span className="text-xs font-semibold text-green-600">{plan.trial}</span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 mt-0.5">
                      <path d="M2.5 7.5l3.5 3.5 6.5-7" stroke={isCurrentPlan ? "#94a3b8" : "#5b6af9"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button — blurred + disabled for current plan */}
              {isCurrentPlan ? (
                <div className="relative">
                  <button
                    disabled
                    aria-disabled="true"
                    className={`w-full py-3 rounded-xl text-sm font-bold select-none cursor-not-allowed blur-[2px] pointer-events-none ${
                      plan.highlight
                        ? "bg-primary text-white"
                        : "bg-secondary text-foreground border border-border"
                    }`}
                  >
                    Start 3-day free trial
                  </button>
                  {/* overlay label */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                    <span className="bg-background/90 border border-border text-xs font-bold text-muted-foreground px-3 py-1.5 rounded-lg shadow-sm">
                      Already subscribed
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.productId)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 cursor-pointer ${
                    plan.highlight
                      ? "bg-primary text-white hover:opacity-90 shadow-md"
                      : "bg-secondary text-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {isLoading ? "Redirecting..." : "Start 3-day free trial"}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Guarantee */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100 mb-10 sm:mb-12">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
          <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15.5l-5 2.5 1-5.5-4-4 5.5-1L10 2Z" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-800">Cancel anytime, no questions asked</p>
          <p className="text-xs text-green-700 mt-0.5">Try any plan free for 3 days. Cancel before the trial ends and you pay nothing.</p>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4">Common questions</h2>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">{item.q}</span>
                <span className={`shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3 animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
