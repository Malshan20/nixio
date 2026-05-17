"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Idea {
  title: string
  description: string
  demandScore: number
  monetizationScore: number
  difficultyScore: number
  targetAudience: string
  quickWin: string
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}/100</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function IdeaCard({ idea, onSave, saving }: { idea: Idea; onSave: (idea: Idea) => void; saving: boolean }) {
  const easeScore = 100 - idea.difficultyScore
  return (
    <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-bold text-foreground leading-snug">{idea.title}</h3>
        <button
          onClick={() => onSave(idea)}
          disabled={saving}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20 hover:bg-primary/15 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{idea.description}</p>

      <div className="space-y-2.5 mb-4">
        <ScoreBar label="Demand" value={idea.demandScore} color="bg-primary" />
        <ScoreBar label="Monetization" value={idea.monetizationScore} color="bg-accent" />
        <ScoreBar label="Ease" value={easeScore} color="bg-yellow-400" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-muted-foreground shrink-0">Audience:</span>
          <span className="text-foreground">{idea.targetAudience}</span>
        </div>
        <div className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-accent/5 border border-accent/15">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5 text-accent">
            <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-accent font-medium">{idea.quickWin}</span>
        </div>
      </div>
    </div>
  )
}

export default function IdeasPage() {
  const [skills, setSkills] = useState("")
  const [interests, setInterests] = useState("")
  const [audience, setAudience] = useState("")
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  async function generateIdeas(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setIdeas([])

    const prompt = `Skills: ${skills}\nInterests: ${interests}${audience ? `\nTarget audience: ${audience}` : ""}\n\nGenerate 5 ranked business idea suggestions as a JSON array.`

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ideas", prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate")

      const jsonMatch = data.result.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setIdeas(parsed)
      } else {
        throw new Error("Could not parse ideas response")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveIdea(idea: Idea) {
    setSavingId(idea.title)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("ideas").insert({
      user_id: user.id,
      title: idea.title,
      description: idea.description,
      demand_score: idea.demandScore,
      monetization_score: idea.monetizationScore,
      difficulty_score: idea.difficultyScore,
      target_audience: idea.targetAudience,
      skills,
      interests,
      raw_data: idea,
    })

    if (!error) setSavedIds(prev => new Set([...prev, idea.title]))
    setSavingId(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Idea Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">Turn your skills and interests into ranked business ideas with market scores.</p>
      </div>

      <form onSubmit={generateIdeas} className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your skills</label>
            <textarea
              value={skills}
              onChange={e => setSkills(e.target.value)}
              required
              placeholder="e.g. web design, copywriting, Excel, social media..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your interests</label>
            <textarea
              value={interests}
              onChange={e => setInterests(e.target.value)}
              required
              placeholder="e.g. fitness, personal finance, productivity, cooking..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target audience <span className="normal-case font-normal">(optional)</span></label>
          <input
            type="text"
            value={audience}
            onChange={e => setAudience(e.target.value)}
            placeholder="e.g. busy professionals, new parents, small business owners..."
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? (
            <><span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Generating ideas...</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5L12 6 8.5 7.5 7 11 5.5 7.5 2 6l3.5-1.5L7 1Z" fill="currentColor"/></svg> Generate 5 ideas</>
          )}
        </button>
      </form>

      {ideas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            {ideas.length} ideas generated — sorted by opportunity score
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.title}
                idea={idea}
                onSave={saveIdea}
                saving={savingId === idea.title}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
