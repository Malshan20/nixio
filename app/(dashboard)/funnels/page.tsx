"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Email { subject: string; preview: string; body: string }
interface FunnelData {
  headline: string
  subheadline: string
  heroDescription: string
  offer: string
  pricing: string
  urgencyTrigger: string
  cta: string
  socialProof: { name?: string; quote: string }[]
  emailSequence: Email[]
}

export default function FunnelsPage() {
  const [productName, setProductName] = useState("")
  const [audience, setAudience] = useState("")
  const [pricing, setPricing] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FunnelData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [openEmail, setOpenEmail] = useState<number | null>(0)

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)

    const prompt = `Product name: ${productName}\nTarget audience: ${audience}\nPricing: ${pricing}\n\nGenerate a complete marketing funnel.`

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "funnel", prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const jsonMatch = data.result.match(/\{[\s\S]*\}/)
      if (jsonMatch) setResult(JSON.parse(jsonMatch[0]))
      else throw new Error("Could not parse funnel data")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveFunnel() {
    if (!result) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("funnels").insert({
      user_id: user.id,
      product_name: productName,
      headline: result.headline,
      offer: result.offer,
      pricing_suggestion: result.pricing,
      cta: result.cta,
      email_sequence: result.emailSequence,
      raw_data: result,
    })
    setSaved(true)
    setSaving(false)
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Funnel Builder</h1>
        <p className="text-muted-foreground text-sm mt-1">Headlines, offers, pricing, CTAs, and a 5-email sequence — ready to launch.</p>
      </div>

      <form onSubmit={generate} className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product name</label>
            <input value={productName} onChange={e => setProductName(e.target.value)} required placeholder="e.g. Freelance Fast Track" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target audience</label>
            <input value={audience} onChange={e => setAudience(e.target.value)} required placeholder="e.g. Aspiring freelancers" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price point</label>
            <input value={pricing} onChange={e => setPricing(e.target.value)} required placeholder="e.g. $197 one-time" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
          </div>
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">{error}</div>}
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? <><span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Building funnel...</> : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5L12 6 8.5 7.5 7 11 5.5 7.5 2 6l3.5-1.5L7 1Z" fill="currentColor"/></svg>Build full funnel</>}
        </button>
      </form>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your funnel</h2>
            <button onClick={saveFunnel} disabled={saving || saved} className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm font-semibold hover:bg-accent/15 disabled:opacity-50 transition-colors">
              {saved ? "Saved!" : saving ? "Saving..." : "Save funnel"}
            </button>
          </div>

          {/* Hero section */}
          <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Headline</p>
                <p className="text-xl font-bold text-foreground leading-tight">{result.headline}</p>
              </div>
              <button onClick={() => copyText(result.headline)} className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Copy">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            </div>
            <p className="text-sm text-primary font-medium">{result.subheadline}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.heroDescription}</p>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Offer", value: result.offer },
              { label: "Urgency trigger", value: result.urgencyTrigger },
              { label: "CTA", value: result.cta },
              { label: "Pricing", value: result.pricing },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  </div>
                  <button onClick={() => copyText(item.value)} className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          {result.socialProof?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.socialProof.map((proof, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Testimonial {i + 1}</p>
                  <p className="text-sm text-foreground italic leading-relaxed">&ldquo;{proof.quote}&rdquo;</p>
                  {proof.name && <p className="text-xs text-primary mt-2 font-medium">— {proof.name}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Email sequence */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">5-Email Launch Sequence</h3>
            <div className="space-y-2">
              {result.emailSequence?.map((email, i) => (
                <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenEmail(openEmail === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 w-6 h-6 rounded-md flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{email.subject}</p>
                        <p className="text-xs text-muted-foreground">{email.preview}</p>
                      </div>
                    </div>
                    <svg className={`text-muted-foreground transition-transform ${openEmail === i ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {openEmail === i && (
                    <div className="px-5 pb-4 border-t border-border pt-3 animate-fade-in">
                      <div className="flex justify-end mb-2">
                        <button onClick={() => copyText(email.body)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.5"/></svg>
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{email.body}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
