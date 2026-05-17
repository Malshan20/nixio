// app/api/market-intelligence/generate/route.ts
// Generates a market-validated blueprint using REAL Whop data from the intelligence route

import { createClient } from "@/lib/supabase/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
      return NextResponse.json({ error: "Generation limit reached. Upgrade to Pro." }, { status: 429 })
    }

    const { niche, marketData, angle } = await request.json()
    if (!niche || !marketData) {
      return NextResponse.json({ error: "Missing niche or market data." }, { status: 400 })
    }

    // ── Build rich real-data context ──────────────────────────────────────────

    // Real products found on Whop
    const realProducts = (marketData.products || [])
      .filter((p: any) => p.source !== "ai-generated") // only real scraped ones
      .slice(0, 8)
      .map((p: any, i: number) =>
        `${i + 1}. "${p.name}"` +
        (p.price && p.price !== "Varies" ? ` | ${p.price}` : "") +
        (p.rating ? ` | ⭐ ${p.rating}` : "") +
        (p.reviewCount ? ` | ${p.reviewCount} reviews` : "") +
        (p.memberCount ? ` | ${p.memberCount} members` : "") +
        (p.description ? `\n   "${p.description}"` : "") +
        (p.whyItWins ? `\n   Why it wins: ${p.whyItWins}` : "") +
        `\n   ${p.url}`
      )
      .join("\n\n")

    // Real price analytics
    const pa = marketData.realPriceAnalytics
    const realPriceContext = pa?.avg
      ? `REAL scraped pricing:
- Average: $${pa.avg} | Median: $${pa.median}
- Range: $${pa.min} — $${pa.max}
- Distribution: ${(pa.distribution || []).map((d: any) => `${d.label}: ${d.pct}%`).join(" | ")}
- Products with real price data: ${pa.count}`
      : `Pricing: limited data (${marketData.dataQuality?.withRealPrice || 0} products with confirmed prices)`

    // Real keywords
    const realKeywords = (marketData.realKeywords || marketData.topKeywords || []).join(", ")

    // Real gaps
    const realGaps = (marketData.gaps || [])
      .map((g: any) => `- ${g.title}: ${g.description}`)
      .join("\n")

    // Competitor weaknesses
    const weaknesses = (marketData.competitorWeaknesses || []).join(" | ")

    // Winning formats
    const formats = (marketData.winningFormats || [])
      .map((f: any) => `${f.format} (${f.share}% market share, ~${f.avgRevenue} avg revenue)`)
      .join(", ")

    // Data quality context for prompt
    const dq = marketData.dataQuality || {}
    const dataNote = dq.isRealData
      ? `Note: This analysis is based on ${dq.productsFound} REAL products scraped live from Whop. Use this data directly.`
      : `Note: Limited live scraping data. The market scores and product list are AI-estimated based on Whop market knowledge.`

    // ── Prompt construction ───────────────────────────────────────────────────

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are Nixio — an elite AI product strategist powered by live Whop marketplace intelligence.
You generate digital product blueprints that are specifically designed to WIN against existing competition based on real market data.

