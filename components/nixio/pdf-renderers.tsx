"use client"

import { useRef, useCallback } from "react"

// ─── Premium print engine ─────────────────────────────────────────────────────
// Opens a new window with full Google Fonts, A4 @page sizing, and print-color-adjust

function usePrint(ref: React.RefObject<HTMLDivElement | null>, pageTitle = "Nixio PDF") {
  return useCallback(() => {
    const el = ref.current
    if (!el) return
    const win = window.open("", "_blank", "width=1000,height=860")
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>${pageTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;color:#0f172a}
  @media print{
    @page{size:A4;margin:0}
    .no-print{display:none}
    html,body{width:210mm}
  }
  img{max-width:100%;display:block}
</style>
</head><body>${el.innerHTML}</body></html>`)
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 600)
  }, [ref, pageTitle])
}

// ─── Shared top bar ───────────────────────────────────────────────────────────

function PdfShell({ children, onPrint, label, accent, badgeLabel }: {
  children: React.ReactNode
  onPrint: () => void
  label: string
  accent: string
  badgeLabel: string
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
          <span className="text-xs font-semibold text-foreground truncate">{label}</span>
          <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: accent + "20", color: accent }}>{badgeLabel}</span>
        </div>
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white shrink-0 transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v8M3.5 6l3 3 3-3M1.5 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hidden sm:inline">Download</span> PDF
        </button>
      </div>
      {/* Canvas */}
      <div className="flex-1 overflow-auto" style={{ background: "#eef0f4" }}>
        {children}
      </div>
    </div>
  )
}

// ─── Shared decorative SVG patterns ──────────────────────────────────────────

const DOT_GRID = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E")`
const DIAGONAL = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0' stroke='rgba(255,255,255,0.06)' stroke-width='1'/%3E%3C/svg%3E")`

// ─── Shared section divider ───────────────────────────────────────────────────

function Divider({ color }: { color: string }) {
  return <div style={{ height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}33, transparent)`, margin: "36px 0" }} />
}

// ─── Shared pull-quote ────────────────────────────────────────────────────────

function PullQuote({ text, accent }: { text: string; accent: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 20, margin: "24px 0" }}>
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, fontStyle: "italic", color: "#1e293b", lineHeight: 1.5 }}>{text}</div>
    </div>
  )
}

// ─── Shared label + value stat block ─────────────────────────────────────────

function StatBar({ stats, accent }: { stats: { label: string; value: string | number }[]; accent: string }) {
  return (
    <div style={{ display: "flex", gap: 0, borderRadius: 14, overflow: "hidden", border: `1px solid ${accent}33`, marginBottom: 28 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ flex: 1, padding: "18px 20px", background: i % 2 === 0 ? "#fff" : "#fafbfc", borderRight: i < stats.length - 1 ? `1px solid ${accent}22` : "none" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, fontWeight: 400, color: accent, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Shared callout card ──────────────────────────────────────────────────────

function Callout({ label, text, accent, bg, border }: { label: string; text: string; accent: string; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.75 }}>{text}</div>
    </div>
  )
}

// ─── Shared PDF footer ────────────────────────────────────────────────────────

function PdfFooter({ accent }: { accent: string }) {
  return (
    <div style={{ marginTop: 56, paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid #e2e8f0` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>N</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>Nixio</span>
      </div>
      <span style={{ fontSize: 10, color: "#cbd5e1" }}>nixio.app · {new Date().getFullYear()} · Generated with AI</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EBOOK PDF
// Color world: Deep midnight navy + warm gold + cream paper
// ─────────────────────────────────────────────────────────────────────────────

export function EbookPDF({ data }: { data: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const print = usePrint(ref, data.title)
  const C = {
    navy: "#0f172a", navyMid: "#1e293b", gold: "#d97706", goldBright: "#f59e0b",
    goldLight: "#fef3c7", goldBorder: "#fbbf24", cream: "#fffdf5",
    mid: "#374151", muted: "#64748b", soft: "#fafaf7"
  }
  const date = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <PdfShell onPrint={print} label={data.title} accent={C.gold} badgeLabel="Ebook">
      <div ref={ref} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff" }}>

        {/* ── CINEMATIC COVER ─────────────────────────────────────────────── */}
        <div style={{ background: C.navy, position: "relative", overflow: "hidden", minHeight: 520, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {/* Layered geometric shapes */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID }} />
          <div style={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", border: `80px solid ${C.gold}`, opacity: 0.06 }} />
          <div style={{ position: "absolute", top: 40, right: 60, width: 200, height: 200, borderRadius: "50%", border: `2px solid ${C.goldBorder}`, opacity: 0.12 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: `linear-gradient(to top, ${C.navy}, transparent)` }} />
          {/* Large decorative letter */}
          <div style={{ position: "absolute", top: 40, right: 48, fontFamily: "'DM Serif Display', serif", fontSize: 280, fontWeight: 400, color: "rgba(255,255,255,0.03)", lineHeight: 1, userSelect: "none" }}>
            {(data.title || "E").charAt(0)}
          </div>
          {/* Cover content */}
          <div style={{ position: "relative", padding: "56px 64px 64px" }}>
            {/* Eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div style={{ width: 24, height: 2, background: C.gold }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>{date} &nbsp;·&nbsp; Nixio Original</span>
            </div>
            {/* Title */}
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, lineHeight: 1.08, color: "#fff", marginBottom: 20, maxWidth: 560 }}>{data.title}</div>
            {/* Subtitle */}
            <div style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.6, marginBottom: 36, maxWidth: 480 }}>{data.subtitle}</div>
            {/* Author bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, #92400e)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{(data.author || "N").charAt(0)}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{data.author || "Nixio"}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Author · Generated by Nixio AI</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                {[
                  { label: "Chapters", value: (data.chapters || []).length },
                  { label: "Year", value: new Date().getFullYear() },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.gold, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Gold bottom bar */}
          <div style={{ height: 5, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright}, ${C.gold})` }} />
        </div>

        <div style={{ maxWidth: 740, margin: "0 auto", padding: "56px 56px 80px" }}>

          {/* Introduction */}
          <div style={{ background: C.cream, border: `1px solid ${C.goldBorder}`, borderRadius: 16, padding: "32px 36px", marginBottom: 48, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: C.goldLight, opacity: 0.6 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>Introduction</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.navy, lineHeight: 1.5, marginBottom: 16, fontStyle: "italic" }}>
                {(data.introduction || "").split(". ")[0]}.
              </div>
              <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.85 }}>{data.introduction}</div>
            </div>
          </div>

          {/* Chapters */}
          {(data.chapters || []).map((ch: any, i: number) => (
            <div key={i} style={{ marginBottom: 64, pageBreakInside: "avoid" }}>
              {/* Chapter header band */}
              <div style={{ display: "flex", gap: 0, marginBottom: 28, alignItems: "stretch" }}>
                <div style={{ width: 6, borderRadius: "4px 0 0 4px", background: `linear-gradient(to bottom, ${C.gold}, ${C.goldBright})`, flexShrink: 0 }} />
                <div style={{ flex: 1, background: `linear-gradient(135deg, ${C.navy} 0%, #1e293b 100%)`, borderRadius: "0 16px 16px 0", padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 56, color: C.gold, opacity: 0.25, lineHeight: 1, flexShrink: 0, marginTop: -4 }}>
                    {String(ch.number).padStart(2, "0")}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.goldBorder, marginBottom: 6 }}>Chapter {ch.number}</div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#fff", lineHeight: 1.2 }}>{ch.title}</div>
                    {ch.tagline && <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6, fontStyle: "italic" }}>{ch.tagline}</div>}
                  </div>
                </div>
              </div>

              {/* Chapter body */}
              <div style={{ fontSize: 15, color: C.mid, lineHeight: 1.9, marginBottom: 24, columnCount: 1 }}>{ch.body}</div>

              {/* Key insight callout */}
              {ch.keyInsight && (
                <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e293b)`, borderRadius: 12, padding: "22px 28px", marginBottom: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ color: "#fff", fontSize: 16 }}>★</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>Key Insight</div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#e2e8f0", lineHeight: 1.65, fontStyle: "italic" }}>{ch.keyInsight}</div>
                  </div>
                </div>
              )}

              {/* Exercises */}
              {ch.exercises?.length > 0 && (
                <div style={{ border: `1px solid ${C.goldBorder}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: C.goldLight, padding: "12px 20px", borderBottom: `1px solid ${C.goldBorder}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold }}>Practice Exercises</div>
                  </div>
                  {ch.exercises.map((ex: string, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 14, padding: "14px 20px", background: j % 2 === 0 ? "#fff" : C.soft, borderBottom: j < ch.exercises.length - 1 ? `1px solid ${C.goldBorder}33` : "none", alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>{j + 1}</span>
                      </div>
                      <span style={{ fontSize: 13, color: C.mid, lineHeight: 1.65 }}>{ex}</span>
                    </div>
                  ))}
                </div>
              )}

              {i < (data.chapters || []).length - 1 && <Divider color={C.gold} />}
            </div>
          ))}

          {/* Conclusion */}
          {data.conclusion && (
            <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e293b 100%)`, borderRadius: 20, padding: "40px 44px", marginBottom: 36, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -40, right: -40, width: 200, height: 200, borderRadius: "50%", border: `2px solid ${C.goldBorder}`, opacity: 0.12 }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>Conclusion</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#e2e8f0", lineHeight: 1.75 }}>{data.conclusion}</div>
            </div>
          )}

          {/* Resources */}
          {data.resourceList?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>Recommended Resources</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.resourceList.map((r: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", background: C.soft, borderRadius: 8, border: `1px solid ${C.goldBorder}33` }}>
                    <span style={{ color: C.gold, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 12, color: C.mid, lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PdfFooter accent={C.gold} />
        </div>
      </div>
    </PdfShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WORKBOOK PDF
// Color world: Emerald forest green + ivory + slate
// ─────────────────────────────────────────────────────────────────────────────

export function WorkbookPDF({ data }: { data: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const print = usePrint(ref, data.title)
  const C = {
    green: "#059669", greenDark: "#047857", greenDeep: "#065f46",
    greenLight: "#d1fae5", greenBorder: "#6ee7b7", greenSoft: "#f0fdf4",
    ivory: "#fafdf9", mid: "#374151", muted: "#6b7280"
  }

  return (
    <PdfShell onPrint={print} label={data.title} accent={C.green} badgeLabel="Workbook">
      <div ref={ref} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff" }}>

        {/* ── COVER ─────────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(150deg, ${C.greenDeep} 0%, ${C.green} 55%, #10b981 100%)`, position: "relative", overflow: "hidden", minHeight: 480, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID }} />
          <div style={{ position: "absolute", top: -80, right: -80, width: 420, height: 420, borderRadius: "50%", border: `3px solid rgba(255,255,255,0.08)` }} />
          <div style={{ position: "absolute", top: 20, right: 120, width: 180, height: 180, borderRadius: "50%", border: `1px solid rgba(255,255,255,0.12)` }} />
          {/* Big decorative W */}
          <div style={{ position: "absolute", top: 30, right: 40, fontFamily: "'DM Serif Display', serif", fontSize: 260, color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>W</div>
          <div style={{ position: "relative", padding: "52px 60px 60px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.12)", borderRadius: 24, padding: "6px 14px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a7f3d0" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#a7f3d0" }}>Interactive Workbook · Nixio</span>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: "#fff", lineHeight: 1.1, marginBottom: 18, maxWidth: 520 }}>{data.title}</div>
            <div style={{ fontSize: 16, color: "#a7f3d0", lineHeight: 1.6, marginBottom: 36, maxWidth: 460 }}>{data.subtitle}</div>
            {data.howToUse && (
              <div style={{ display: "flex", gap: 14, padding: "16px 20px", background: "rgba(255,255,255,0.08)", borderRadius: 12, backdropFilter: "blur(10px)", maxWidth: 520 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
                <div style={{ fontSize: 13, color: "#d1fae5", lineHeight: 1.6 }}>{data.howToUse}</div>
              </div>
            )}
          </div>
          <div style={{ height: 5, background: "linear-gradient(90deg, #6ee7b7, #a7f3d0, #6ee7b7)" }} />
        </div>

        <div style={{ maxWidth: 740, margin: "0 auto", padding: "52px 56px 80px" }}>

          {/* Progress milestones */}
          {data.progressTracker?.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.green, marginBottom: 16 }}>Your Journey</div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{ position: "absolute", top: "50%", left: 20, right: 20, height: 2, background: C.greenBorder, opacity: 0.3, transform: "translateY(-50%)", zIndex: 0 }} />
                {data.progressTracker.map((m: string, i: number) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? C.green : "#fff", border: `2px solid ${C.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: i === 0 ? "#fff" : C.green }}>{i + 1}</div>
                    <div style={{ fontSize: 10, color: C.muted, textAlign: "center", maxWidth: 70, lineHeight: 1.4 }}>{m}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules */}
          {(data.modules || []).map((mod: any, mi: number) => (
            <div key={mi} style={{ marginBottom: 52, pageBreakInside: "avoid" }}>
              {/* Module header */}
              <div style={{ display: "flex", gap: 0, marginBottom: 24, alignItems: "stretch" }}>
                <div style={{ width: 6, borderRadius: "4px 0 0 4px", background: `linear-gradient(to bottom, ${C.green}, #10b981)`, flexShrink: 0 }} />
                <div style={{ flex: 1, background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`, borderRadius: "0 14px 14px 0", padding: "22px 26px", display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: "rgba(255,255,255,0.18)", lineHeight: 1, flexShrink: 0 }}>
                    {String(mod.number).padStart(2, "0")}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#a7f3d0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Module {mod.number}</div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#fff" }}>{mod.title}</div>
                    {mod.objective && <div style={{ fontSize: 12, color: "#6ee7b7", marginTop: 4, fontStyle: "italic" }}>Goal: {mod.objective}</div>}
                  </div>
                </div>
              </div>

              {mod.warmUp && (
                <Callout label="Warm-Up (2 min)" text={mod.warmUp} accent={C.green} bg={C.greenSoft} border={C.greenBorder} />
              )}

              {(mod.exercises || []).map((ex: any, ei: number) => (
                <div key={ei} style={{ marginBottom: 20, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.greenBorder}`, boxShadow: "0 1px 8px rgba(5,150,105,0.06)" }}>
                  {/* Ex header */}
                  <div style={{ background: `linear-gradient(90deg, ${C.greenSoft}, #fff)`, padding: "14px 20px", borderBottom: `1px solid ${C.greenBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{ex.number}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.greenDeep }}>{ex.title}</div>
                  </div>
                  <div style={{ padding: "18px 22px", background: "#fff" }}>
                    {ex.instructions && <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.7, marginBottom: 14 }}>{ex.instructions}</div>}
                    {ex.prompt && (
                      <div style={{ background: C.greenLight, borderRadius: 8, padding: "14px 18px", marginBottom: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Task</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.greenDeep, lineHeight: 1.6 }}>{ex.prompt}</div>
                      </div>
                    )}
                    {/* Write space */}
                    <div style={{ border: `1.5px dashed ${C.greenBorder}`, borderRadius: 10, minHeight: 90, padding: "14px 16px", background: "#fafff9" }}>
                      <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>Your answer...</div>
                    </div>
                    {ex.debrief && <div style={{ fontSize: 11, color: C.muted, marginTop: 10, fontStyle: "italic" }}>Debrief: {ex.debrief}</div>}
                  </div>
                </div>
              ))}

              {/* Reflection + commitment */}
              {mod.reflection && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <div style={{ background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Reflection</div>
                    <div style={{ fontSize: 12, color: C.greenDeep, marginBottom: 16, lineHeight: 1.6 }}>{mod.reflection}</div>
                    <div style={{ borderTop: `1px dashed ${C.greenBorder}`, paddingTop: 10, minHeight: 40 }} />
                  </div>
                  {mod.commitmentPrompt && (
                    <div style={{ background: C.green, borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, color: "#d1fae5", lineHeight: 1.6, marginBottom: 16 }}>{mod.commitmentPrompt}</div>
                      <div style={{ borderTop: "1px dashed rgba(255,255,255,0.3)", height: 32 }} />
                    </div>
                  )}
                </div>
              )}

              {mi < (data.modules || []).length - 1 && <Divider color={C.green} />}
            </div>
          ))}

          {/* Capstone */}
          {data.finalChallenge && (
            <div style={{ background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`, borderRadius: 20, padding: "40px 44px", marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>Capstone Challenge</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#fff", lineHeight: 1.7, marginBottom: 24 }}>{data.finalChallenge}</div>
              <div style={{ height: 80, border: "1.5px dashed rgba(255,255,255,0.25)", borderRadius: 10 }} />
            </div>
          )}

          <PdfFooter accent={C.green} />
        </div>
      </div>
    </PdfShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CHECKLIST PDF
// Color world: Electric indigo + pure white + lavender tints
// ─────────────────────────────────────────────────────────────────────────────

export function ChecklistPDF({ data }: { data: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const print = usePrint(ref, data.title)
  const C = {
    indigo: "#4f46e5", indigoDark: "#3730a3", indigoDeep: "#1e1b4b",
    indigoLight: "#e0e7ff", indigoBorder: "#818cf8", indigoSoft: "#f5f3ff",
    mid: "#374151", muted: "#6b7280"
  }

  return (
    <PdfShell onPrint={print} label={data.title} accent={C.indigo} badgeLabel="Checklist">
      <div ref={ref} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff" }}>

        {/* ── COVER ─────────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(155deg, ${C.indigoDeep} 0%, ${C.indigoDark} 40%, ${C.indigo} 100%)`, position: "relative", overflow: "hidden", minHeight: 460, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID }} />
          <div style={{ position: "absolute", top: -60, left: -60, width: 360, height: 360, borderRadius: "50%", border: `60px solid rgba(129,140,248,0.1)` }} />
          <div style={{ position: "absolute", bottom: 60, right: -40, width: 260, height: 260, borderRadius: "50%", border: `2px solid rgba(165,180,252,0.15)` }} />
          <div style={{ position: "absolute", top: 20, right: 48, fontFamily: "'DM Serif Display', serif", fontSize: 240, color: "rgba(255,255,255,0.03)", lineHeight: 1 }}>✓</div>
          <div style={{ position: "relative", padding: "52px 60px 60px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(165,180,252,0.3)", borderRadius: 24, padding: "6px 14px", marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a5b4fc" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#a5b4fc" }}>Action Checklist · Nixio</span>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 46, color: "#fff", lineHeight: 1.1, marginBottom: 18, maxWidth: 540 }}>{data.title}</div>
            <div style={{ fontSize: 16, color: "#a5b4fc", lineHeight: 1.6, marginBottom: 28, maxWidth: 460 }}>{data.subtitle}</div>
            {data.tagline && <PullQuote text={data.tagline} accent="#a5b4fc" />}
            {/* Quick stats */}
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              {[
                { v: (data.phases || []).length, l: "Phases" },
                { v: (data.phases || []).reduce((acc: number, p: any) => acc + (p.items || []).length, 0), l: "Action Items" },
                { v: (data.quickWins || []).length, l: "Quick Wins" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#fff", lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#818cf8", marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 5, background: "linear-gradient(90deg, #818cf8, #c7d2fe, #818cf8)" }} />
        </div>

        <div style={{ maxWidth: 740, margin: "0 auto", padding: "52px 56px 80px" }}>

          {/* Quick wins */}
          {data.quickWins?.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.indigo, marginBottom: 16 }}>Quick Wins — Do These First</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.quickWins.map((w: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, borderRadius: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${C.indigo}`, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: C.indigoDeep, lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phases */}
          {(data.phases || []).map((phase: any, pi: number) => (
            <div key={pi} style={{ marginBottom: 44, pageBreakInside: "avoid" }}>
              {/* Phase header */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 18 }}>
                <div style={{ width: 6, borderRadius: "4px 0 0 4px", background: `linear-gradient(to bottom, ${C.indigo}, ${C.indigoBorder})`, alignSelf: "stretch", flexShrink: 0 }} />
                <div style={{ flex: 1, background: `linear-gradient(90deg, ${C.indigoSoft}, #fff)`, borderRadius: "0 12px 12px 0", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.indigo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>{phase.phase}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.indigoDeep }}>{phase.name}</div>
                      <div style={{ fontSize: 11, color: C.indigo, fontWeight: 600 }}>{phase.timeframe} · {phase.goal}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{(phase.items || []).length} items</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ border: `1px solid ${C.indigoBorder}`, borderRadius: 12, overflow: "hidden" }}>
                {(phase.items || []).map((item: any, ii: number) => (
                  <div key={ii} style={{ display: "flex", gap: 14, padding: "13px 18px", background: ii % 2 === 0 ? "#fff" : C.indigoSoft, borderBottom: ii < (phase.items || []).length - 1 ? `1px solid ${C.indigoLight}` : "none", alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${C.indigoBorder}`, flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.indigoDeep, lineHeight: 1.4 }}>{item.task}</div>
                      {item.why && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{item.why}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {pi < (data.phases || []).length - 1 && <Divider color={C.indigo} />}
            </div>
          ))}

          {/* Common mistakes + success */}
          {(data.commonMistakes?.length > 0 || data.successMetrics?.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              {data.commonMistakes?.length > 0 && (
                <div style={{ background: "#fff7f7", border: "1px solid #fca5a5", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Avoid These</div>
                  {data.commonMistakes.map((m: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 12, color: "#7f1d1d" }}>
                      <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>✗</span>{m}
                    </div>
                  ))}
                </div>
              )}
              {data.successMetrics?.length > 0 && (
                <div style={{ background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.indigo, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Success Looks Like</div>
                  {data.successMetrics.map((m: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 12, color: C.indigoDeep }}>
                      <span style={{ color: C.indigo, fontWeight: 700, flexShrink: 0 }}>✓</span>{m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <PdfFooter accent={C.indigo} />
        </div>
      </div>
    </PdfShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FRAMEWORK PDF
// Color world: Deep teal + slate + warm white
// ─────────────────────────────────────────────────────────────────────────────

export function FrameworkPDF({ data }: { data: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const print = usePrint(ref, data.title)
  const C = {
    teal: "#0d9488", tealDark: "#0f766e", tealDeep: "#134e4a",
    tealLight: "#ccfbf1", tealBorder: "#5eead4", tealSoft: "#f0fdfa",
    mid: "#374151", muted: "#64748b"
  }

  return (
    <PdfShell onPrint={print} label={data.title} accent={C.teal} badgeLabel="Framework">
      <div ref={ref} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff" }}>

        {/* ── COVER ─────────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(155deg, ${C.tealDeep} 0%, ${C.tealDark} 45%, ${C.teal} 100%)`, position: "relative", overflow: "hidden", minHeight: 500, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: DIAGONAL }} />
          <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", border: `100px solid rgba(94,234,212,0.06)` }} />
          <div style={{ position: "absolute", bottom: 60, right: 60, width: 180, height: 180, borderRadius: "50%", border: `2px solid rgba(45,212,191,0.15)` }} />
          {/* Acronym display */}
          {data.acronym?.word && (
            <div style={{ position: "absolute", top: 36, right: 56, fontFamily: "'DM Serif Display', serif", fontSize: 160, color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>
              {data.acronym.word}
            </div>
          )}
          <div style={{ position: "relative", padding: "52px 60px 60px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(94,234,212,0.25)", borderRadius: 24, padding: "6px 14px", marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#99f6e4" }}>Proprietary Framework · Nixio</span>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: "#fff", lineHeight: 1.1, marginBottom: 18, maxWidth: 540 }}>{data.title}</div>
            <div style={{ fontSize: 16, color: "#99f6e4", lineHeight: 1.6, marginBottom: 24, maxWidth: 460 }}>{data.subtitle}</div>
            {data.tagline && (
              <div style={{ borderLeft: "3px solid #5eead4", paddingLeft: 16, marginBottom: 28 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.5 }}>{data.tagline}</div>
              </div>
            )}
            {/* Steps count */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { v: (data.steps || []).length, l: "Steps" },
                { v: data.acronym?.word?.length || (data.steps || []).length, l: "Pillars" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#5eead4", marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 5, background: "linear-gradient(90deg, #2dd4bf, #99f6e4, #2dd4bf)" }} />
        </div>

        <div style={{ maxWidth: 740, margin: "0 auto", padding: "52px 56px 80px" }}>

          {/* Overview */}
          {data.overview && (
            <Callout label="Overview" text={data.overview} accent={C.teal} bg={C.tealSoft} border={C.tealBorder} />
          )}

          {/* Acronym visual — large letter blocks */}
          {data.acronym?.letters?.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.teal, marginBottom: 20 }}>
                The {data.acronym.word} Method
              </div>
              {/* Big letter row */}
              <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                {data.acronym.letters.map((l: any, i: number) => (
                  <div key={i} style={{ flex: 1, background: `linear-gradient(135deg, ${C.tealDeep}, ${C.teal})`, borderRadius: 14, padding: "20px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#fff", lineHeight: 1, marginBottom: 6 }}>{l.letter}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#99f6e4", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l.stands_for}</div>
                  </div>
                ))}
              </div>
              {/* Expanded explanations */}
              {data.acronym.letters.map((l: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, padding: "18px 22px", border: `1px solid ${C.tealBorder}`, borderRadius: 12, background: i % 2 === 0 ? "#fff" : C.tealSoft }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontWeight: 400, fontSize: 20 }}>{l.letter}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.tealDeep, marginBottom: 6 }}>{l.stands_for} — {l.meaning}</div>
                    <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.7, marginBottom: 10 }}>{l.description}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(l.actions || []).map((a: string, ai: number) => (
                        <span key={ai} style={{ fontSize: 11, background: C.tealLight, color: C.tealDark, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Divider color={C.teal} />

          {/* Steps */}
          {(data.steps || []).map((step: any, si: number) => (
            <div key={si} style={{ marginBottom: 40, pageBreakInside: "avoid" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${C.teal}33` }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: 20 }}>{step.number}</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.tealDeep, marginBottom: 2, lineHeight: 1.2 }}>{step.name}</div>
                  <div style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>Step {step.number}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.85, marginBottom: 16, paddingLeft: 62 }}>{step.description}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingLeft: 62 }}>
                {step.tools?.length > 0 && (
                  <div style={{ background: C.tealSoft, border: `1px solid ${C.tealBorder}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Tools & Techniques</div>
                    {step.tools.map((t: string, ti: number) => (
                      <div key={ti} style={{ fontSize: 12, color: C.tealDeep, marginBottom: 6, display: "flex", gap: 6 }}>
                        <span style={{ color: C.teal, fontWeight: 700 }}>▸</span>{t}
                      </div>
                    ))}
                  </div>
                )}
                {step.commonBlocks?.length > 0 && (
                  <div style={{ background: "#fff7f7", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Common Blocks</div>
                    {step.commonBlocks.map((b: string, bi: number) => (
                      <div key={bi} style={{ fontSize: 12, color: "#7f1d1d", marginBottom: 6, display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444" }}>!</span>{b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {step.outcome && (
                <div style={{ marginTop: 12, marginLeft: 62, padding: "10px 16px", background: C.teal, borderRadius: 8, display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#ccfbf1", fontWeight: 700 }}>Outcome:</span>
                  <span style={{ fontSize: 12, color: "#e2e8f0" }}>{step.outcome}</span>
                </div>
              )}
              {si < (data.steps || []).length - 1 && <Divider color={C.tealBorder} />}
            </div>
          ))}

          {/* Case study */}
          {data.caseStudy && (
            <div style={{ background: `linear-gradient(135deg, ${C.tealDeep}, ${C.teal})`, borderRadius: 20, padding: "36px 40px", marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#99f6e4", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>Case Study: {data.caseStudy.persona}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "center" }}>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Before</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.65 }}>{data.caseStudy.before}</div>
                </div>
                <div style={{ textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#5eead4" }}>→</div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, color: "#99f6e4", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>After</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.65 }}>{data.caseStudy.after}</div>
                </div>
              </div>
              {data.caseStudy.keyMoment && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)", fontStyle: "italic", fontSize: 13, color: "#ccfbf1" }}>
                  Key moment: {data.caseStudy.keyMoment}
                </div>
              )}
            </div>
          )}

          {/* FAQ */}
          {data.faq?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>FAQ</div>
              {data.faq.map((f: any, fi: number) => (
                <div key={fi} style={{ marginBottom: 12, border: `1px solid ${C.tealBorder}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: C.tealSoft, padding: "12px 18px", fontWeight: 700, fontSize: 13, color: C.tealDeep }}>{f.q}</div>
                  <div style={{ padding: "12px 18px", fontSize: 13, color: C.mid, lineHeight: 1.65 }}>{f.a}</div>
                </div>
              ))}
            </div>
          )}

          <PdfFooter accent={C.teal} />
        </div>
      </div>
    </PdfShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SALES PDF
// Color world: Near-black charcoal + blood red + warm white
// ─────────────────────────────────────────────────────────────────────────────

export function SalesPDF({ data }: { data: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const print = usePrint(ref, data.productName)
  const C = {
    red: "#dc2626", redDark: "#991b1b", redDeep: "#450a0a",
    redLight: "#fef2f2", redBorder: "#fca5a5", redSoft: "#fff7f7",
    charcoal: "#0f172a", charcoalMid: "#1e293b",
    mid: "#374151", muted: "#64748b"
  }

  return (
    <PdfShell onPrint={print} label={data.productName || data.headline} accent={C.red} badgeLabel="Sales Doc">
      <div ref={ref} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff" }}>

        {/* ── CINEMATIC COVER ─────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(160deg, ${C.redDeep} 0%, #1a0606 30%, ${C.charcoal} 100%)`, position: "relative", overflow: "hidden", minHeight: 540, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID }} />
          {/* Red orb */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 460, height: 460, borderRadius: "50%", background: C.red, opacity: 0.08, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: 40, right: 80, width: 240, height: 240, borderRadius: "50%", border: `1px solid rgba(220,38,38,0.2)` }} />
          <div style={{ position: "absolute", top: 60, right: 100, width: 160, height: 160, borderRadius: "50%", border: `1px solid rgba(220,38,38,0.12)` }} />
          {/* Large product name bg */}
          <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, fontFamily: "'DM Serif Display', serif", fontSize: 120, color: "rgba(255,255,255,0.025)", lineHeight: 1, overflow: "hidden", whiteSpace: "nowrap", paddingLeft: 40 }}>
            {data.productName || "OFFER"}
          </div>
          <div style={{ position: "relative", padding: "52px 64px 64px" }}>
            {/* Red label */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(220,38,38,0.2)", border: `1px solid rgba(220,38,38,0.4)`, borderRadius: 24, padding: "6px 16px", marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fca5a5" }}>Sales Document · Exclusive Offer</span>
            </div>
            {/* Headline */}
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 50, color: "#fff", lineHeight: 1.05, marginBottom: 22, maxWidth: 580 }}>{data.headline}</div>
            {/* Subheadline */}
            <div style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.65, maxWidth: 500, marginBottom: 36 }}>{data.subheadline}</div>
            {/* Price preview */}
            {data.pricing && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 22px" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", textDecoration: "line-through", marginBottom: 2 }}>{data.pricing.anchor}</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>{data.pricing.offer}</div>
                </div>
                <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
                <div style={{ fontSize: 12, color: "#a7f3d0", maxWidth: 200, lineHeight: 1.5 }}>{data.pricing?.guarantee?.split(" ").slice(0, 8).join(" ")}...</div>
              </div>
            )}
          </div>
          <div style={{ height: 5, background: `linear-gradient(90deg, ${C.red}, #f87171, ${C.red})` }} />
        </div>

        <div style={{ maxWidth: 740, margin: "0 auto", padding: "56px 56px 80px" }}>

          {/* Opening story */}
          {data.openingStory && (
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 16 }}>Does This Sound Familiar?</div>
              <div style={{ fontSize: 15, color: C.charcoal, lineHeight: 1.9, borderLeft: `4px solid ${C.red}`, paddingLeft: 22 }}>{data.openingStory}</div>
            </div>
          )}

          <Divider color={C.red} />

          {/* Problem */}
          {data.problemSection && (
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.charcoal, marginBottom: 16, lineHeight: 1.2 }}>{data.problemSection.heading}</div>
              <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.85, marginBottom: 20 }}>{data.problemSection.body}</div>
              <div style={{ background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 14, padding: "22px 26px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>If any of these resonate...</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(data.problemSection.agitators || []).map((a: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: C.redDark }}>
                      <span style={{ color: C.red, fontWeight: 800, flexShrink: 0 }}>✗</span>{a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Solution */}
          {data.solutionSection && (
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.charcoal, marginBottom: 16 }}>{data.solutionSection.heading}</div>
              <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.85, marginBottom: 20 }}>{data.solutionSection.body}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(data.solutionSection.differentiators || []).map((d: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: 10 }}>
                    <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#065f46", lineHeight: 1.6 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Divider color={C.red} />

          {/* Value stack */}
          {data.valueStack?.length > 0 && (
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 18 }}>Everything You Get</div>
              <div style={{ border: `2px solid ${C.red}`, borderRadius: 16, overflow: "hidden" }}>
                {/* Header row */}
                <div style={{ background: `linear-gradient(90deg, ${C.charcoal}, ${C.charcoalMid})`, padding: "12px 20px", display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Component</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Value</span>
                </div>
                {data.valueStack.map((v: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "14px 20px", background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < data.valueStack.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>{v.item}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{v.description}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>{v.perceivedValue}</div>
                  </div>
                ))}
                {/* Total row */}
                <div style={{ background: `linear-gradient(90deg, ${C.charcoal}, ${C.charcoalMid})`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Total Value</span>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.red }}>Priceless</span>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {data.testimonials?.length > 0 && (
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 18 }}>What Others Are Saying</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {data.testimonials.slice(0, 6).map((t: any, i: number) => (
                  <div key={i} style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", position: "relative" }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, color: C.redBorder, lineHeight: 1, position: "absolute", top: 8, right: 16, opacity: 0.5 }}>"</div>
                    <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, marginBottom: 12 }}>{t.quote}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.charcoal }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{t.result}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {data.pricing && (
            <div style={{ background: `linear-gradient(160deg, ${C.charcoal} 0%, ${C.charcoalMid} 100%)`, borderRadius: 20, padding: "40px 44px", marginBottom: 36, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: C.red, opacity: 0.07, filter: "blur(40px)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>Today&apos;s Investment</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: "#475569", textDecoration: "line-through" }}>{data.pricing.anchor}</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, color: "#fff", lineHeight: 1 }}>{data.pricing.offer}</div>
                </div>
                <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>{data.pricing.justification}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#a7f3d0", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Guarantee</div>
                    <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.6 }}>{data.pricing.guarantee}</div>
                  </div>
                  <div style={{ background: "rgba(220,38,38,0.15)", border: `1px solid rgba(220,38,38,0.3)`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Act Now</div>
                    <div style={{ fontSize: 12, color: "#fecaca", lineHeight: 1.6 }}>{data.pricing.urgency}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {data.faq?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 16 }}>Common Questions</div>
              {data.faq.map((f: any, fi: number) => (
                <div key={fi} style={{ marginBottom: 10, border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: "#f8fafc", padding: "12px 18px", fontWeight: 700, fontSize: 13, color: C.charcoal }}>{f.q}</div>
                  <div style={{ padding: "12px 18px", fontSize: 13, color: C.mid, lineHeight: 1.65 }}>{f.a}</div>
                </div>
              ))}
            </div>
          )}

          {/* Final CTA */}
          {data.cta && (
            <div style={{ background: C.red, borderRadius: 16, padding: "32px 36px", textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#fff", marginBottom: 10 }}>{data.cta.primary}</div>
              <div style={{ fontSize: 13, color: "#fecaca", marginBottom: 16 }}>{data.cta.secondary}</div>
              <div style={{ fontSize: 12, color: "#fca5a5", fontStyle: "italic" }}>{data.cta.closing}</div>
            </div>
          )}

          <PdfFooter accent={C.red} />
        </div>
      </div>
    </PdfShell>
  )
}
