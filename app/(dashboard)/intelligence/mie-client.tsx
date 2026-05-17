"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────
interface MarketGap { title: string; description: string; opportunityScore: number }
interface WinningFormat { format: string; share: number; avgRevenue: string }
interface Product { rank: number; name: string; category: string; price: string; rating: string | number; members: number | null; creator: string; description: string; url: string; whyItWins?: string }
interface MarketData {
  niche: string; demandScore: number; competitionLevel: string; competitionScore: number
  revenuePotential: string; revenuePotentialScore: number; marketMaturity: string
  totalActiveProducts: number; avgPrice: string; priceRange: { min: string; max: string }
  topCategories: string[]; trending: boolean; trendDirection: string; trendPercentage: number
  buyerPersona: string; painPoints: string[]; winningFormats: WinningFormat[]
  gaps: MarketGap[]; topKeywords: string[]; aiVerdict: string; winningAngle: string
  estimatedTimeToFirstSale: string; recommendedEntryPrice: string
  products: Product[]; scrapedAt: string; cached: boolean
  dataSource: string; scrapedProductCount: number
}

type Step = "search" | "analyzing" | "results" | "generating" | "blueprint"

const TRENDING_NICHES = [
  "AI tools for creators", "Notion templates", "Fitness for busy moms",
  "Copywriting", "Day trading", "Faceless YouTube", "Print on demand",
  "UGC content creation", "Digital marketing for restaurants", "Crypto for beginners",
]

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color = "#00d4ff", size = 80 }: { score: number; label: string; color?: string; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ display: "block" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground" style={{ fontSize: size * 0.22 }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const rankColors = ["#f59e0b", "#94a3b8", "#b45309", "#64748b"]
  const rankColor = rankColors[Math.min(product.rank - 1, 3)]
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex gap-3 hover:border-primary/30 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
        style={{ background: `${rankColor}22`, color: rankColor }}>
        {product.rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
          <span className="text-primary font-bold text-sm flex-shrink-0">{product.price}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground">{product.creator}</span>
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b"><polygon points="5,1 6.2,3.8 9.5,4 7.1,6.1 7.9,9.5 5,7.8 2.1,9.5 2.9,6.1 0.5,4 3.8,3.8"/></svg>
            <span className="text-xs text-muted-foreground">{Number(product.rating).toFixed(1)}</span>
          </div>
          {product.members && <span className="text-xs text-muted-foreground">{Number(product.members).toLocaleString()} members</span>}
        </div>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{product.description}</p>
        )}
        {product.whyItWins && (
          <p className="text-xs text-primary/80 mt-1 leading-relaxed italic">{product.whyItWins}</p>
        )}
      </div>
    </div>
  )
}

