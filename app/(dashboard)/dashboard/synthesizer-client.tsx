"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lesson {
  title: string
  keyPoints: string[]
}

interface Module {
  number: number
  title: string
  goal: string
  lessons: Lesson[]
}

interface Blueprint {
  title: string
  tagline: string
  idea: {
    headline: string
    problem: string
    solution: string
    audience: string
    demandScore: number
    monetizationScore: number
    difficultyScore: number
    uniqueValueZone: string
  }
  product: {
    transformationBefore: string
    transformationAfter: string
    format: string
    pricingTier: { starter: string; core: string; premium: string }
    modules: Module[]
  }
  content: {
    sampleLesson: {
      title: string
      module: string
      introduction: string
      sections: { heading: string; body: string }[]
      keyTakeaways: string[]
      actionSteps: string[]
    }
  }
  funnel: {
    headline: string
    subheadline: string
    offer: string
    urgency: string
    cta: string
    emailSequence: { day: number; subject: string; preview: string; hook: string }[]
  }
}

interface RecentAsset {
  id: string
  name: string
  created_at: string
  content: Blueprint
}

// ─── Generation steps ─────────────────────────────────────────────────────────

const STEPS = [
  { id: "idea", label: "Analysing market demand", icon: "💡" },
  { id: "product", label: "Architecting product structure", icon: "📦" },
  { id: "content", label: "Writing lesson content", icon: "✍️" },
  { id: "funnel", label: "Building marketing funnel", icon: "🎯" },
  { id: "pdf", label: "Generating PDF blueprint", icon: "📄" },
]

const TABS = ["Overview", "Product", "Content", "Funnel", "PDF"] as const
type Tab = typeof TABS[number]

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const display = invert ? 100 - value : value
  const color = display >= 70 ? "#5b6af9" : display >= 40 ? "#f59e0b" : "#ef4444"
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{display}/100</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${display}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── PDF Theme palette ────────────────────────────────────────────────────────