ABSOLUTE RULES:
- Every output must be SPECIFIC to the "${niche}" niche and grounded in the real market data provided
- Module titles must show transformation (not topics): "Land Your First Client in 48 Hours" not "Introduction to Freelancing"
- Pricing must be strategically positioned against the real competitor prices shown
- The product must directly exploit one of the identified market gaps
- Sample lesson body must be minimum 180 words — genuine expert content, not filler
- BANNED: "in today's world", "it's important to", "leverage", "utilize", "synergy", "game-changing"
- Return ONLY valid JSON. No markdown. No code fences. First character must be {`,
      prompt: `Create a market-validated digital product blueprint for the "${niche}" niche.

${dataNote}

=== REAL MARKET INTELLIGENCE ===

Market Scores:
- Demand: ${marketData.demandScore}/100
- Competition: ${marketData.competitionLevel} (${marketData.competitionScore}/100)
- Revenue Potential: ${marketData.revenuePotential} (${marketData.revenuePotentialScore}/100)
- Market Maturity: ${marketData.marketMaturity}
- Trending: ${marketData.trending ? "Yes ↑" : "Stable"} (${marketData.trendDirection}, ${marketData.trendPercentage}% YoY)

${realPriceContext}

Buyer Persona: ${marketData.buyerPersona}

Pain Points:
${(marketData.painPoints || []).map((p: string) => `- ${p}`).join("\n")}

Winning Formats: ${formats}

Real Market Gaps to Exploit:
${realGaps}

Competitor Weaknesses: ${weaknesses}

Real Keywords from Products: ${realKeywords}

AI Market Verdict: ${marketData.aiVerdict}
Winning Angle: ${marketData.winningAngle}

${realProducts ? `=== REAL COMPETITOR PRODUCTS ON WHOP ===\n${realProducts}` : ""}

${angle ? `=== USER'S CHOSEN ANGLE ===\n${angle}` : ""}

Recommended Entry Price: ${marketData.recommendedEntryPrice}
Pricing Insight: ${marketData.pricingInsight}

=== YOUR TASK ===
Design a product that:
1. Fills the BIGGEST gap identified above
2. Is priced strategically vs real competitor prices
3. Targets the exact buyer persona described
4. Has a positioning angle that directly addresses competitor weaknesses
5. Uses the winning format for this market

Return this exact JSON:
{
  "title": "Product name — specific, gap-filling, NOT generic",
  "tagline": "One punchy sentence that sells it — references the specific transformation",
  "marketEdge": "2 sentences: exactly how this beats the real competitors listed above",
  "positioningStatement": "1 sentence: the unique angle that no existing product covers",
  "idea": {
    "headline": "Core idea in one sentence",
    "problem": "The exact pain this solves — 3 sentences, specific to this market's real buyer persona",
    "solution": "How this product uniquely solves it — 3 sentences, reference the gap being filled",
    "audience": "Exact buyer persona — specific age range, situation, what they've tried, what they want in 30 days",
    "demandScore": ${marketData.demandScore},
    "monetizationScore": ${Math.min(100, (marketData.revenuePotentialScore || 75) + 5)},
    "difficultyScore": ${marketData.competitionScore},
    "uniqueValueZone": "The specific gap this fills and why buyers will choose it over the ${(marketData.products || []).length} existing alternatives"
  },
  "product": {
    "transformationBefore": "Where the customer is now — specific, emotional, references real pain points from the market data",
    "transformationAfter": "Where they end up — concrete measurable outcome with a timeframe",
    "format": "Best format based on winning market formats: ${formats}",
    "pricingTier": {
      "starter": "${marketData.priceRange?.min || marketData.realPriceAnalytics?.min ? `$${marketData.realPriceAnalytics?.min}` : "$47"}",
      "core": "${marketData.recommendedEntryPrice || "$97"}",
      "premium": "${marketData.priceRange?.max || marketData.realPriceAnalytics?.max ? `$${Math.min(marketData.realPriceAnalytics?.max || 497, 997)}` : "$297"}"
    },
    "pricingRationale": "2 sentences explaining why these specific prices beat the competition based on the real price data",
    "modules": [
      {
        "number": 1,
        "title": "Transformation-based module title",
        "goal": "Specific measurable outcome of this module",
        "lessons": [
          {
            "title": "Specific lesson title",
            "keyPoints": ["Specific actionable insight 1", "Specific insight 2", "Specific insight 3"]
          }
        ]
      },
      {
        "number": 2,
        "title": "Transformation-based module title",
        "goal": "Specific measurable outcome",
        "lessons": [
          {
            "title": "Specific lesson title",
            "keyPoints": ["Insight 1", "Insight 2", "Insight 3"]
          }
        ]
      },
      {
        "number": 3,
        "title": "Transformation-based module title",
        "goal": "Specific measurable outcome",
        "lessons": [
          {
            "title": "Specific lesson title",
            "keyPoints": ["Insight 1", "Insight 2", "Insight 3"]
          }
        ]
      },
      {
        "number": 4,
        "title": "Transformation-based module title",
        "goal": "Specific measurable outcome",
        "lessons": [
          {
            "title": "Specific lesson title",
            "keyPoints": ["Insight 1", "Insight 2", "Insight 3"]
          }
        ]
      },
      {
        "number": 5,
        "title": "Transformation-based module title",
        "goal": "Specific measurable outcome",
        "lessons": [
          {
            "title": "Specific lesson title",
            "keyPoints": ["Insight 1", "Insight 2", "Insight 3"]
          }
        ]
      }
    ]
  },
  "content": {
    "sampleLesson": {
      "title": "The most compelling lesson in the product",
      "module": "Which module this belongs to",
      "introduction": "3-4 sentences. Hook immediately — story, shocking fact, or bold claim. NO 'In this lesson we will...'",
      "sections": [
        {
          "heading": "Outcome-focused section heading",
          "body": "MINIMUM 180 words. Expert content. Specific examples. Real numbers where relevant. Something they couldn't easily Google."
        },
        {
          "heading": "Section 2 heading",
          "body": "MINIMUM 180 words. Different angle. More practical."
        }
      ],
      "keyTakeaways": ["Insight 1 — a revelation", "Insight 2", "Insight 3", "Insight 4", "Insight 5"],
      "actionSteps": ["Specific step 1 — startable in next 10 minutes", "Step 2", "Step 3"]
    }
  },
  "funnel": {
    "headline": "AIDA formula — so specific it could only be for this product in this market",
    "subheadline": "Differentiates from the real competitors listed above",
    "offer": "What exactly they get — 5 outcome-focused bullets (not features)",
    "urgency": "Genuine, logical urgency based on this specific market's dynamics",
    "cta": "Outcome-focused CTA button text",
    "emailSequence": [
      { "day": 0, "subject": "Subject so relevant they open immediately", "preview": "Preview deepens the hook", "hook": "Opening line so specific they think you wrote it just for them" },
      { "day": 1, "subject": "Day 1 — new angle, builds on day 0", "preview": "Preview text", "hook": "Different hook, same reader" },
      { "day": 3, "subject": "Address the main objection head on", "preview": "Preview text", "hook": "Tackle the doubt directly" },
      { "day": 5, "subject": "Social proof angle", "preview": "Preview text", "hook": "Lead with a result" },
      { "day": 7, "subject": "Final nudge — genuine urgency", "preview": "Preview text", "hook": "Make missing out feel real" }
    ]
  },
  "launchStrategy": {
    "week1": "Specific actions for week 1 based on this market",
    "week2": "Specific actions for week 2",
    "week3": "Specific actions for week 3",
    "firstSaleTarget": "${marketData.estimatedTimeToFirstSale}",
    "channels": ["Best channel 1 for this niche", "Channel 2", "Channel 3"]
  },
  "competitiveAdvantage": {
    "vs_market": "How this beats the ${(marketData.products || []).length} existing Whop products",
    "pricing_edge": "Pricing strategy advantage based on real market data",
    "content_edge": "What this delivers that existing products don't"
  }
}

Be extremely specific. Use the market data throughout. Generate real, usable content.`,
      maxTokens: 8000,
      temperature: 0.65,
    })

    // ── Parse response ────────────────────────────────────────────────────────
    let clean = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const fb = clean.indexOf("{")
    const lb = clean.lastIndexOf("}")
    if (fb !== -1 && lb !== -1) clean = clean.slice(fb, lb + 1)

    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      const m = clean.match(/\{[\s\S]*\}/)
      if (!m) return NextResponse.json({ error: "AI returned malformed response. Please try again." }, { status: 500 })
      try { parsed = JSON.parse(m[0]) }
      catch { return NextResponse.json({ error: "AI returned malformed response. Please try again." }, { status: 500 }) }
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    await supabase
      .from("profiles")
      .update({ generations_used: (profile?.generations_used || 0) + 1 })
      .eq("id", user.id)

    const { data: asset } = await supabase
      .from("assets")
      .insert({
        user_id: user.id,
        name: parsed.title || niche,
        type: "blueprint",
        content: {
          ...parsed,
          source: "mie",
          niche,
          marketData: {
            // Save key market data but not the full HTML/raw data
            demandScore: marketData.demandScore,
            competitionLevel: marketData.competitionLevel,
            avgPrice: marketData.avgPrice,
            productsFound: marketData.dataQuality?.productsFound,
            dataConfidence: marketData.dataQuality?.confidence,
            scrapedAt: marketData.scrapedAt,
          },
        },
      })
      .select("id")
      .single()

    await supabase.from("mie_generations").insert({
      user_id: user.id,
      niche_query: niche,
      market_data: {
        demandScore: marketData.demandScore,
        competitionLevel: marketData.competitionLevel,
        avgPrice: marketData.avgPrice,
        realPriceAnalytics: marketData.realPriceAnalytics,
        dataQuality: marketData.dataQuality,
        productsCount: (marketData.products || []).length,
      },
      blueprint: parsed,
    })

    return NextResponse.json({ blueprint: parsed, assetId: asset?.id })
  } catch (error: any) {
    console.error("[MIE Generate] Error:", error)
    return NextResponse.json(
      { error: error.message || "Generation failed. Please try again." },
      { status: 500 }
    )
  }
}