// ─── Gap Card ─────────────────────────────────────────────────────────────────
function GapCard({ gap, onSelect, selected }: { gap: MarketGap; onSelect: () => void; selected: boolean }) {
  const scoreColor = gap.opportunityScore >= 80 ? "#10b981" : gap.opportunityScore >= 60 ? "#f59e0b" : "#94a3b8"
  return (
    <button onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/30"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: scoreColor }} />
            <p className="font-semibold text-sm text-foreground">{gap.title}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{gap.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold" style={{ color: scoreColor }}>{gap.opportunityScore}</div>
          <div className="text-xs text-muted-foreground">Opportunity</div>
        </div>
      </div>
      {selected && (
        <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,6 5,9 10,3"/></svg>
          Selected — generate blueprint from this angle
        </div>
      )}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MarketIntelligenceClient({ history }: { history: any[] }) {
  const [step, setStep] = useState<Step>("search")
  const [niche, setNiche] = useState("")
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [selectedGap, setSelectedGap] = useState<MarketGap | null>(null)
  const [blueprint, setBlueprint] = useState<any>(null)
  const [assetId, setAssetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisLog, setAnalysisLog] = useState<string[]>([])
  const [genLog, setGenLog] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleAnalyze(query?: string, forceRefresh?: boolean) {
    const target = (query || niche).trim()
    if (!target) return
    if (query) setNiche(query)
    setError(null)
    setStep("analyzing")
    setAnalysisLog([])
    setMarketData(null)

    const logs = [
      `Searching Whop marketplace for "${target}"...`,
      "Attempting live Whop category scrape...",
      "Feeding real product signals to AI...",
      "Analyzing competition + pricing dynamics...",
      "Identifying underserved market gaps...",
      "Running full AI market verdict...",
      "Building intelligence report...",
    ]
    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setAnalysisLog(prev => [...prev, logs[i]])
    }

    try {
      const res = await fetch("/api/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: target, forceRefresh: !!forceRefresh }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed")
      setMarketData(data)
      setStep("results")
    } catch (e: any) {
      setError(e.message)
      setStep("search")
    }
  }

  async function handleGenerate() {
    if (!marketData) return
    setError(null)
    setStep("generating")
    setGenLog([])

    const logs = [
      "Injecting live market intelligence into AI...",
      "Analyzing winning product formats...",
      "Engineering market-beating positioning...",
      "Building product architecture...",
      "Writing sample lesson content...",
      "Crafting market-aware funnel...",
      "Finalizing blueprint...",
    ]
    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 700))
      setGenLog(prev => [...prev, logs[i]])
    }

    try {
      const res = await fetch("/api/market-intelligence/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: marketData.niche, marketData, angle: selectedGap?.title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setBlueprint(data.blueprint)
      setAssetId(data.assetId)
      setStep("blueprint")
    } catch (e: any) {
      setError(e.message)
      setStep("results")
    }
  }

  function handleReset() {
    setStep("search"); setNiche(""); setMarketData(null)
    setSelectedGap(null); setBlueprint(null); setAssetId(null); setError(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Step: Search ──────────────────────────────────────────────────────────
  if (step === "search") return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live Marketplace Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Marketplace Intelligence<br />
            <span className="text-primary">Engine</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Scan live Whop marketplace data, identify untapped gaps, and generate a market-validated product blueprint in minutes.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl -z-10" />
          <div className="flex gap-3 p-2 rounded-2xl border border-border bg-card/80 backdrop-blur">
            <div className="flex-1 flex items-center gap-3 px-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-muted-foreground flex-shrink-0">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input ref={inputRef} value={niche} onChange={e => setNiche(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                placeholder="Enter a niche, topic, or idea (e.g. 'AI tools for freelancers')"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base focus:outline-none py-3" />
            </div>
            <button onClick={() => handleAnalyze()}
              disabled={!niche.trim()}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-all flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2L8.5 14.5L7 9L2 7.5Z"/></svg>
              Analyze Market
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {/* Trending */}
        <div className="mb-12">
          <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Trending niches</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_NICHES.map(n => (
              <button key={n} onClick={() => handleAnalyze(n)}
                className="px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-xs hover:border-primary/50 hover:text-foreground transition-colors">
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Recent analyses</p>
            <div className="space-y-2">
              {history.slice(0, 5).map(h => (
                <button key={h.id} onClick={() => handleAnalyze(h.niche_query)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                        <circle cx="5.5" cy="5.5" r="3.5"/><path d="M9 9L12.5 12.5"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{h.niche_query}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground"><path d="M5 3l4 4-4 4"/></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── Step: Analyzing ───────────────────────────────────────────────────────
  if (step === "analyzing") return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-primary animate-spin" style={{ animationDuration: "3s" }}>
            <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="40 50" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Scanning Marketplace</h2>
        <p className="text-muted-foreground mb-8 text-sm">Pulling live data from Whop and running AI analysis on <span className="text-primary font-medium">"{niche}"</span></p>
        <div className="space-y-3 text-left">
          {analysisLog.map((log, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#10b981" strokeWidth="1.8"><polyline points="2,7 5.5,10.5 12,3"/></svg>
              <span className="text-sm text-foreground">{log}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
            <span className="text-sm text-primary font-medium">Processing...</span>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step: Generating ──────────────────────────────────────────────────────
  if (step === "generating") return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-primary">
            <path d="M18 4L22 14H32L24 20L27 31L18 25L9 31L12 20L4 14H14L18 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Generating Blueprint</h2>
        <p className="text-muted-foreground mb-8 text-sm">AI is using live market intelligence to build your market-validated product blueprint.</p>
        <div className="space-y-3 text-left">
          {genLog.map((log, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#10b981" strokeWidth="1.8"><polyline points="2,7 5.5,10.5 12,3"/></svg>
              <span className="text-sm text-foreground">{log}</span>
            </div>
          ))}
          {genLog.length < 7 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
              <span className="text-sm text-primary font-medium">Working on it...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Step: Blueprint ───────────────────────────────────────────────────────
  if (step === "blueprint" && blueprint) return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStep("results")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3L5 8L10 13"/></svg>
            Back to market data
          </button>
          <div className="flex items-center gap-3">
            {assetId && (
              <Link href={`/blueprints`}
                className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:border-primary/30 transition-colors">
                View in Blueprints
              </Link>
            )}
            <button onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              New Analysis
            </button>
          </div>
        </div>

        {/* Market Edge Banner */}
        {blueprint.marketEdge && (
          <div className="mb-8 px-5 py-4 rounded-xl border border-primary/30 bg-primary/5 flex gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary flex-shrink-0 mt-0.5">
              <path d="M10 2L12.4 7.6H18.5L13.7 11.2L15.6 17L10 13.6L4.4 17L6.3 11.2L1.5 7.6H7.6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Market Edge</p>
              <p className="text-sm text-foreground leading-relaxed">{blueprint.marketEdge}</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{blueprint.title}</h1>
          <p className="text-lg text-muted-foreground">{blueprint.tagline}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">Demand: {blueprint.idea.demandScore}/100</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">MIE Generated</span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">{blueprint.product.pricingTier?.core} Core Price</span>
          </div>
        </div>

        {/* Sections grid */}
        <div className="space-y-6">
          {/* Idea */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</span>
              Validated Opportunity
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Problem</p>
                <p className="text-sm text-foreground leading-relaxed">{blueprint.idea.problem}</p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Solution</p>
                <p className="text-sm text-foreground leading-relaxed">{blueprint.idea.solution}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Unique Value Zone</p>
              <p className="text-sm text-foreground leading-relaxed">{blueprint.idea.uniqueValueZone}</p>
            </div>
          </div>

          {/* Product */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</span>
              Product Architecture
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-background border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Starter</p>
                <p className="text-xl font-bold text-foreground">{blueprint.product.pricingTier?.starter}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/30 text-center">
                <p className="text-xs text-primary mb-1">Core</p>
                <p className="text-xl font-bold text-primary">{blueprint.product.pricingTier?.core}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                <p className="text-xs text-amber-400 mb-1">Premium</p>
                <p className="text-xl font-bold text-foreground">{blueprint.product.pricingTier?.premium}</p>
              </div>
            </div>
            <div className="space-y-3">
              {(blueprint.product.modules || []).map((m: any) => (
                <div key={m.number} className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">{m.number}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.goal}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 divide-y divide-border">
                    {(m.lessons || []).slice(0, 3).map((l: any, li: number) => (
                      <div key={li} className="py-2 text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        {l.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funnel */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</span>
              Market-Aware Funnel
            </h2>
            <div className="p-4 rounded-xl bg-background border border-border mb-4">
              <p className="text-xl font-bold text-foreground mb-1">{blueprint.funnel?.headline}</p>
              <p className="text-sm text-muted-foreground">{blueprint.funnel?.subheadline}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(blueprint.funnel?.emailSequence || []).map((e: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-background border border-border">
                  <p className="text-xs font-bold text-primary mb-1">Day {e.day}</p>
                  <p className="text-sm font-medium text-foreground mb-1">{e.subject}</p>
                  <p className="text-xs text-muted-foreground italic">&ldquo;{e.hook}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step: Results ─────────────────────────────────────────────────────────
  if (step === "results" && marketData) return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3L5 8L10 13"/></svg>
              New search
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">{marketData.niche}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                marketData.dataSource === "whop-scraped+ai-enriched"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-primary/30 bg-primary/5 text-primary"
              }`}>
                {marketData.dataSource === "whop-scraped+ai-enriched"
                  ? `Whop live data (${marketData.scrapedProductCount} scraped)`
                  : "AI market knowledge"}
              </span>
              {marketData.cached && (
                <button
                  onClick={() => handleAnalyze(marketData.niche, true)}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Cached — refresh
                </button>
              )}
            </div>
          </div>
          <button onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L7.5 13.5L6.2 8.2L1 6.8Z"/></svg>
            Generate Blueprint{selectedGap ? " from Selected Gap" : ""}
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {/* Score rings */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{marketData.niche} Market</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{marketData.marketMaturity} market &mdash; {marketData.totalActiveProducts?.toLocaleString()} active products</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              marketData.trendDirection === "up" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                {marketData.trendDirection === "up" ? <path d="M2 9L6 3L10 9"/> : <path d="M2 3L6 9L10 3"/>}
              </svg>
              {marketData.trendPercentage}% trending {marketData.trendDirection}
            </div>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-6">
            <ScoreRing score={marketData.demandScore} label="Market Demand" color="#00d4ff" size={90} />
            <ScoreRing score={100 - marketData.competitionScore} label="Low Competition" color="#10b981" size={90} />
            <ScoreRing score={marketData.revenuePotentialScore || 75} label="Revenue Potential" color="#f59e0b" size={90} />
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">{marketData.recommendedEntryPrice}</span>
                <span className="text-xs text-muted-foreground mt-1">Recommended entry</span>
              </div>
              <span className="text-xs text-muted-foreground text-center">Range: {marketData.priceRange?.min}–{marketData.priceRange?.max}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Avg Product Price" value={marketData.avgPrice} sub="Market average" />
          <StatCard label="Time to First Sale" value={marketData.estimatedTimeToFirstSale} sub="Estimated" />
          <StatCard label="Competition" value={marketData.competitionLevel} sub={`${marketData.competitionScore}/100`} />
                <StatCard label="Revenue Potential" value={marketData.revenuePotential || (marketData as any).revenuePotenial} sub="Assessment" accent />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Winning formats */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Winning Formats</h3>
            <div className="space-y-3">
              {(marketData.winningFormats || []).map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-medium">{f.format}</span>
                    <span className="text-xs text-muted-foreground">{f.avgRevenue}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${f.share}%` }} />
                  </div>
                  <div className="text-right mt-0.5"><span className="text-xs text-muted-foreground">{f.share}%</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Pain points */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Buyer Pain Points</h3>
            <div className="space-y-2 mb-4">
              {(marketData.painPoints || []).map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0 mt-1.5" />
                  <p className="text-xs text-foreground leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">{marketData.buyerPersona}</p>
          </div>

          {/* Keywords */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Top Keywords</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(marketData.topKeywords || []).map((kw, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full border border-border bg-background text-xs text-foreground">{kw}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
              {(marketData.topCategories || []).map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Verdict */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
              <path d="M9 2L11 7.4H17L12.3 10.6L14 16L9 12.8L4 16L5.7 10.6L1 7.4H7L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Market Verdict</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-3">{marketData.aiVerdict}</p>
          <div className="px-4 py-3 rounded-xl bg-background border border-primary/20">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Winning Angle</p>
            <p className="text-sm text-foreground font-medium">{marketData.winningAngle}</p>
          </div>
        </div>

        {/* Market Gaps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Market Gaps — Select One to Target</h3>
            {selectedGap && (
              <button onClick={() => setSelectedGap(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear selection</button>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {(marketData.gaps || []).map((gap, i) => (
              <GapCard key={i} gap={gap} selected={selectedGap?.title === gap.title}
                onSelect={() => setSelectedGap(selectedGap?.title === gap.title ? null : gap)} />
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Top Products on Whop
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {(marketData.products || []).map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Ready to enter this market?</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Generate a fully market-validated product blueprint using live intelligence — priced, positioned, and built to win.
          </p>
          <button onClick={handleGenerate}
            className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-all inline-flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 2L9 16.5L7.5 10L1 8.5Z"/></svg>
            Generate Market-Validated Blueprint
          </button>
        </div>
      </div>
    </div>
  )

  return null
}
