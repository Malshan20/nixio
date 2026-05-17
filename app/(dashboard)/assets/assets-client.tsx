"use client"

import { useState } from "react"
import { EbookPDF } from "@/components/nixio/pdf-renderers"
import { WorkbookPDF } from "@/components/nixio/pdf-renderers"
import { ChecklistPDF } from "@/components/nixio/pdf-renderers"
import { FrameworkPDF } from "@/components/nixio/pdf-renderers"
import { SalesPDF } from "@/components/nixio/pdf-renderers"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Blueprint {
  id: string
  name: string
  created_at: string
  content: any
}

interface PdfAsset {
  id: string
  type: "ebook" | "workbook" | "checklist" | "framework" | "sales"
  title: string
  content_json: any
  created_at: string
  blueprint_id: string | null
}

interface Props {
  blueprints: Blueprint[]
  pdfAssets: PdfAsset[]
}

// ─── PDF type meta ────────────────────────────────────────────────────────────

const PDF_TYPES = [
  {
    id: "ebook" as const,
    label: "Ebook",
    description: "Full product — modules, chapters, exercises",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fbbf24",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 3h8l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 3v4h4M6 9h8M6 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "workbook" as const,
    label: "Workbook",
    description: "Interactive exercises and action steps",
    accent: "#059669",
    bg: "#f0fdf4",
    border: "#34d399",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="5.5" cy="7" r="1" fill="currentColor"/>
        <circle cx="5.5" cy="10" r="1" fill="currentColor"/>
        <circle cx="5.5" cy="13" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "checklist" as const,
    label: "Checklist",
    description: "Quick actionable phases and tasks",
    accent: "#4f46e5",
    bg: "#f5f3ff",
    border: "#818cf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12M4 9h12M4 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 11l1.5 1.5L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "framework" as const,
    label: "Framework",
    description: "Proprietary method with acronym system",
    accent: "#0d9488",
    bg: "#f0fdfa",
    border: "#2dd4bf",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 3v7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "sales" as const,
    label: "Sales PDF",
    description: "Offer breakdown, value stack, pricing logic",
    accent: "#dc2626",
    bg: "#fff1f2",
    border: "#fca5a5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function AssetsClient({ blueprints, pdfAssets: initialPdfAssets }: Props) {
  const [pdfAssets, setPdfAssets] = useState<PdfAsset[]>(initialPdfAssets)
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(blueprints[0] || null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [viewing, setViewing] = useState<PdfAsset | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async (type: string) => {
    if (!selectedBlueprint) return
    setGenerating(type)
    setError(null)
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfType: type,
          blueprint: selectedBlueprint.content,
          assetId: selectedBlueprint.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      const newAsset: PdfAsset = {
        id: data.pdfAssetId,
        type: type as PdfAsset["type"],
        title: data.pdf.title || data.pdf.productName || selectedBlueprint.name,
        content_json: data.pdf,
        created_at: new Date().toISOString(),
        blueprint_id: selectedBlueprint.id,
      }
      setPdfAssets(prev => [newAsset, ...prev])
      setViewing(newAsset)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(null)
    }
  }

  const renderPdf = (asset: PdfAsset) => {
    switch (asset.type) {
      case "ebook":     return <EbookPDF data={asset.content_json} />
      case "workbook":  return <WorkbookPDF data={asset.content_json} />
      case "checklist": return <ChecklistPDF data={asset.content_json} />
      case "framework": return <FrameworkPDF data={asset.content_json} />
      case "sales":     return <SalesPDF data={asset.content_json} />
    }
  }

  const assetsByType = (type: string) => pdfAssets.filter(a => a.type === type && (!selectedBlueprint || a.blueprint_id === selectedBlueprint.id))

  if (viewing) {
    return (
      <div className="h-screen flex flex-col">
        {/* Back bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <button
            onClick={() => setViewing(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Assets
          </button>
          <div className="w-px h-4 bg-border" />
          <span className="text-sm font-semibold text-foreground truncate">{viewing.title}</span>
          <span className="text-xs text-muted-foreground capitalize ml-1">· {viewing.type}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderPdf(viewing)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">Assets</h1>
          <p className="text-sm text-muted-foreground">Generate premium PDF documents from your blueprints.</p>
        </div>

        {blueprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-muted-foreground">
                <path d="M4 2h10l6 6v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No blueprints yet</p>
            <p className="text-sm text-muted-foreground mb-4">Generate a blueprint first, then come back to create PDF assets.</p>
            <a href="/dashboard" className="text-sm font-semibold text-primary hover:underline">Go to Synthesizer</a>
          </div>
        ) : (
          <>
            {/* Blueprint selector */}
            <div className="mb-8">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Select Blueprint</p>
              <div className="flex flex-wrap gap-2">
                {blueprints.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBlueprint(b)}
                    className="px-3 py-2 rounded-xl text-sm font-medium transition-all border"
                    style={selectedBlueprint?.id === b.id ? {
                      background: "#5b6af9",
                      borderColor: "#5b6af9",
                      color: "#fff",
                    } : {
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* PDF type grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PDF_TYPES.map(type => {
                const existing = assetsByType(type.id)
                const isGenerating = generating === type.id
                return (
                  <div
                    key={type.id}
                    className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: type.border, background: type.bg }}
                  >
                    {/* Card header */}
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: type.accent, color: "#fff" }}>
                          {type.icon}
                        </div>
                        {existing.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: type.accent, color: "#fff" }}>
                            {existing.length} generated
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-foreground mb-0.5">{type.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{type.description}</div>
                    </div>

                    {/* Existing assets */}
                    {existing.length > 0 && (
                      <div className="px-5 pb-3">
                        <div className="space-y-1.5">
                          {existing.slice(0, 3).map(asset => (
                            <button
                              key={asset.id}
                              onClick={() => setViewing(asset)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors bg-white/70 hover:bg-white border"
                              style={{ borderColor: type.border }}
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: type.accent, flexShrink: 0 }}>
                                <path d="M2 8.5H1a.4.4 0 0 1-.4-.4V4.4A.4.4 0 0 1 1 4h10a.4.4 0 0 1 .4.4v3.7a.4.4 0 0 1-.4.4H10M2 4V1h8v3M2 6.5h8v4H2v-4Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-xs font-medium text-foreground truncate">{asset.title}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                                {new Date(asset.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generate button */}
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => generate(type.id)}
                        disabled={isGenerating || generating !== null}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                        style={{ background: type.accent, color: "#fff" }}
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
                              <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            {existing.length > 0 ? "Regenerate" : "Generate"} {type.label}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* All generated assets table */}
            {pdfAssets.filter(a => !selectedBlueprint || a.blueprint_id === selectedBlueprint.id).length > 0 && (
              <div className="mt-10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">All Generated Assets</p>
                <div className="rounded-2xl border border-border overflow-hidden bg-card">
                  {pdfAssets
                    .filter(a => !selectedBlueprint || a.blueprint_id === selectedBlueprint.id)
                    .map((asset, i, arr) => {
                      const meta = PDF_TYPES.find(t => t.id === asset.type)!
                      return (
                        <div
                          key={asset.id}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer"
                          style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                          onClick={() => setViewing(asset)}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.accent }}>
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{asset.title}</div>
                            <div className="text-xs text-muted-foreground capitalize">{asset.type}</div>
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            {new Date(asset.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground shrink-0">
                            <path d="M5 10l4-3-4-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
