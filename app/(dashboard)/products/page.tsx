"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Module {
  moduleName: string
  description: string
  lessons: { lessonTitle: string; keyPoints: string[]; estimatedMinutes: number }[]
}

interface ProductData {
  productName: string
  tagline: string
  transformationBefore: string
  transformationAfter: string
  modules: Module[]
  pricingSuggestion: string
  bonusIdeas: string[]
}

export default function ProductsPage() {
  const [idea, setIdea] = useState("")
  const [audience, setAudience] = useState("")
  const [outcome, setOutcome] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [openModule, setOpenModule] = useState<number | null>(0)

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)

    const prompt = `Product idea: ${idea}\nTarget audience: ${audience}\nDesired transformation/outcome: ${outcome}\n\nGenerate a complete digital product structure.`

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "product", prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const jsonMatch = data.result.match(/\{[\s\S]*\}/)
      if (jsonMatch) setResult(JSON.parse(jsonMatch[0]))
      else throw new Error("Could not parse product structure")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveProduct() {
    if (!result) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("products").insert({
      user_id: user.id,
      name: result.productName,
      transformation_before: result.transformationBefore,
      transformation_after: result.transformationAfter,
      audience,
      desired_outcome: outcome,
      modules: result.modules,
      raw_data: result,
    })
    setSaved(true)
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Architect</h1>
        <p className="text-muted-foreground text-sm mt-1">Go from idea to a full course structure — modules, lessons, and frameworks.</p>
      </div>

      <form onSubmit={generate} className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product idea</label>
          <input value={idea} onChange={e => setIdea(e.target.value)} required placeholder="e.g. A course on freelance copywriting for beginners" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target audience</label>
            <input value={audience} onChange={e => setAudience(e.target.value)} required placeholder="e.g. 9-to-5 employees wanting to freelance" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Desired outcome</label>
            <input value={outcome} onChange={e => setOutcome(e.target.value)} required placeholder="e.g. Land first paying client in 30 days" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
          </div>
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">{error}</div>}
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? <><span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Architecting...</> : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5L12 6 8.5 7.5 7 11 5.5 7.5 2 6l3.5-1.5L7 1Z" fill="currentColor"/></svg>Build product structure</>}
        </button>
      </form>

      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="p-5 rounded-xl bg-card border border-primary/20 bg-primary/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{result.productName}</h2>
                <p className="text-sm text-primary mt-0.5 italic">{result.tagline}</p>
              </div>
              <button onClick={saveProduct} disabled={saving || saved} className="shrink-0 px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm font-semibold hover:bg-accent/15 disabled:opacity-50 transition-colors">
                {saved ? "Saved!" : saving ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-xs text-muted-foreground mb-1">Before</p>
                <p className="text-xs text-foreground leading-relaxed">{result.transformationBefore}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs text-accent mb-1">After</p>
                <p className="text-xs text-foreground leading-relaxed">{result.transformationAfter}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground">
                <span className="text-muted-foreground">Suggested price: </span>
                <span className="font-semibold text-accent">{result.pricingSuggestion}</span>
              </div>
              <div className="text-xs text-muted-foreground">{result.modules?.length} modules</div>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Course Modules</h3>
            {result.modules?.map((mod, i) => (
              <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => setOpenModule(openModule === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 w-6 h-6 rounded-md flex items-center justify-center">{i + 1}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{mod.moduleName}</p>
                      <p className="text-xs text-muted-foreground">{mod.lessons?.length} lessons</p>
                    </div>
                  </div>
                  <svg className={`text-muted-foreground transition-transform ${openModule === i ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {openModule === i && (
                  <div className="px-5 pb-4 border-t border-border space-y-3 pt-3 animate-fade-in">
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                    <div className="space-y-2">
                      {mod.lessons?.map((lesson, j) => (
                        <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{j + 1}.</span>
                          <div>
                            <p className="text-xs font-medium text-foreground">{lesson.lessonTitle}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {lesson.keyPoints?.map((pt, k) => (
                                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">{pt}</span>
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{lesson.estimatedMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bonuses */}
          {result.bonusIdeas?.length > 0 && (
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bonus Ideas</h3>
              <div className="flex flex-wrap gap-2">
                {result.bonusIdeas.map((b, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground">{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
