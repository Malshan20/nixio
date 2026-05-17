// app/api/market-intelligence/route.ts
// Real Whop marketplace intelligence — 4 scraping strategies + AI analysis
// Install: npm install cheerio

import { createClient } from "@/lib/supabase/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function parsePrice(raw: string): number | null {
  const m = raw?.match(/[\d,]+(?:\.\d+)?/)
  if (!m) return null
  return parseFloat(m[0].replace(/,/g, ""))
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
}

const JSON_HEADERS = {
  ...BROWSER_HEADERS,
  "Accept": "application/json, text/plain, */*",
  "X-Requested-With": "XMLHttpRequest",
  "Referer": "https://whop.com/",
}

async function fetchWithTimeout(url: string, ms = 8000, headers = BROWSER_HEADERS): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    const res = await fetch(url, { headers, signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const ct = res.headers.get("content-type") || ""
    // Return raw text for both HTML and JSON
    return await res.text()
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT TYPE
// ─────────────────────────────────────────────────────────────────────────────

interface WhopProduct {
  name: string
  slug: string
  price: string
  priceNum: number | null
  rating: number | null
  reviewCount: number | null
  memberCount: number | null
  description: string
  category: string
  url: string
  imageUrl: string
  source: string
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 1: Whop internal API endpoints (their frontend uses these)
// ─────────────────────────────────────────────────────────────────────────────

async function tryWhopAPI(query: string): Promise<WhopProduct[]> {
  const endpoints = [
    `https://whop.com/api/search?q=${encodeURIComponent(query)}&limit=24`,
    `https://whop.com/api/v2/companies?search=${encodeURIComponent(query)}&per_page=24`,
    `https://whop.com/api/v5/experiences?search=${encodeURIComponent(query)}&limit=24`,
    `https://api.whop.com/api/v5/products?search=${encodeURIComponent(query)}&limit=24`,
  ]

  for (const url of endpoints) {
    const raw = await fetchWithTimeout(url, 6000, JSON_HEADERS)
    if (!raw) continue

    try {
      const json = JSON.parse(raw)
      const items: any[] =
        json?.data ||
        json?.results ||
        json?.products ||
        json?.companies ||
        json?.experiences ||
        json?.items ||
        (Array.isArray(json) ? json : [])

      if (!items.length) continue

      const products: WhopProduct[] = items.slice(0, 20).map((item: any, i: number) => {
        const priceRaw =
          item.price_formatted ||
          item.price ||
          item.minimum_price_formatted ||
          item.plans?.[0]?.price_formatted ||
          item.billing_period_price ||
          "Varies"

        return {
          name: item.name || item.title || item.company?.name || `Product ${i + 1}`,
          slug: item.slug || item.company?.slug || "",
          price: String(priceRaw),
          priceNum: parsePrice(String(priceRaw)),
          rating: item.rating || item.review_rating || item.score || null,
          reviewCount: item.review_count || item.reviews_count || null,
          memberCount: item.member_count || item.members_count || item.members || null,
          description: item.description || item.tagline || item.headline || "",
          category: item.category || item.niche || query,
          url: item.slug
            ? `https://whop.com/${item.slug}/`
            : item.url || item.company?.url || "",
          imageUrl: item.logo_url || item.image_url || item.cover_image || "",
          source: "whop-api",
        }
      })

      if (products.length > 0) return products
    } catch {
      continue
    }
  }

  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 2: Whop Hub / Marketplace HTML pages + cheerio
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string[]> = {
  trading:        ["trading", "stocks-options", "forex"],
  crypto:         ["crypto", "web3", "nft"],
  fitness:        ["fitness", "health-wellness", "nutrition"],
  business:       ["business", "entrepreneurship", "side-hustles"],
  ai:             ["ai-tools", "ai", "automation"],
  marketing:      ["marketing", "social-media", "content-creation"],
  coding:         ["coding", "software-development", "web-development"],
  investing:      ["investing", "real-estate", "wealth-building"],
  dropshipping:   ["dropshipping", "ecommerce", "amazon-fba"],
  "social media": ["social-media", "instagram", "tiktok"],
  "real estate":  ["real-estate", "investing"],
  productivity:   ["productivity", "notion", "tools"],
  gaming:         ["gaming", "esports"],
  education:      ["education", "online-courses"],
  freelance:      ["freelancing", "copywriting", "design"],
  design:         ["design", "graphic-design", "ui-ux"],
  music:          ["music", "music-production"],
  sports:         ["sports", "sports-betting"],
  mindset:        ["mindset", "personal-development"],
}

function resolveCategories(niche: string): string[] {
  const lower = niche.toLowerCase()
  for (const [key, slugs] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return slugs
  }
  return [slugify(niche), niche.toLowerCase().replace(/\s+/g, "-")]
}

async function tryWhopHub(niche: string): Promise<WhopProduct[]> {
  const cats = resolveCategories(niche)
  const products: WhopProduct[] = []
  const seen = new Set<string>()

  for (const cat of cats.slice(0, 3)) {
    const urls = [
      `https://whop.com/hub/${cat}/`,
      `https://whop.com/marketplace/?category=${cat}`,
      `https://whop.com/discover/?category=${cat}`,
    ]

    for (const url of urls) {
      const html = await fetchWithTimeout(url, 9000)
      if (!html || html.length < 8000) continue

      const $ = cheerio.load(html)

      // A: JSON-LD structured data (most reliable when present)
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const d = JSON.parse($(el).html() || "")
          const entries =
            d["@type"] === "ItemList"
              ? d.itemListElement || []
              : d["@type"] === "Product"
              ? [d]
              : []

          for (const e of entries) {
            const item = e.item || e
            const name = item.name
            if (!name || seen.has(name.toLowerCase())) continue
            seen.add(name.toLowerCase())
            const price = item.offers?.price || item.offers?.lowPrice || null
            products.push({
              name,
              slug: "",
              price: price ? `$${price}` : "Varies",
              priceNum: price ? parseFloat(String(price)) : null,
              rating: item.aggregateRating?.ratingValue || null,
              reviewCount: item.aggregateRating?.reviewCount || null,
              memberCount: null,
              description: item.description || "",
              category: cat,
              url: item.url || e.url || url,
              imageUrl: item.image || "",
              source: "whop-jsonld",
            })
          }
        } catch {}
      })

      // B: __NEXT_DATA__ script (Next.js page props)
      const nextScript = $("#__NEXT_DATA__").html()
      if (nextScript) {
        try {
          const nextData = JSON.parse(nextScript)

          // Recursively find product-like objects
          const findProductsInObj = (obj: any, depth = 0) => {
            if (depth > 8 || !obj || typeof obj !== "object") return
            if (Array.isArray(obj)) {
              obj.forEach(item => findProductsInObj(item, depth + 1))
              return
            }
            // Looks like a product
            if (
              obj.name &&
              obj.name.length > 2 &&
              obj.name.length < 100 &&
              (obj.slug || obj.price !== undefined || obj.plans || obj.member_count !== undefined)
            ) {
              const key = obj.name.toLowerCase().trim()
              if (!seen.has(key)) {
                seen.add(key)
                const priceRaw = obj.price_formatted || obj.price || obj.plans?.[0]?.price_formatted || "Varies"
                products.push({
                  name: obj.name,
                  slug: obj.slug || "",
                  price: String(priceRaw),
                  priceNum: parsePrice(String(priceRaw)),
                  rating: obj.rating || obj.review_rating || null,
                  reviewCount: obj.review_count || null,
                  memberCount: obj.member_count || obj.members || null,
                  description: obj.description || obj.tagline || "",
                  category: cat,
                  url: obj.slug ? `https://whop.com/${obj.slug}/` : url,
                  imageUrl: obj.logo_url || obj.image_url || "",
                  source: "whop-nextdata",
                })
              }
            }
            Object.values(obj).forEach(v => findProductsInObj(v, depth + 1))
          }

          findProductsInObj(nextData?.props?.pageProps || {})
        } catch {}
      }

      // C: Cheerio selectors for product cards
      const cardSelectors = [
        "[data-testid='product-card']",
        "[data-testid='company-card']",
        ".product-card",
        "[class*='ProductCard']",
        "[class*='CompanyCard']",
        "[class*='product-card']",
        "article[class*='card']",
        "[class*='MarketplaceCard']",
        "[class*='marketplace-card']",
        "a[href^='/'][class*='card']",
        "[class*='ListingCard']",
      ]

      for (const sel of cardSelectors) {
        $(sel).each((_, el) => {
          const nameEl = $(el).find("h1, h2, h3, h4, [class*='title'], [class*='name'], [class*='heading']").first()
          const name = nameEl.text().trim() || $(el).attr("aria-label") || ""
          if (!name || name.length < 3 || name.length > 100 || seen.has(name.toLowerCase())) return
          seen.add(name.toLowerCase())

          const priceEl = $(el).find("[class*='price'], [class*='Price'], [class*='cost'], [class*='amount']").first()
          const priceText = priceEl.text().trim() || "Varies"

          const href = $(el).is("a")
            ? $(el).attr("href") || ""
            : $(el).find("a").first().attr("href") || ""

          const desc = $(el)
            .find("p, [class*='desc'], [class*='subtitle'], [class*='tagline']")
            .first()
            .text()
            .trim()

          const ratingEl = $(el).find("[class*='rating'], [class*='Rating'], [class*='star']").first()
          const ratingText = ratingEl.text().trim()
          const rating = ratingText ? parseFloat(ratingText) || null : null

          products.push({
            name,
            slug: href.replace(/^\/|\/$/g, ""),
            price: priceText,
            priceNum: parsePrice(priceText),
            rating,
            reviewCount: null,
            memberCount: null,
            description: desc,
            category: cat,
            url: href.startsWith("http") ? href : `https://whop.com${href}`,
            imageUrl: $(el).find("img").first().attr("src") || "",
            source: "whop-cheerio",
          })
        })
      }

      // D: RSC payload parsing — Whop embeds JSON in script chunks
      // Pattern: look for JSON objects with name+slug fields in the RSC stream
      const rscMatches = [...html.matchAll(/\{"(?:name|title)":"([^"]{3,80})","(?:slug|id)":"([^"]{2,60})"/g)]
      for (const m of rscMatches.slice(0, 30)) {
        const name = m[1]
        const slug = m[2]
        if (!name || seen.has(name.toLowerCase()) || name.includes("\\")) continue
        seen.add(name.toLowerCase())

        // Try to find price near this match
        const pos = m.index || 0
        const nearby = html.slice(Math.max(0, pos - 200), pos + 500)
        const priceInNearby = nearby.match(/\$[\d]+(?:\.\d{2})?/)
        const priceText = priceInNearby?.[0] || "Varies"

        products.push({
          name,
          slug,
          price: priceText,
          priceNum: parsePrice(priceText),
          rating: null,
          reviewCount: null,
          memberCount: null,
          description: "",
          category: cat,
          url: `https://whop.com/${slug}/`,
          imageUrl: "",
          source: "whop-rsc",
        })
      }

      if (products.length >= 10) break
    }
    if (products.length >= 10) break
  }

  return products
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 3: Enrich individual product pages for price + review data
// ─────────────────────────────────────────────────────────────────────────────

async function enrichProduct(p: WhopProduct): Promise<WhopProduct> {
  if (!p.url || p.url === "https://whop.com//" || p.url === "https://whop.com/") return p
  if (p.priceNum !== null && p.rating !== null && p.memberCount !== null) return p

  const html = await fetchWithTimeout(p.url, 5000)
  if (!html) return p

  const $ = cheerio.load(html)

  // JSON-LD Product schema
  let ldPrice: string | null = null
  let ldRating: number | null = null
  let ldReviews: number | null = null
  let ldName: string | null = null
  let ldDesc: string | null = null

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const d = JSON.parse($(el).html() || "")
      if (d["@type"] === "Product") {
        ldName = d.name
        ldDesc = d.description
        ldPrice = d.offers?.price || d.offers?.lowPrice || null
        ldRating = d.aggregateRating?.ratingValue || null
        ldReviews = d.aggregateRating?.reviewCount || null
      }
    } catch {}
  })

  // Meta price
  const metaPrice =
    $('meta[property="product:price:amount"]').attr("content") ||
    $('meta[name="twitter:data1"]').attr("content") || ""

  // Text mining for member/review counts
  const bodyText = $("body").text()
  const memberM = bodyText.match(/([\d,]+)\s+(?:members?|users?|students?|subscribers?)/i)
  const reviewM = bodyText.match(/([\d,]+)\s+(?:reviews?|ratings?)/i)

  return {
    ...p,
    name: ldName || p.name,
    description: ldDesc || $('meta[property="og:description"]').attr("content") || p.description,
    price: metaPrice ? `$${metaPrice}` : ldPrice ? `$${ldPrice}` : p.price,
    priceNum: parsePrice(metaPrice) || (ldPrice ? parseFloat(ldPrice) : null) || p.priceNum,
    rating: ldRating || p.rating,
    reviewCount: reviewM ? parseInt(reviewM[1].replace(/,/g, "")) : ldReviews || p.reviewCount,
    memberCount: memberM ? parseInt(memberM[1].replace(/,/g, "")) : p.memberCount,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

function computePriceAnalytics(products: WhopProduct[]) {
  const prices = products.map(p => p.priceNum).filter((p): p is number => p !== null && p > 0)
  if (prices.length === 0) return { avg: null, min: null, max: null, median: null, distribution: [], count: 0 }

  const sorted = [...prices].sort((a, b) => a - b)
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  const median = sorted[Math.floor(sorted.length / 2)]

  const buckets = [
    { label: "Under $20",   min: 0,   max: 20 },
    { label: "$20–$50",     min: 20,  max: 50 },
    { label: "$50–$100",    min: 50,  max: 100 },
    { label: "$100–$200",   min: 100, max: 200 },
    { label: "$200–$500",   min: 200, max: 500 },
    { label: "$500+",       min: 500, max: Infinity },
  ]

  return {
    count: prices.length,
    avg,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median,
    distribution: buckets
      .map(b => ({
        label: b.label,
        count: prices.filter(p => p >= b.min && p < b.max).length,
        pct: Math.round((prices.filter(p => p >= b.min && p < b.max).length / prices.length) * 100),
      }))
      .filter(d => d.count > 0),
  }
}

function extractTopKeywords(products: WhopProduct[]): string[] {
  const stop = new Set([
    "the","a","an","and","or","for","of","to","in","on","with","your","my",
    "our","is","are","be","been","have","has","that","this","you","i","we",
    "they","it","its","how","what","get","make","build","create","start",
    "learn","online","free","best","top","using","from","more","into",
  ])
  const freq: Record<string, number> = {}
  for (const p of products) {
    const words = `${p.name} ${p.description}`.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
    for (const w of words) {
      if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w)
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ANALYSIS — fed entirely with REAL scraped data
// ─────────────────────────────────────────────────────────────────────────────

async function runAIAnalysis(
  niche: string,
  products: WhopProduct[],
  priceAnalytics: ReturnType<typeof computePriceAnalytics>,
  keywords: string[]
): Promise<any> {
  const productList = products
    .slice(0, 15)
    .map((p, i) =>
      `${i + 1}. "${p.name}"` +
      (p.price !== "Varies" ? ` | Price: ${p.price}` : "") +
      (p.rating ? ` | Rating: ${p.rating}` : "") +
      (p.reviewCount ? ` | Reviews: ${p.reviewCount}` : "") +
      (p.memberCount ? ` | Members: ${p.memberCount}` : "") +
      (p.description ? `\n   Description: "${p.description}"` : "") +
      `\n   URL: ${p.url}`
    )
    .join("\n\n")

  const priceContext = priceAnalytics.avg
    ? `REAL price data from ${priceAnalytics.count} scraped products:
- Average price: $${priceAnalytics.avg}
- Median price: $${priceAnalytics.median}
- Price range: $${priceAnalytics.min} — $${priceAnalytics.max}
- Distribution: ${priceAnalytics.distribution.map(d => `${d.label}: ${d.pct}%`).join(" | ")}`
    : `Price data: limited (${products.length} products found, most use dynamic/paywall pricing)`

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are the Nixio Marketplace Intelligence Engine.
You have been given REAL live data scraped from Whop. Analyze it accurately and specifically.
Your analysis must be grounded in the actual data provided — not generic assumptions.
Return ONLY valid JSON. No markdown. No code fences. First character must be {`,
    prompt: `Analyze the "${niche}" niche using this REAL Whop marketplace data:

=== ${products.length} REAL PRODUCTS SCRAPED FROM WHOP ===
${productList || "No products found via scraping. Use your market knowledge but be honest about data limitations."}

=== ${priceContext} ===

=== TOP KEYWORDS FROM REAL PRODUCT NAMES/DESCRIPTIONS ===
${keywords.length > 0 ? keywords.join(", ") : "No keyword data available"}

INSTRUCTIONS:
- Base ALL scores on what the real data actually shows
- If we found many products: competition is high, market is proven
- If we found few: either niche is new/emerging or Whop has limited presence
- Price recommendations must reference the ACTUAL price data above
- Gaps must be based on what's MISSING from the real product list above
- Be honest: if a niche is saturated, say so
- The "products" array in your response must use the EXACT names and URLs from the scraped data

Return this exact JSON:
{
  "niche": "${niche}",
  "demandScore": <1-100 based on product count and review activity>,
  "competitionLevel": "<Low|Medium|High|Very High>",
  "competitionScore": <1-100>,
  "revenuePotential": "<Low|Medium|High|Very High>",
  "revenuePotentialScore": <1-100>,
  "marketMaturity": "<Emerging|Growing|Mature|Saturated>",
  "totalActiveProducts": <use ${products.length} as the base + estimate total Whop market size>,
  "avgPrice": "<use real data: $${priceAnalytics.avg || "?"}>",
  "priceRange": {
    "min": "<$${priceAnalytics.min || "?"}>",
    "max": "<$${priceAnalytics.max || "?"}>"
  },
  "topCategories": ["<real sub-category from the products above>", "<sub-category>", "<sub-category>", "<sub-category>"],
  "trending": <true|false>,
  "trendDirection": "<up|down|stable>",
  "trendPercentage": <estimated YoY growth %>,
  "buyerPersona": "<3 specific sentences. Who buys these products? Base on product descriptions found.>",
  "painPoints": [
    "<specific pain point visible in the product descriptions above>",
    "<pain point 2>",
    "<pain point 3>",
    "<pain point 4>"
  ],
  "winningFormats": [
    { "format": "<format most common in scraped products>", "share": <integer>, "avgRevenue": "<estimate>" },
    { "format": "<format>", "share": <integer>, "avgRevenue": "<estimate>" },
    { "format": "<format>", "share": <integer>, "avgRevenue": "<estimate>" },
    { "format": "<format>", "share": <integer>, "avgRevenue": "<estimate>" }
  ],
  "gaps": [
    {
      "title": "<specific gap — what's MISSING from the product list above>",
      "description": "<2 sentences on why this gap exists and how to exploit it>",
      "opportunityScore": <1-100>
    },
    { "title": "<gap 2>", "description": "<2 sentences>", "opportunityScore": <integer> },
    { "title": "<gap 3>", "description": "<2 sentences>", "opportunityScore": <integer> }
  ],
  "topKeywords": ${JSON.stringify(keywords.slice(0, 10))},
  "aiVerdict": "<4-5 sentences. Reference actual products found. Name real competition. Be direct about market entry difficulty. Give specific price and format recommendation.>",
  "winningAngle": "<1 specific, bold, data-backed sentence about the single best opportunity based on the real product list>",
  "estimatedTimeToFirstSale": "<realistic timeframe based on market competition>",
  "recommendedEntryPrice": "<specific price with reasoning from real price data>",
  "pricingInsight": "<2 sentences on pricing strategy based on the real distribution data>",
  "competitorWeaknesses": [
    "<weakness visible from the scraped product names/descriptions>",
    "<weakness 2>",
    "<weakness 3>"
  ],
  "products": [
    ${products.slice(0, 12).map((p, i) => JSON.stringify({
      rank: i + 1,
      name: p.name,
      creator: "",
      category: p.category,
      price: p.price,
      rating: p.rating,
      members: p.memberCount,
      reviewCount: p.reviewCount,
      description: p.description,
      url: p.url,
      imageUrl: p.imageUrl,
      whyItWins: "",
      source: p.source,
    })).join(",\n    ")}
  ]
}

For each product in the array:
- Keep name, price, rating, url EXACTLY as scraped
- Fill in "creator" based on your knowledge of these products/companies
- Fill in "whyItWins" as a genuine 1-sentence competitive advantage`,
    maxTokens: 4000,
    temperature: 0.2,
  })

  const clean = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
  const fb = clean.indexOf("{")
  const lb = clean.lastIndexOf("}")
  if (fb === -1 || lb === -1) throw new Error("AI returned invalid JSON structure")
  return JSON.parse(clean.slice(fb, lb + 1))
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ROUTE
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { niche, forceRefresh } = await request.json()
    if (!niche || typeof niche !== "string" || niche.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a niche to analyze." }, { status: 400 })
    }

    const cleanNiche = niche.trim()
    const slug = slugify(cleanNiche)

    // ── Cache check ───────────────────────────────────────────────────────────
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("market_intelligence_cache")
        .select("data, expires_at")
        .eq("niche_slug", slug)
        .single()

      if (cached && new Date(cached.expires_at) > new Date()) {
        return NextResponse.json({ ...cached.data, cached: true })
      }
    }

    // ── Step 1: Run scraping strategies in parallel ───────────────────────────
    const [apiResult, hubResult] = await Promise.allSettled([
      tryWhopAPI(cleanNiche),
      tryWhopHub(cleanNiche),
    ])

    const allProducts: WhopProduct[] = []
    const seen = new Set<string>()

    const addUnique = (prods: WhopProduct[]) => {
      for (const p of prods) {
        const key = p.name.toLowerCase().trim()
        if (!seen.has(key) && p.name.length > 2 && p.name.length < 120) {
          seen.add(key)
          allProducts.push(p)
        }
      }
    }

    if (apiResult.status === "fulfilled") addUnique(apiResult.value)
    if (hubResult.status === "fulfilled") addUnique(hubResult.value)

    // ── Step 2: Enrich products missing price/rating (up to 6) ───────────────
    const toEnrich = allProducts
      .filter(p => (p.priceNum === null || p.rating === null) && p.url && p.url.length > 20)
      .slice(0, 6)

    const enriched = await Promise.allSettled(toEnrich.map(p => enrichProduct(p)))

    for (let i = 0; i < toEnrich.length; i++) {
      const r = enriched[i]
      if (r.status === "fulfilled") {
        const idx = allProducts.findIndex(p => p.name === toEnrich[i].name)
        if (idx !== -1) allProducts[idx] = r.value
      }
    }

    // ── Step 3: Compute real analytics ───────────────────────────────────────
    const priceAnalytics = computePriceAnalytics(allProducts)
    const topKeywords = extractTopKeywords(allProducts)

    // ── Step 4: AI analysis using REAL data ───────────────────────────────────
    const analysis = await runAIAnalysis(cleanNiche, allProducts, priceAnalytics, topKeywords)

    // ── Step 5: Build final result ────────────────────────────────────────────
    const result = {
      ...analysis,
      realPriceAnalytics: priceAnalytics,
      realKeywords: topKeywords,
      dataQuality: {
        productsFound: allProducts.length,
        withRealPrice: allProducts.filter(p => p.priceNum !== null).length,
        withRealRating: allProducts.filter(p => p.rating !== null).length,
        withDescription: allProducts.filter(p => p.description.length > 10).length,
        sources: [...new Set(allProducts.map(p => p.source))],
        confidence: allProducts.length >= 8 ? "high" : allProducts.length >= 3 ? "medium" : "low",
        isRealData: allProducts.length > 0,
      },
      scrapedAt: new Date().toISOString(),
      cached: false,
    }

    // ── Step 6: Cache for 12 hours ────────────────────────────────────────────
    await supabase
      .from("market_intelligence_cache")
      .upsert(
        {
          niche_query: cleanNiche,
          niche_slug: slug,
          data: result,
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "niche_slug" }
      )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[MIE] Error:", error)
    return NextResponse.json(
      { error: error.message || "Analysis failed. Please try again." },
      { status: 500 }
    )
  }
}