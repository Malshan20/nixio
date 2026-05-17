import { createClient } from "@/lib/supabase/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

const _aiProvider = createGroq({ apiKey: process.env.GROQ_API_KEY })

// ─── Per-type prompts ─────────────────────────────────────────────────────────

const PROMPTS: Record<string, string> = {
  ebook: `You are an expert ebook author. Given a digital product blueprint, write a full, premium ebook document.

Return ONLY valid JSON:
{
  "type": "ebook",
  "title": "Full ebook title",
  "subtitle": "Compelling subtitle",
  "author": "Author placeholder",
  "introduction": "A powerful 3-paragraph introduction (200+ words total) that hooks the reader",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "tagline": "One line teaser",
      "body": "Full chapter content (300+ words, practical, story-driven, with actionable insights)",
      "keyInsight": "The single most important insight from this chapter",
      "exercises": ["Exercise 1 (specific, doable)", "Exercise 2", "Exercise 3"]
    }
  ],
  "conclusion": "A 2-paragraph inspiring conclusion that motivates action",
  "resourceList": ["Resource 1 with description", "Resource 2", "Resource 3", "Resource 4", "Resource 5"]
}

Write at least 5 rich chapters. Each chapter body must be 300+ words of real, valuable content.`,

  workbook: `You are an expert instructional designer. Given a digital product blueprint, create a comprehensive workbook with exercises.

Return ONLY valid JSON:
{
  "type": "workbook",
  "title": "Workbook title",
  "subtitle": "Subtitle",
  "howToUse": "3-sentence guide on how to use this workbook effectively",
  "modules": [
    {
      "number": 1,
      "title": "Module title",
      "objective": "What the student will achieve",
      "warmUp": "A quick 2-minute reflection prompt to start",
      "exercises": [
        {
          "number": 1,
          "title": "Exercise title",
          "instructions": "Clear, step-by-step instructions (3-5 sentences)",
          "prompt": "The actual exercise prompt or question",
          "workSpace": "Space for notes (leave this as empty string or 'Use the space below to write your answer.')",
          "debrief": "What to do after completing the exercise"
        }
      ],
      "reflection": "End-of-module reflection question",
      "commitmentPrompt": "I commit to... (fill in the blank style)"
    }
  ],
  "finalChallenge": "A capstone challenge that ties all modules together",
  "progressTracker": ["Milestone 1", "Milestone 2", "Milestone 3", "Milestone 4", "Milestone 5"]
}

Generate at least 5 modules with 3 exercises each.`,

  checklist: `You are a productivity expert. Given a digital product blueprint, create a comprehensive, actionable checklist.

Return ONLY valid JSON:
{
  "type": "checklist",
  "title": "Checklist title",
  "subtitle": "Subtitle",
  "tagline": "A punchy one-liner about what this checklist achieves",
  "phases": [
    {
      "phase": 1,
      "name": "Phase name (e.g. Foundation, Launch, Scale)",
      "timeframe": "e.g. Week 1",
      "goal": "What completing this phase achieves",
      "items": [
        { "task": "Specific, actionable task", "why": "Why this matters (one sentence)", "done": false }
      ]
    }
  ],
  "quickWins": ["Quick win 1 (can be done in under 30 min)", "Quick win 2", "Quick win 3", "Quick win 4", "Quick win 5"],
  "commonMistakes": ["Mistake 1 to avoid", "Mistake 2", "Mistake 3"],
  "successMetrics": ["How to know phase 1 is done", "How to know phase 2 is done", "Overall success metric"]
}

Create 5 phases with 6-8 checklist items each.`,

  framework: `You are a strategic consultant. Given a digital product blueprint, create a proprietary framework document.

Return ONLY valid JSON:
{
  "type": "framework",
  "title": "Framework name (catchy acronym or branded name)",
  "subtitle": "Subtitle",
  "tagline": "One sentence that captures the framework's power",
  "overview": "2-paragraph explanation of why this framework exists and who it's for",
  "acronym": {
    "word": "The acronym letters (e.g. GROW, SCALE, LAUNCH)",
    "letters": [
      { "letter": "G", "stands_for": "Word", "meaning": "What this step means", "description": "2-3 sentences explaining this step in detail", "actions": ["Action 1", "Action 2", "Action 3"] }
    ]
  },
  "steps": [
    {
      "number": 1,
      "name": "Step name",
      "description": "Detailed description (150+ words)",
      "tools": ["Tool or technique 1", "Tool 2", "Tool 3"],
      "commonBlocks": ["Block people face here", "Another block"],
      "outcome": "What success looks like at this step"
    }
  ],
  "caseStudy": {
    "persona": "Fictional but realistic student persona",
    "before": "Their situation before the framework",
    "after": "Their transformation after 90 days",
    "keyMoment": "The pivotal moment where the framework clicked"
  },
  "faq": [
    { "q": "Common question", "a": "Clear, concise answer" }
  ]
}

Make the acronym match the number of steps. Create 5-6 steps.`,

  sales: `You are a world-class copywriter and offer strategist. Given a digital product blueprint, write a premium sales document.

Return ONLY valid JSON:
{
  "type": "sales",
  "productName": "Product name",
  "headline": "The main sales headline (powerful, benefit-driven)",
  "subheadline": "Supporting headline that builds intrigue",
  "openingStory": "2-3 paragraph relatable story that hooks the reader into the problem",
  "problemSection": {
    "heading": "The Problem heading",
    "body": "Detailed articulation of the pain (150+ words, very specific, resonant)",
    "agitators": ["Pain point 1 (visceral, specific)", "Pain point 2", "Pain point 3", "Pain point 4", "Pain point 5"]
  },
  "solutionSection": {
    "heading": "The Solution heading",
    "body": "How this product solves it (150+ words)",
    "differentiators": ["Why this is different 1", "Why different 2", "Why different 3"]
  },
  "valueStack": [
    { "item": "Component name", "description": "What it includes", "perceivedValue": "$X value", "included": true }
  ],
  "pricing": {
    "anchor": "Original / full price",
    "offer": "Today's price",
    "justification": "Why this price is a no-brainer (2-3 sentences)",
    "guarantee": "Money-back guarantee details",
    "urgency": "Why act now"
  },
  "testimonials": [
    { "name": "First name only", "result": "Specific, believable result they got", "quote": "Full testimonial quote (2-3 sentences, specific and credible)" }
  ],
  "faq": [
    { "q": "Common objection as a question", "a": "Answer that overcomes the objection" }
  ],
  "cta": { "primary": "Main CTA button text", "secondary": "Secondary action text", "closing": "Final line that creates urgency" }
}

Write 6+ value stack items, 5+ testimonials, 6+ FAQs. Make everything feel real and specific.`,
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { pdfType, blueprint, assetId } = await request.json()

    if (!pdfType || !blueprint) {
      return NextResponse.json({ error: "Missing pdfType or blueprint" }, { status: 400 })
    }

    const prompt = PROMPTS[pdfType]
    if (!prompt) {
      return NextResponse.json({ error: "Unknown PDF type" }, { status: 400 })
    }

    const { text } = await generateText({
      model: _aiProvider("llama-3.3-70b-versatile"),
      system: prompt,
      prompt: `Blueprint data:\n${JSON.stringify(blueprint, null, 2)}`,
      maxTokens: 8000,
    })

    let clean = text.trim()
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    }

    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
      else return NextResponse.json({ error: "AI returned malformed response." }, { status: 500 })
    }

    // Save to pdf_assets
    const { data: saved, error: saveError } = await supabase
      .from("pdf_assets")
      .insert({
        user_id: user.id,
        blueprint_id: assetId || null,
        type: pdfType,
        title: parsed.title || parsed.productName || blueprint.title,
        content_json: parsed,
      })
      .select("id")
      .single()

    if (saveError) console.error("Save error:", saveError)

    return NextResponse.json({ pdf: parsed, pdfAssetId: saved?.id })
  } catch (error: any) {
    console.error("PDF generate error:", error)
    return NextResponse.json({ error: error.message || "Generation failed." }, { status: 500 })
  }
}
