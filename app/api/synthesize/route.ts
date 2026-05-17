import { createClient } from "@/lib/supabase/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

// AI provider — internal only, not exposed to users
const _aiProvider = createGroq({ apiKey: process.env.GROQ_API_KEY })

const MASTER_PROMPT = `You are Nixio, an elite AI product strategist. Given a user's topic, niche, or idea, you will generate a complete, actionable digital product blueprint in a SINGLE pass.

Return ONLY valid JSON in this exact structure (no markdown, no code fences, no extra text):

{
  "title": "Product name (compelling, clear)",
  "tagline": "One punchy sentence that sells it",
  "idea": {
    "headline": "The core idea in one sentence",
    "problem": "The exact pain this solves (2-3 sentences, very specific)",
    "solution": "How this product solves it (2-3 sentences)",
    "audience": "Exactly who this is for (be specific, not 'entrepreneurs')",
    "demandScore": 85,
    "monetizationScore": 90,
    "difficultyScore": 35,
    "uniqueValueZone": "Where the user's expertise meets market demand (2 sentences)"
  },
  "product": {
    "transformationBefore": "Where the customer is now (frustrated, stuck)",
    "transformationAfter": "Where the customer ends up (specific outcome)",
    "format": "e.g. 6-week online course / ebook / workshop / membership",
    "pricingTier": { "starter": "$97", "core": "$297", "premium": "$997" },
    "modules": [
      {
        "number": 1,
        "title": "Module title",
        "goal": "What the student achieves in this module",
        "lessons": [
          { "title": "Lesson title", "keyPoints": ["Point 1", "Point 2", "Point 3"] }
        ]
      }
    ]
  },
  "content": {
    "sampleLesson": {
      "title": "Full title of the sample lesson",
      "module": "Which module it belongs to",
      "introduction": "2-3 sentence hook that draws readers in",
      "sections": [
        { "heading": "Section heading", "body": "Full section content (150-200 words per section, practical and engaging)" }
      ],
      "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4", "Takeaway 5"],
      "actionSteps": ["Step 1 (specific and doable today)", "Step 2", "Step 3"]
    }
  },
  "funnel": {
    "headline": "Main headline (AIDA formula)",
    "subheadline": "Supporting line that builds curiosity",
    "offer": "What exactly they get (bullet list style, 5 items)",
    "urgency": "Why buy now (genuine, not fake)",
    "cta": "Call to action button text",
    "emailSequence": [
      { "day": 0, "subject": "Subject line", "preview": "Preview text", "hook": "Opening line" },
      { "day": 1, "subject": "Subject line", "preview": "Preview text", "hook": "Opening line" },
      { "day": 3, "subject": "Subject line", "preview": "Preview text", "hook": "Opening line" },
      { "day": 5, "subject": "Subject line", "preview": "Preview text", "hook": "Opening line" },
      { "day": 7, "subject": "Subject line", "preview": "Preview text", "hook": "Opening line" }
    ]
  }
}

Be extremely specific. Use the user's actual topic. Generate real, usable content — not placeholders. Make the modules and lessons genuinely valuable. Write the sample lesson section content at length (at least 150 words per section body).`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("generations_used, generations_limit, plan")
      .eq("id", user.id)
      .single()

    if (
      profile &&
      profile.plan !== "pro" &&
      (profile.generations_used || 0) >= (profile.generations_limit || 10)
    ) {
      return NextResponse.json(
        { error: "Generation limit reached. Upgrade to Pro for unlimited generations." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { topic } = body

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic." }, { status: 400 })
    }

    const { text } = await generateText({
      model: _aiProvider("llama-3.3-70b-versatile"),
      system: MASTER_PROMPT,
      prompt: `Create a complete digital product blueprint for this topic/niche: "${topic.trim()}"`,
      maxTokens: 8000,
    })

    // Clean the response - strip any markdown fences if present
    let cleanText = text.trim()
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    }

    let parsed: any
    try {
      parsed = JSON.parse(cleanText)
    } catch {
      // Try to extract JSON
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        return NextResponse.json({ error: "AI returned malformed response. Please try again." }, { status: 500 })
      }
    }

    // Increment usage
    await supabase
      .from("profiles")
      .update({ generations_used: (profile?.generations_used || 0) + 1 })
      .eq("id", user.id)

    // Persist to DB
    const { data: asset } = await supabase
      .from("assets")
      .insert({
        user_id: user.id,
        name: parsed.title || topic,
        type: "blueprint",
        content: parsed,
      })
      .select("id")
      .single()

    return NextResponse.json({ blueprint: parsed, assetId: asset?.id })
  } catch (error: any) {
    console.error("Synthesize API error:", error)
    return NextResponse.json(
      { error: error.message || "Generation failed. Please try again." },
      { status: 500 }
    )
  }
}
