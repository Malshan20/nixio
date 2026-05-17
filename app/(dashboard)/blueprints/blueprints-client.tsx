"use client"

import { useState } from "react"
import Link from "next/link"

interface Asset {
  id: string
  name: string
  created_at: string
  content: any
}

export function BlueprintsClient({ assets }: { assets: Asset[] }) {
  const [selected, setSelected] = useState<Asset | null>(null)

  function handlePrint(asset: Asset) {
    const bp = asset.content
    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${bp.title} — Nixio Blueprint</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #0f172a; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 48px; }
    .cover { background: linear-gradient(135deg, #080c10 0%, #0e1e30 100%); color: #fff; padding: 48px; border-radius: 12px; margin-bottom: 48px; }
    .cover-tag { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #00d4ff; margin-bottom: 16px; }
    .cover-title { font-size: 36px; font-weight: 800; line-height: 1.1; margin-bottom: 12px; }
    .cover-tagline { font-size: 15px; color: #94a3b8; margin-bottom: 24px; }
    .cover-scores { display: flex; gap: 32px; }
    .score-item strong { color: #00d4ff; display: block; font-size: 22px; font-weight: 700; }
    .score-item { font-size: 11px; color: #64748b; }
    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 36px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
    .label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #00d4ff; margin-bottom: 6px; }
    .text { font-size: 14px; line-height: 1.6; color: #334155; }
    .module { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .mod-header { background: #0f172a; color: #fff; padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; }
    .mod-num { background: #00d4ff; color: #080c10; width: 20px; height: 20px; border-radius: 4px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .lesson { padding: 8px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; display: flex; gap: 8px; }
    .lesson:last-child { border-bottom: none; }
    .email-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
    .day { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #00d4ff; margin-bottom: 4px; }
    .subject { font-size: 14px; font-weight: 600; color: #0f172a; }
    .preview { font-size: 12px; color: #64748b; margin-top: 2px; }
    .hook { font-size: 12px; color: #334155; font-style: italic; margin-top: 3px; }
    .content-intro { font-size: 14px; font-style: italic; color: #475569; line-height: 1.6; padding: 14px; background: #f8fafc; border-left: 3px solid #00d4ff; border-radius: 0 8px 8px 0; margin-bottom: 16px; }
    .section-heading { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; margin-top: 16px; }
    .section-body { font-size: 13px; line-height: 1.7; color: #334155; }
    .takeaway { font-size: 13px; color: #334155; padding: 6px 0; border-bottom: 1px solid #f1f5f9; display: flex; gap: 8px; }
    .check { color: #00d4ff; font-weight: 700; }
    .step { font-size: 13px; color: #334155; padding: 8px 0 8px 28px; position: relative; border-bottom: 1px solid #f1f5f9; }
    .step-num { position: absolute; left: 0; width: 20px; height: 20px; background: #00d4ff; color: #080c10; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; top: 8px; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
<div class="page">
  <div class="cover">
    <div class="cover-tag">Nixio Blueprint &mdash; ${new Date(asset.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
    <div class="cover-title">${bp.title}</div>
    <div class="cover-tagline">${bp.tagline}</div>
    <div class="cover-scores">
      <div class="score-item"><strong>${bp.idea.demandScore}</strong>Demand</div>
      <div class="score-item"><strong>${bp.idea.monetizationScore}</strong>Monetization</div>
      <div class="score-item"><strong>${100 - bp.idea.difficultyScore}</strong>Ease</div>
    </div>
  </div>
  <h2>1. Idea Validation</h2>
  <div class="card"><div class="label">Big Idea</div><div class="text">${bp.idea.headline}</div></div>
  <div class="card"><div class="label">Problem</div><div class="text">${bp.idea.problem}</div></div>
  <div class="card"><div class="label">Solution</div><div class="text">${bp.idea.solution}</div></div>
  <div class="card"><div class="label">Audience</div><div class="text">${bp.idea.audience}</div></div>
  <div class="card"><div class="label">Unique Value Zone</div><div class="text">${bp.idea.uniqueValueZone}</div></div>
  <h2>2. Product Blueprint</h2>
  <div class="card"><div class="label">Format</div><div class="text">${bp.product.format}</div></div>
  ${bp.product.modules.map((m: any) => `
    <div class="module">
      <div class="mod-header"><div class="mod-num">${m.number}</div>${m.title}</div>
      ${m.lessons.map((l: any) => `<div class="lesson"><span style="color:#00d4ff">▸</span>${l.title}</div>`).join("")}
    </div>`).join("")}
  <h2>3. Sample Lesson</h2>
  <div class="content-intro">${bp.content.sampleLesson.introduction}</div>
  ${bp.content.sampleLesson.sections.map((s: any) => `<div class="section-heading">${s.heading}</div><div class="section-body">${s.body}</div>`).join("")}
  <div class="card" style="margin-top:16px">
    <div class="label">Key Takeaways</div>
    ${bp.content.sampleLesson.keyTakeaways.map((t: string) => `<div class="takeaway"><span class="check">✓</span>${t}</div>`).join("")}
  </div>
  <h2>4. Marketing Funnel</h2>
  <div class="card"><div class="label">Headline</div><div class="text" style="font-size:16px;font-weight:700">${bp.funnel.headline}</div></div>
  <div class="card"><div class="label">The Offer</div><div class="text">${bp.funnel.offer}</div></div>
  <div class="label" style="margin-top:16px;margin-bottom:10px">Email Sequence</div>
  ${bp.funnel.emailSequence.map((e: any) => `
    <div class="email-card">
      <div class="day">Day ${e.day}</div>
      <div class="subject">${e.subject}</div>
      <div class="preview">${e.preview}</div>
      <div class="hook">"${e.hook}"</div>
    </div>`).join("")}
  <div class="footer">Generated by Nixio &mdash; nixio.app &mdash; ${new Date().getFullYear()}</div>
</div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 600)
  }

  if (assets.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-primary">
            <path d="M5 3h10l4 4v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M15 3v4h4M7 11h8M7 14.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">No blueprints yet</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
          Run your first synthesis and your blueprint will appear here for easy access and PDF download.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Create your first blueprint
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Your Blueprints</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{assets.length} blueprint{assets.length !== 1 ? "s" : ""} generated</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Blueprint
        </Link>
      </div>

      {selected ? (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to blueprints
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{selected.content.title}</h2>
              <p className="text-sm text-muted-foreground">{selected.content.tagline}</p>
            </div>
            <button
              onClick={() => handlePrint(selected)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 9.5H1a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1M2 4.5V1h9v3.5M2 7.5h9v4.5H2V7.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
              </svg>
              Download PDF
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Demand", val: selected.content.idea.demandScore },
              { label: "Monetization", val: selected.content.idea.monetizationScore },
              { label: "Ease", val: 100 - selected.content.idea.difficultyScore },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <div className="text-2xl font-extrabold text-primary">{s.val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          {[
            { label: "Problem", text: selected.content.idea.problem },
            { label: "Solution", text: selected.content.idea.solution },
            { label: "Audience", text: selected.content.idea.audience },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">{item.label}</p>
              <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Modules</p>
          {selected.content.product.modules.map((m: any) => (
            <div key={m.number} className="rounded-xl overflow-hidden border border-border">
              <div className="flex items-center gap-3 px-4 py-3 bg-secondary">
                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{m.number}</span>
                <p className="text-sm font-semibold text-foreground">{m.title}</p>
              </div>
              <div className="divide-y divide-border">
                {m.lessons.map((l: any, i: number) => (
                  <div key={i} className="px-4 py-2.5 flex gap-2 text-sm text-foreground">
                    <span className="text-primary shrink-0">▸</span>{l.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M3 2h7l4 4v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M5 9h6M5 11.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(asset.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePrint(asset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 8.5H1a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5V8a.5.5 0 0 1-.5.5h-1M2 4V1h8v3M2 7h8v4H2V7Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => setSelected(asset)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs font-medium hover:border-primary/30 transition-colors"
                >
                  View
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6h6M7 4l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