const PDF_THEMES = {
  cover:   { bg: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 50%,#6366f1 100%)", accent: "#a5b4fc", pill: "#3730a3", pillText: "#e0e7ff" },
  idea:    { bg: "#fffbeb", border: "#fbbf24", accent: "#d97706", light: "#fef3c7", dot: "#f59e0b" },
  product: { bg: "#f0fdf4", border: "#34d399", accent: "#059669", light: "#d1fae5", dot: "#10b981" },
  content: { bg: "#eff6ff", border: "#60a5fa", accent: "#2563eb", light: "#dbeafe", dot: "#3b82f6" },
  funnel:  { bg: "#fdf4ff", border: "#c084fc", accent: "#9333ea", light: "#f3e8ff", dot: "#a855f7" },
}

// ─── PDF Document renderer ────────────────────────────────────────────────────

function PDFViewer({ blueprint }: { blueprint: Blueprint }) {
  const pdfRef = useRef<HTMLDivElement>(null)

  const handlePrint = useCallback(() => {
    const content = pdfRef.current
    if (!content) return

    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${blueprint.title} — Nixio Blueprint</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print { @page { size: A4; margin: 0; } body { width: 210mm; } }
    .page { max-width: 820px; margin: 0 auto; padding: 0 0 64px; }

    /* ── CINEMATIC COVER ── */
    .cover { position: relative; overflow: hidden; min-height: 420px; background: linear-gradient(160deg, #080c14 0%, #0c1829 35%, #0f2040 65%, #0e2952 100%); display: flex; flex-direction: column; justify-content: flex-end; page-break-inside: avoid; }
    .cover-dot-bg { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.1' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E"); }
    .cover-orb { position: absolute; top: -100px; right: -100px; width: 500px; height: 500px; border-radius: 50%; background: #00d4ff; opacity: 0.05; filter: blur(80px); }
    .cover-ring1 { position: absolute; top: 30px; right: 60px; width: 260px; height: 260px; border-radius: 50%; border: 1px solid rgba(0,212,255,0.15); }
    .cover-ring2 { position: absolute; top: 80px; right: 110px; width: 160px; height: 160px; border-radius: 50%; border: 1px solid rgba(0,212,255,0.1); }
    .cover-bigtext { position: absolute; bottom: 60px; left: 0; font-family: 'DM Serif Display', serif; font-size: 140px; color: rgba(255,255,255,0.025); line-height: 1; white-space: nowrap; padding-left: 48px; overflow: hidden; pointer-events: none; }
    .cover-content { position: relative; padding: 52px 60px 60px; }
    .cover-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .cover-eyebrow-line { width: 22px; height: 2px; background: #00d4ff; }
    .cover-eyebrow-text { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #00d4ff; }
    .cover-title { font-family: 'DM Serif Display', serif; font-size: 52px; line-height: 1.05; color: #fff; margin-bottom: 18px; max-width: 580px; }
    .cover-tagline { font-size: 16px; color: #94a3b8; line-height: 1.65; margin-bottom: 36px; max-width: 500px; }
    .cover-stats { display: flex; gap: 32px; }
    .cover-stat-val { font-family: 'DM Serif Display', serif; font-size: 36px; color: #fff; line-height: 1; }
    .cover-stat-lbl { font-size: 10px; color: #475569; margin-top: 4px; }
    .cover-bar { height: 5px; background: linear-gradient(90deg, #00d4ff, #60efff, #00d4ff); }

    /* ── INNER PAGE ── */
    .inner { padding: 0 60px; }

    /* ── SECTION HEADER ── */
    .section { margin-bottom: 44px; page-break-inside: avoid; }
    .section-head { display: flex; align-items: center; gap: 0; margin-bottom: 22px; }
    .section-bar { width: 5px; height: 100%; border-radius: 4px 0 0 4px; background: linear-gradient(to bottom, #00d4ff, #6366f1); align-self: stretch; flex-shrink: 0; }
    .section-head-inner { flex: 1; background: linear-gradient(90deg, #f8fafc, #fff); border-radius: 0 12px 12px 0; padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
    .section-num { width: 30px; height: 30px; background: #00d4ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #0f172a; flex-shrink: 0; }
    .section-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: #0f172a; }

    /* ── CARDS ── */
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 22px; margin-bottom: 14px; }
    .card-label { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: #00d4ff; margin-bottom: 8px; }
    .card-text { font-size: 14px; line-height: 1.75; color: #334155; }

    /* ── SCORES ── */
    .scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 18px; }
    .score-box { padding: 18px; text-align: center; background: #fff; border-right: 1px solid #f1f5f9; }
    .score-box:last-child { border-right: none; }
    .score-box .val { font-family: 'DM Serif Display', serif; font-size: 34px; color: #00d4ff; line-height: 1; }
    .score-box .lbl { font-size: 10px; color: #64748b; margin-top: 5px; font-weight: 600; }

    /* ── TRANSFORM ── */
    .transform { display: grid; grid-template-columns: 1fr 36px 1fr; gap: 10px; align-items: center; margin-bottom: 18px; }
    .transform-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.6; color: #334155; }
    .transform-box strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 6px; font-weight: 700; }
    .transform-arrow { font-family: 'DM Serif Display', serif; font-size: 24px; color: #00d4ff; text-align: center; }

    /* ── PRICING ── */
    .pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
    .price-box { border-radius: 10px; padding: 18px; text-align: center; }
    .price-box.starter { background: #f8fafc; border: 1px solid #e2e8f0; }
    .price-box.core { background: #eff6ff; border: 2px solid #00d4ff; }
    .price-box.premium { background: #fffbeb; border: 1px solid #fbbf24; }
    .price-box .tier { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    .price-box .amount { font-family: 'DM Serif Display', serif; font-size: 28px; color: #0f172a; line-height: 1; }

    /* ── MODULES ── */
    .module { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 12px; page-break-inside: avoid; }
    .module-header { background: linear-gradient(90deg, #0f172a, #1e293b); color: #fff; padding: 13px 18px; display: flex; align-items: center; gap: 12px; }
    .module-num { background: #00d4ff; color: #0f172a; width: 26px; height: 26px; border-radius: 6px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .module-title { font-size: 14px; font-weight: 700; }
    .module-goal { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .module-body { padding: 14px 18px; }
    .lesson-item { font-size: 13px; color: #334155; padding: 7px 0; border-bottom: 1px solid #f1f5f9; display: flex; gap: 10px; align-items: flex-start; }
    .lesson-item:last-child { border-bottom: none; }
    .lesson-dot { color: #00d4ff; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

    /* ── CONTENT ── */
    .content-intro { font-family: 'DM Serif Display', serif; font-size: 17px; font-style: italic; color: #1e293b; margin-bottom: 20px; line-height: 1.65; padding: 18px 22px; background: #f8fafc; border-left: 4px solid #00d4ff; border-radius: 0 10px 10px 0; }
    .content-section { margin-bottom: 20px; }
    .content-section h4 { font-family: 'DM Serif Display', serif; font-size: 17px; color: #0f172a; margin-bottom: 8px; }
    .content-section p { font-size: 13px; line-height: 1.8; color: #374151; }
    .takeaways { list-style: none; }
    .takeaways li { font-size: 13px; color: #334155; padding: 8px 0 8px 22px; position: relative; border-bottom: 1px solid #f1f5f9; line-height: 1.6; }
    .takeaways li::before { content: "✓"; position: absolute; left: 0; color: #00d4ff; font-weight: 700; }
    .steps-list { counter-reset: steps; list-style: none; }
    .steps-list li { counter-increment: steps; font-size: 13px; color: #334155; padding: 10px 0 10px 34px; position: relative; border-bottom: 1px solid #f1f5f9; line-height: 1.6; }
    .steps-list li::before { content: counter(steps); position: absolute; left: 0; width: 24px; height: 24px; background: #00d4ff; color: #0f172a; border-radius: 50%; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; top: 9px; }

    /* ── FUNNEL ── */
    .funnel-headline { font-family: 'DM Serif Display', serif; font-size: 28px; color: #0f172a; margin-bottom: 8px; line-height: 1.2; }
    .funnel-sub { font-size: 15px; color: #475569; margin-bottom: 22px; line-height: 1.6; }
    .email-row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; }
    .email-day { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #00d4ff; margin-bottom: 4px; }
    .email-subject { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .email-preview { font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .email-hook { font-size: 12px; color: #334155; font-style: italic; }

    /* ── DIVIDER ── */
    .divider { height: 2px; border-radius: 2px; background: linear-gradient(90deg, #00d4ff, #00d4ff33, transparent); margin: 32px 0; }

    /* ── FOOTER ── */
    .footer { margin-top: 52px; padding-top: 18px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; }
    .footer-brand { display: flex; align-items: center; gap: 8px; }
    .footer-logo { width: 22px; height: 22px; border-radius: 6px; background: #00d4ff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #0f172a; }
    .footer-name { font-size: 11px; font-weight: 700; color: #94a3b8; }
    .footer-right { font-size: 10px; color: #cbd5e1; }
  </style>
</head>
<body>
<div class="page">

  <!-- ── CINEMATIC COVER ── -->
  <div class="cover">
    <div class="cover-dot-bg"></div>
    <div class="cover-orb"></div>
    <div class="cover-ring1"></div>
    <div class="cover-ring2"></div>
    <div class="cover-bigtext">${blueprint.title}</div>
    <div class="cover-content">
      <div class="cover-eyebrow">
        <div class="cover-eyebrow-line"></div>
        <span class="cover-eyebrow-text">Nixio Blueprint &mdash; ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
      <div class="cover-title">${blueprint.title}</div>
      <div class="cover-tagline">${blueprint.tagline}</div>
      <div class="cover-stats">
        <div><div class="cover-stat-val">${blueprint.idea.demandScore}</div><div class="cover-stat-lbl">Market Demand</div></div>
        <div><div class="cover-stat-val">${blueprint.idea.monetizationScore}</div><div class="cover-stat-lbl">Monetization</div></div>
        <div><div class="cover-stat-val">${100 - blueprint.idea.difficultyScore}</div><div class="cover-stat-lbl">Ease of Entry</div></div>
      </div>
    </div>
    <div class="cover-bar"></div>
  </div>

  <div class="inner">

  <!-- Section 1: Idea -->
  <div class="section">
    <div class="section-head">
      <div class="section-bar"></div>
      <div class="section-head-inner">
        <div class="section-num">1</div>
        <div class="section-title">Idea Validation</div>
      </div>
    </div>
    <div class="card"><div class="card-label">The Big Idea</div><div class="card-text">${blueprint.idea.headline}</div></div>
    <div class="scores">
      <div class="score-box"><div class="val">${blueprint.idea.demandScore}</div><div class="lbl">Market Demand</div></div>
      <div class="score-box"><div class="val">${blueprint.idea.monetizationScore}</div><div class="lbl">Monetization</div></div>
      <div class="score-box"><div class="val">${100 - blueprint.idea.difficultyScore}</div><div class="lbl">Ease of Entry</div></div>
    </div>
    <div class="card"><div class="card-label">Problem</div><div class="card-text">${blueprint.idea.problem}</div></div>
    <div class="card"><div class="card-label">Solution</div><div class="card-text">${blueprint.idea.solution}</div></div>
    <div class="card"><div class="card-label">Target Audience</div><div class="card-text">${blueprint.idea.audience}</div></div>
    <div class="card"><div class="card-label">Unique Value Zone</div><div class="card-text">${blueprint.idea.uniqueValueZone}</div></div>
  </div>

  <div class="divider"></div>

  <!-- Section 2: Product -->
  <div class="section">
    <div class="section-head">
      <div class="section-bar"></div>
      <div class="section-head-inner">
        <div class="section-num">2</div>
        <div class="section-title">Product Blueprint</div>
      </div>
    </div>
    <div class="transform">
      <div class="transform-box"><strong>Before</strong><br/>${blueprint.product.transformationBefore}</div>
      <div class="transform-arrow">&#8594;</div>
      <div class="transform-box"><strong>After</strong><br/>${blueprint.product.transformationAfter}</div>
    </div>
    <div class="card"><div class="card-label">Format</div><div class="card-text">${blueprint.product.format}</div></div>
    <div class="pricing">
      <div class="price-box starter"><div class="tier">Starter</div><div class="amount">${blueprint.product.pricingTier.starter}</div></div>
      <div class="price-box core"><div class="tier">Core</div><div class="amount">${blueprint.product.pricingTier.core}</div></div>
      <div class="price-box premium"><div class="tier">Premium</div><div class="amount">${blueprint.product.pricingTier.premium}</div></div>
    </div>
    ${blueprint.product.modules.map(m => `
    <div class="module">
      <div class="module-header">
        <div class="module-num">${m.number}</div>
        <div><div class="module-title">${m.title}</div><div class="module-goal">${m.goal}</div></div>
      </div>
      <div class="module-body">
        ${m.lessons.map(l => `<div class="lesson-item"><span class="lesson-dot">&#9658;</span><span>${l.title}</span></div>`).join("")}
      </div>
    </div>`).join("")}
  </div>

  <div class="divider"></div>

  <!-- Section 3: Sample Content -->
  <div class="section">
    <div class="section-head">
      <div class="section-bar"></div>
      <div class="section-head-inner">
        <div class="section-num">3</div>
        <div class="section-title">Sample Lesson: ${blueprint.content.sampleLesson.title}</div>
      </div>
    </div>
    <div class="content-intro">${blueprint.content.sampleLesson.introduction}</div>
    ${blueprint.content.sampleLesson.sections.map(s => `
    <div class="content-section">
      <h4>${s.heading}</h4>
      <p>${s.body}</p>
    </div>`).join("")}
    <div class="card">
      <div class="card-label">Key Takeaways</div>
      <ul class="takeaways">
        ${blueprint.content.sampleLesson.keyTakeaways.map(t => `<li>${t}</li>`).join("")}
      </ul>
    </div>
    <div class="card">
      <div class="card-label">Your Action Steps</div>
      <ol class="steps-list">
        ${blueprint.content.sampleLesson.actionSteps.map(s => `<li>${s}</li>`).join("")}
      </ol>
    </div>
  </div>

  <!-- Section 4: Funnel -->
  <div class="section">
    <div class="section-head">
      <div class="section-bar"></div>
      <div class="section-head-inner">
        <div class="section-num">4</div>
        <div class="section-title">Marketing Funnel</div>
      </div>
    </div>
    <div class="funnel-headline">${blueprint.funnel.headline}</div>
    <div class="funnel-sub">${blueprint.funnel.subheadline}</div>
    <div class="card"><div class="card-label">The Offer</div><div class="card-text">${blueprint.funnel.offer}</div></div>
    <div class="card"><div class="card-label">Urgency</div><div class="card-text">${blueprint.funnel.urgency}</div></div>
    <div class="divider"></div>
    <div style="font-size:10px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#00d4ff;margin-bottom:12px;">Email Sequence</div>
    ${blueprint.funnel.emailSequence.map(e => `
    <div class="email-row">
      <div class="email-day">Day ${e.day}</div>
      <div class="email-subject">${e.subject}</div>
      <div class="email-preview">${e.preview}</div>
      <div class="email-hook">&ldquo;${e.hook}&rdquo;</div>
    </div>`).join("")}
  </div>

  <div class="footer">
    <div class="footer-brand">
      <div class="footer-logo">N</div>
      <span class="footer-name">Nixio</span>
    </div>
    <span class="footer-right">nixio.app &mdash; Generated with AI &mdash; ${new Date().getFullYear()}</span>
  </div>
  </div><!-- /inner -->
</div><!-- /page -->
</body>
</html>`)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 600)
  }, [blueprint])

  const T = PDF_THEMES
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="h-full flex flex-col">
      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#6366f1" }} />
          <span className="text-xs font-semibold text-foreground truncate">{blueprint.title}</span>
          <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline ml-1">— Nixio Blueprint</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors shrink-0"
          style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 9.5H1a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1M2 4.5V1h9v3.5M2 7.5h9v4.5H2V7.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
          <span className="hidden sm:inline">Download</span> PDF
        </button>
      </div>

      {/* PDF canvas */}
      <div ref={pdfRef} className="flex-1 overflow-auto" style={{ background: "#f8f9fc" }}>
        <div className="max-w-[720px] mx-auto px-4 sm:px-10 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>

          {/* ── COVER ─────────────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden mb-10 relative" style={{ background: T.cover.bg, minHeight: 240 }}>
            {/* decorative circles */}
            <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-20" style={{ background: "#818cf8" }} />
            <div className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full opacity-15" style={{ background: "#a5b4fc" }} />
            <div className="relative z-10 p-7 sm:p-10">
              {/* eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{ background: "rgba(255,255,255,0.12)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1l1.5 3H9.5L7 6l1 3-3-2-3 2 1-3L.5 4H3.5L5 1Z" fill="#a5b4fc"/>
                </svg>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#c7d2fe" }}>Nixio Blueprint — {date}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3 text-balance">{blueprint.title}</h1>
              <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: "#c7d2fe" }}>{blueprint.tagline}</p>
              {/* scores strip */}
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "Market Demand", value: blueprint.idea.demandScore },
                  { label: "Monetization", value: blueprint.idea.monetizationScore },
                  { label: "Ease of Entry", value: 100 - blueprint.idea.difficultyScore },
                ].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-3xl font-black text-white leading-none">{s.value}</span>
                    <span className="text-[10px] font-semibold mt-0.5" style={{ color: "#a5b4fc" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 1 · IDEA VALIDATION ───────────────────────── */}
          <PdfSectionHeader num={1} title="Idea Validation" dot={T.idea.dot} accent={T.idea.accent} bg={T.idea.light} />

          {/* headline card */}
          <div className="rounded-xl border p-5 mb-4" style={{ background: T.idea.light, borderColor: T.idea.border }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: T.idea.accent }}>The Big Idea</p>
            <p className="text-base font-bold leading-snug" style={{ color: "#1e1b4b" }}>{blueprint.idea.headline}</p>
          </div>

          {/* score pills */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Market Demand", val: blueprint.idea.demandScore },
              { label: "Monetization", val: blueprint.idea.monetizationScore },
              { label: "Ease of Entry", val: 100 - blueprint.idea.difficultyScore },
            ].map(s => (
              <div key={s.label} className="rounded-xl border p-3 sm:p-4 text-center" style={{ background: "#fffbeb", borderColor: "#fbbf24" }}>
                <div className="text-2xl sm:text-3xl font-black leading-none mb-1" style={{ color: T.idea.accent }}>{s.val}</div>
                <div className="text-[10px] font-semibold" style={{ color: "#92400e" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {[
            { label: "Problem", text: blueprint.idea.problem },
            { label: "Solution", text: blueprint.idea.solution },
            { label: "Target Audience", text: blueprint.idea.audience },
            { label: "Unique Value Zone", text: blueprint.idea.uniqueValueZone },
          ].map(c => (
            <PdfCard key={c.label} label={c.label} text={c.text} accent={T.idea.accent} bg="#fffdf5" border={T.idea.border} />
          ))}

          {/* ── SECTION 2 · PRODUCT BLUEPRINT ─────────────────────── */}
          <PdfSectionHeader num={2} title="Product Blueprint" dot={T.product.dot} accent={T.product.accent} bg={T.product.light} />

          {/* transformation */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_32px_1fr] gap-3 mb-4 items-stretch">
            <div className="rounded-xl border p-4" style={{ background: "#fff7f7", borderColor: "#fca5a5" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#dc2626" }}>Before</p>
              <p className="text-sm leading-relaxed" style={{ color: "#7f1d1d" }}>{blueprint.product.transformationBefore}</p>
            </div>
            <div className="flex items-center justify-center text-xl font-black" style={{ color: T.product.accent }}>→</div>
            <div className="rounded-xl border p-4" style={{ background: T.product.light, borderColor: T.product.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: T.product.accent }}>After</p>
              <p className="text-sm leading-relaxed" style={{ color: "#064e3b" }}>{blueprint.product.transformationAfter}</p>
            </div>
          </div>

          <PdfCard label="Format" text={blueprint.product.format} accent={T.product.accent} bg={T.product.bg} border={T.product.border} />

          {/* pricing tiers */}
          <div className="grid grid-cols-3 gap-3 my-4">
            {[
              { tier: "Starter", val: blueprint.product.pricingTier.starter, bg: "#f8fafc", border: "#cbd5e1", color: "#475569" },
              { tier: "Core",    val: blueprint.product.pricingTier.core,    bg: T.product.light, border: T.product.border, color: T.product.accent },
              { tier: "Premium", val: blueprint.product.pricingTier.premium, bg: "#fefce8", border: "#fbbf24", color: "#b45309" },
            ].map(p => (
              <div key={p.tier} className="rounded-xl border p-3 sm:p-4 text-center" style={{ background: p.bg, borderColor: p.border }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: p.color }}>{p.tier}</p>
                <p className="text-lg sm:text-xl font-black" style={{ color: p.color }}>{p.val}</p>
              </div>
            ))}
          </div>

          {/* modules */}
          <div className="space-y-3">
            {blueprint.product.modules.map(m => (
              <div key={m.number} className="rounded-xl overflow-hidden border" style={{ borderColor: T.product.border }}>
                {/* module header */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: T.product.accent }}>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 bg-white" style={{ color: T.product.accent }}>{m.number}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{m.title}</p>
                    <p className="text-[11px] truncate" style={{ color: T.product.light }}>{m.goal}</p>
                  </div>
                </div>
                {/* lessons */}
                <div className="divide-y" style={{ background: T.product.bg, borderColor: "#bbf7d0" }}>
                  {m.lessons.map((l, i) => (
                    <div key={i} className="px-4 py-2.5 flex gap-2 items-start">
                      <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color: T.product.dot }}>▸</span>
                      <span className="text-sm" style={{ color: "#065f46" }}>{l.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── SECTION 3 · SAMPLE LESSON ─────────────────────────── */}
          <PdfSectionHeader num={3} title={`Sample Lesson: ${blueprint.content.sampleLesson.title}`} dot={T.content.dot} accent={T.content.accent} bg={T.content.light} />

          <div className="text-sm italic leading-relaxed mb-5 px-4 py-4 rounded-r-xl" style={{ borderLeft: `4px solid ${T.content.accent}`, background: T.content.light, color: "#1e3a8a" }}>
            {blueprint.content.sampleLesson.introduction}
          </div>

          {blueprint.content.sampleLesson.sections.map((s, i) => (
            <div key={i} className="mb-5 rounded-xl border p-4" style={{ background: T.content.bg, borderColor: T.content.border }}>
              <h4 className="text-sm font-bold mb-2" style={{ color: T.content.accent }}>{s.heading}</h4>
              <p className="text-sm leading-relaxed" style={{ color: "#1e3a8a" }}>{s.body}</p>
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* takeaways */}
            <div className="rounded-xl border p-4" style={{ background: T.content.bg, borderColor: T.content.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: T.content.accent }}>Key Takeaways</p>
              <ul className="space-y-2">
                {blueprint.content.sampleLesson.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: "#1e3a8a" }}>
                    <span className="font-black shrink-0" style={{ color: T.content.dot }}>✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            {/* action steps */}
            <div className="rounded-xl border p-4" style={{ background: T.content.bg, borderColor: T.content.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: T.content.accent }}>Action Steps</p>
              <ol className="space-y-2.5">
                {blueprint.content.sampleLesson.actionSteps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-sm items-start" style={{ color: "#1e3a8a" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 text-white" style={{ background: T.content.accent }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── SECTION 4 · MARKETING FUNNEL ──────────────────────── */}
          <PdfSectionHeader num={4} title="Marketing Funnel" dot={T.funnel.dot} accent={T.funnel.accent} bg={T.funnel.light} />

          {/* headline hero card */}
          <div className="rounded-2xl border p-6 sm:p-8 text-center mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#faf5ff 0%,#f3e8ff 100%)", borderColor: T.funnel.border }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: T.funnel.dot, transform: "translate(40%,-40%)" }} />
            <h2 className="text-xl sm:text-2xl font-black leading-tight mb-2" style={{ color: "#581c87" }}>{blueprint.funnel.headline}</h2>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#7e22ce" }}>{blueprint.funnel.subheadline}</p>
          </div>

          {[
            { label: "The Offer", text: blueprint.funnel.offer },
            { label: "Urgency", text: blueprint.funnel.urgency },
          ].map(c => (
            <PdfCard key={c.label} label={c.label} text={c.text} accent={T.funnel.accent} bg={T.funnel.bg} border={T.funnel.border} />
          ))}

          {/* email sequence */}
          <p className="text-[10px] font-bold uppercase tracking-widest mt-6 mb-3" style={{ color: T.funnel.accent }}>5-Email Launch Sequence</p>
          <div className="space-y-3">
            {blueprint.funnel.emailSequence.map((e, i) => (
              <div key={i} className="rounded-xl border p-4 flex gap-4 items-start" style={{ background: T.funnel.bg, borderColor: T.funnel.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white" style={{ background: T.funnel.accent }}>
                  D{e.day}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold mb-0.5 truncate" style={{ color: "#581c87" }}>{e.subject}</p>
                  <p className="text-xs mb-1" style={{ color: T.funnel.accent }}>{e.preview}</p>
                  <p className="text-xs italic" style={{ color: "#7e22ce" }}>&ldquo;{e.hook}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div className="mt-12 pt-6 flex items-center justify-between" style={{ borderTop: "1px solid #e2e8f0" }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-black" style={{ background: "#6366f1" }}>N</div>
              <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Nixio</span>
            </div>
            <span className="text-[10px]" style={{ color: "#cbd5e1" }}>nixio.app — {new Date().getFullYear()}</span>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── PDF section header ───────────────────────────────────────────────────────

function PdfSectionHeader({ num, title, dot, accent, bg }: { num: number; title: string; dot: string; accent: string; bg: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-10 pb-3" style={{ borderBottom: `2px solid ${dot}` }}>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 text-white" style={{ background: accent }}>{num}</span>
      <h2 className="text-lg font-black tracking-tight" style={{ color: "#0f172a" }}>{title}</h2>
      <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: bg, color: accent }}>Section {num}</span>
    </div>
  )
}

// ─── PDF info card ────────────────────────────────────────────────────────────

function PdfCard({ label, text, accent, bg, border }: { label: string; text: string; accent: string; bg: string; border: string }) {
  return (
    <div className="rounded-xl border p-4 mb-3" style={{ background: bg, borderColor: border }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>{label}</p>
      <p className="text-sm leading-relaxed" style={{ color: "#0f172a" }}>{text}</p>
    </div>
  )
}

// ─── Main Synthesizer Component ───────────────────────────────────────────────

interface SynthesizerClientProps {
  userName: string
  plan: string
  generationsUsed: number
  generationsLimit: number
  recentAssets: RecentAsset[]
}

export function SynthesizerClient({
  userName,
  plan,
  generationsUsed,
  generationsLimit,
  recentAssets,
}: SynthesizerClientProps) {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [error, setError] = useState<string | null>(null)
  const [loadedAsset, setLoadedAsset] = useState<RecentAsset | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const usagePercent = Math.min(100, Math.round((generationsUsed / generationsLimit) * 100))
  const atLimit = plan !== "pro" && generationsUsed >= generationsLimit

  async function handleGenerate() {
    if (!topic.trim() || loading || atLimit) return
    setError(null)
    setBlueprint(null)
    setLoadedAsset(null)
    setLoading(true)
    setCurrentStep(0)

    // Simulate progress through steps while waiting
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 2) return prev + 1
        clearInterval(stepInterval)
        return prev
      })
    }, 1800)

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()

      clearInterval(stepInterval)

      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.")
        setLoading(false)
        setCurrentStep(-1)
        return
      }

      setCurrentStep(STEPS.length - 1)
      await new Promise(r => setTimeout(r, 600))
      setBlueprint(data.blueprint)
      setActiveTab("Overview")
    } catch {
      setError("Network error. Please try again.")
      clearInterval(stepInterval)
    } finally {
      setLoading(false)
      setCurrentStep(-1)
    }
  }

  function loadAsset(asset: RecentAsset) {
    setBlueprint(asset.content)
    setLoadedAsset(asset)
    setActiveTab("Overview")
    setError(null)
  }

  const displayedBlueprint = blueprint

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0 gap-3">
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">
            Hey, <span className="text-primary">{userName || "there"}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {plan === "pro" ? "Pro — unlimited generations" : `${generationsUsed}/${generationsLimit} generations used`}
          </p>
        </div>
        {plan !== "pro" && (
          <Link
            href="/pricing"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-colors shrink-0 whitespace-nowrap"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Main area */}
      {!displayedBlueprint ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14 overflow-auto animate-fade-in">
          {/* Hero */}
          <div className="text-center mb-8 max-w-xl w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-primary">AI-powered — full blueprint in seconds</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-3 text-balance">
              One input.{" "}
              <span className="text-gradient">Your entire digital product.</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Type your niche, skill, or idea. Nixio validates, builds, writes, and generates a beautiful PDF — all at once.
            </p>
          </div>

          {/* Input */}
          <div className="w-full max-w-xl">
            <div className={`relative rounded-xl border transition-all duration-200 ${
              topic.length > 0 ? "border-primary/40 bg-card glow-primary" : "border-border bg-card"
            }`}>
              <textarea
                ref={textareaRef}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                placeholder="e.g. &quot;I teach productivity to remote workers&quot; or &quot;Fitness for busy moms&quot; or &quot;Email copywriting for SaaS companies&quot;"
                rows={3}
                disabled={loading}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none px-4 pt-4 pb-12 rounded-xl outline-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{topic.length > 0 ? "Enter to generate" : ""}</span>
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || loading || atLimit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1.5a5 5 0 1 0 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1L9 5H4L6.5 1Z" fill="currentColor"/>
                        <path d="M6.5 12V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Synthesize
                    </>
                  )}
                </button>
              </div>
            </div>

            {atLimit && (
              <p className="text-xs text-destructive mt-2 text-center">
                Generation limit reached.{" "}
                <Link href="/pricing" className="underline font-semibold">Upgrade to Pro</Link> for unlimited.
              </p>
            )}
            {error && (
              <div className="mt-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Progress steps */}
          {loading && currentStep >= 0 && (
            <div className="mt-8 w-full max-w-sm space-y-2.5 animate-fade-in">
              {STEPS.map((step, i) => {
                const done = i < currentStep
                const active = i === currentStep
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                      active
                        ? "border-primary/30 bg-primary/5"
                        : done
                        ? "border-border bg-card opacity-60"
                        : "border-transparent opacity-30"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      done
                        ? "bg-accent/20 text-accent"
                        : active
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : active ? (
                        <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 1.5a3.5 3.5 0 1 0 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      )}
                    </span>
                    <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {active && (
                      <span className="ml-auto flex gap-0.5">
                        {[0, 1, 2].map(d => (
                          <span key={d} className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                        ))}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Recent */}
          {!loading && recentAssets.length > 0 && (
            <div className="mt-12 w-full max-w-xl">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent blueprints</p>
              <div className="space-y-2">
                {recentAssets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => loadAsset(asset)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                        <path d="M3 2h6l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(asset.created_at).toLocaleDateString()}</p>
                    </div>
                    <svg className="text-muted-foreground group-hover:text-primary transition-colors" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // ─── Results View ─────────────────────────────────────────────────────
        <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
          {/* Tab bar */}
          <div className="flex items-center border-b border-border bg-card shrink-0 overflow-x-auto">
            <button
              onClick={() => { setBlueprint(null); setLoadedAsset(null) }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 border-r border-border"
              title="New synthesis"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">New</span>
            </button>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "PDF" ? (
                  <span className="flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 1h5l2.5 2.5V10H2V1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                      <path d="M7 1v2.5h2.5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                    </svg>
                    PDF
                  </span>
                ) : tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className={`flex-1 overflow-auto ${activeTab === "PDF" ? "flex flex-col" : "p-4 sm:p-6"}`}>
            {activeTab === "Overview" && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground">{displayedBlueprint.title}</h2>
                  <p className="text-muted-foreground mt-1">{displayedBlueprint.tagline}</p>
                </div>
                <div className="space-y-3">
                  <ScoreBar label="Market Demand" value={displayedBlueprint.idea.demandScore} />
                  <ScoreBar label="Monetization" value={displayedBlueprint.idea.monetizationScore} />
                  <ScoreBar label="Ease of Entry" value={displayedBlueprint.idea.difficultyScore} invert />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Big Idea", text: displayedBlueprint.idea.headline },
                    { label: "Target Audience", text: displayedBlueprint.idea.audience },
                    { label: "Problem", text: displayedBlueprint.idea.problem },
                    { label: "Solution", text: displayedBlueprint.idea.solution },
                    { label: "Unique Value Zone", text: displayedBlueprint.idea.uniqueValueZone },
                    { label: "Format", text: displayedBlueprint.product.format },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">{item.label}</p>
                      <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Pricing Tiers</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { tier: "Starter", val: displayedBlueprint.product.pricingTier.starter },
                      { tier: "Core", val: displayedBlueprint.product.pricingTier.core },
                      { tier: "Premium", val: displayedBlueprint.product.pricingTier.premium },
                    ].map(p => (
                      <div key={p.tier} className="text-center p-2 sm:p-3 rounded-lg bg-secondary border border-border">
                        <p className="text-[10px] text-muted-foreground mb-1">{p.tier}</p>
                        <p className="text-sm sm:text-lg font-bold text-foreground">{p.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("PDF")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M3 2h7l3 3v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  View &amp; Download PDF Blueprint
                </button>
              </div>
            )}

            {activeTab === "Product" && (
              <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-destructive mb-1.5">Before</p>
                    <p className="text-sm text-foreground leading-relaxed">{displayedBlueprint.product.transformationBefore}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1.5">After</p>
                    <p className="text-sm text-foreground leading-relaxed">{displayedBlueprint.product.transformationAfter}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Modules</p>
                {displayedBlueprint.product.modules.map(m => (
                  <div key={m.number} className="rounded-xl overflow-hidden border border-border">
                    <div className="flex items-center gap-3 px-4 py-3 bg-secondary">
                      <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{m.number}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.goal}</p>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {m.lessons.map((l, i) => (
                        <div key={i} className="px-4 py-2.5 flex gap-2 items-start">
                          <span className="text-primary mt-0.5 shrink-0">▸</span>
                          <div>
                            <p className="text-sm text-foreground">{l.title}</p>
                            {l.keyPoints?.length > 0 && (
                              <ul className="mt-1 space-y-0.5">
                                {l.keyPoints.map((kp, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                                    <span>·</span>{kp}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Content" && (
              <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sample Lesson from {displayedBlueprint.content.sampleLesson.module}</p>
                  <h2 className="text-xl font-bold text-foreground">{displayedBlueprint.content.sampleLesson.title}</h2>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground leading-relaxed italic">
                  {displayedBlueprint.content.sampleLesson.introduction}
                </div>
                {displayedBlueprint.content.sampleLesson.sections.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-card border border-border">
                    <h3 className="text-sm font-bold text-foreground mb-2">{s.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Key Takeaways</p>
                    <ul className="space-y-2">
                      {displayedBlueprint.content.sampleLesson.keyTakeaways.map((t, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground">
                          <span className="text-accent font-bold shrink-0">✓</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Action Steps</p>
                    <ol className="space-y-2">
                      {displayedBlueprint.content.sampleLesson.actionSteps.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground">
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Funnel" && (
              <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
                <div className="p-6 rounded-xl bg-card border border-border text-center">
                  <h2 className="text-xl font-extrabold text-foreground mb-2">{displayedBlueprint.funnel.headline}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{displayedBlueprint.funnel.subheadline}</p>
                </div>
                {[
                  { label: "The Offer", text: displayedBlueprint.funnel.offer },
                  { label: "Urgency", text: displayedBlueprint.funnel.urgency },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">{item.label}</p>
                    <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">5-Email Launch Sequence</p>
                  <div className="space-y-3">
                    {displayedBlueprint.funnel.emailSequence.map((e, i) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-primary">Day {e.day}</span>
                          <span className="text-xs font-medium text-foreground">{e.subject}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{e.preview}</p>
                        <p className="text-xs italic text-muted-foreground">&ldquo;{e.hook}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "PDF" && (
              <PDFViewer blueprint={displayedBlueprint} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
