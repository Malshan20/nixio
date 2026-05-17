"use client"

import LandingFooter from "@/components/landingfooter"
import LandingNav from "@/components/landingnav"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin)
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TYPEWRITER_PHRASES = [
  "AI fitness coaching blueprint",
  "Digital product for freelancers",
  "Online course for designers",
  "Faceless content system",
  "Beginner investing ebook",
  "Social media playbook",
  "Notion template for teams",
  "Crypto trading community",
]

const features = [
  {
    icon: "✦",
    title: "One Input. Everything Generated.",
    description: "Type your niche or idea. Nixio's AI agent validates it, architects the product, writes the content, and builds the funnel — all at once.",
  },
  {
    icon: "⚡",
    title: "Blazing Fast AI",
    description: "Full blueprint results in under 10 seconds. No waiting. No spinning wheels. Just instant, actionable output.",
  },
  {
    icon: "◈",
    title: "Beautiful PDF Export",
    description: "Every blueprint renders as a professional, branded PDF. View it in-app, download it, send to clients — no extra tools.",
  },
  {
    icon: "⊞",
    title: "Full Product Architecture",
    description: "Structured modules, lessons, and frameworks designed by the AI so you can start selling — not planning.",
  },
  {
    icon: "▲",
    title: "Launch Funnel Built In",
    description: "Headlines, offer framing, pricing suggestions, CTAs, and a 5-email launch sequence — everything to ship tomorrow.",
  },
  {
    icon: "◎",
    title: "Save & Revisit Blueprints",
    description: "Every blueprint is saved to your account. Come back, re-download the PDF, or use it as a starting point for your next product.",
  },
]

const testimonials = [
  {
    name: "Sarah K.",
    role: "Course Creator",
    avatar: "SK",
    text: "I went from idea to selling on Whop in 2 hours. Nixio built everything — the course outline, email sequence, pricing strategy. I just uploaded and shared the link.",
    result: "$1,200 first month",
  },
  {
    name: "Marcus T.",
    role: "Freelance Designer",
    avatar: "MT",
    text: "I've tried Claude, ChatGPT, every AI tool. Nothing comes close to what Nixio outputs. It's not just text — it's a real, structured, sellable product.",
    result: "3 products live",
  },
  {
    name: "Priya N.",
    role: "Solopreneur",
    avatar: "PN",
    text: "The PDF it exports looks like something a design agency built. My clients couldn't believe I made it in 10 seconds. Nixio is the unfair advantage nobody's talking about.",
    result: "5★ client feedback",
  },
  {
    name: "James O.",
    role: "Digital Marketer",
    avatar: "JO",
    text: "The market intelligence feature is insane. It told me exactly what was selling on Whop and built my product around the gap. First sale in 3 days.",
    result: "First sale day 3",
  },
  {
    name: "Aisha R.",
    role: "Fitness Coach",
    avatar: "AR",
    text: "I'm not a writer. I'm not a designer. I have zero tech skills. Nixio gave me a complete fitness program PDF with a sales funnel in literally 8 seconds.",
    result: "$450 week one",
  },
  {
    name: "Daniel M.",
    role: "Crypto Educator",
    avatar: "DM",
    text: "The email sequence it writes is better than what my copywriter charges $800 for. I was genuinely shocked. I canceled three other subscriptions after this.",
    result: "Saved $800/mo",
  },
  {
    name: "Lena C.",
    role: "UX Designer",
    avatar: "LC",
    text: "I built a complete Notion template product in one prompt. The positioning, the pricing strategy, the launch copy — all spot on. Already at $2k MRR.",
    result: "$2k MRR",
  },
  {
    name: "Raj P.",
    role: "Indie Hacker",
    avatar: "RP",
    text: "Shipped in 12 hours, started selling in 48. Nixio is what happens when you build a tool that actually respects the builder's time. Insane product.",
    result: "Shipped in 48hrs",
  },
]

const comparison = [
  { feature: "Market intelligence from live Whop data", nixio: true, generic: false },
  { feature: "One prompt → full product suite", nixio: true, generic: false },
  { feature: "Real pricing strategy from competitor data", nixio: true, generic: false },
  { feature: "5-email launch sequence included", nixio: true, generic: "partial" },
  { feature: "Branded PDF export, ready to sell", nixio: true, generic: false },
  { feature: "Module & lesson architecture", nixio: true, generic: "partial" },
  { feature: "Whop competitor gap analysis", nixio: true, generic: false },
  { feature: "Sales funnel copy included", nixio: true, generic: "partial" },
  { feature: "Saved blueprint history", nixio: true, generic: false },
  { feature: "Built for selling, not just reading", nixio: true, generic: false },
]

const steps = [
  { num: "01", title: "Enter your idea", desc: "Type any niche, topic, or product concept. One sentence is enough." },
  { num: "02", title: "AI analyzes the market", desc: "Nixio scans live Whop data, finds gaps, and validates your idea with real numbers." },
  { num: "03", title: "Blueprint generated", desc: "Full product structure, content, pricing, funnel, and email sequence — in under 10 seconds." },
  { num: "04", title: "Download & sell", desc: "Export your branded PDF and list it on Whop, Gumroad, or anywhere. Keep 100% of revenue." },
]

const STARTER_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID || ""
const PRO_PRODUCT_ID     = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID     || ""

const pricingPlans = [
  {
    name: "Starter",
    price: "19.99",
    period: "/month",
    trial: "3-day free trial",
    description: "Perfect for creators validating their first digital product ideas.",
    features: [
      "10 blueprint generations / month",
      "Full product architecture",
      "Content outlines & lesson scripts",
      "Launch funnel builder",
      "PDF export & in-app viewer",
      "Blueprint history",
      "Email support",
    ],
    cta: "Start 3-day free trial",
    highlight: false,
    productId: STARTER_PRODUCT_ID,
  },
  {
    name: "Pro",
    price: "49.99",
    period: "/month",
    trial: "3-day free trial",
    description: "For solopreneurs who ship consistently and need unlimited power.",
    features: [
      "Unlimited blueprint generations",
      "Everything in Starter",
      "Priority AI processing",
      "Branded PDF downloads",
      "Market Intelligence Engine",
      "Early access to new features",
      "Prioritized support",
    ],
    cta: "Start 3-day free trial",
    highlight: true,
    productId: PRO_PRODUCT_ID,
  },
]

const faqs = [
  { q: "How does Nixio work?", a: "You type a single topic, niche, or idea. Nixio's AI agent runs through five intelligent steps — market validation, product architecture, content generation, funnel building, and PDF creation — and delivers the full blueprint in one shot." },
  { q: "What is a Blueprint?", a: "A Blueprint is the complete output Nixio generates from your single input. It includes idea validation scores, a full product structure with modules and lessons, sample lesson content, a launch funnel with email sequences, and a professional PDF you can download immediately." },
  { q: "What makes Nixio different from just using ChatGPT?", a: "Nixio pulls live data from the Whop marketplace before generating anything. It knows what's already selling, at what price, and what gaps exist — then builds your product to fill those gaps. A plain ChatGPT prompt can't do that. The output is also structured specifically for selling, with PDF export, pricing strategy, and launch copy included." },
  { q: "Can I really export a PDF?", a: "Yes — every Blueprint renders as a beautifully designed PDF document right inside the app. Click the PDF tab to view it inline, then download with one click. No third-party tools, no formatting headaches." },
  { q: "What does the 3-day free trial include?", a: "The trial gives you full access to your chosen plan — all features, no restrictions — for 3 days. No charge until the trial ends, and you can cancel before that with zero cost." },
  { q: "Can I cancel anytime?", a: "Absolutely. No long-term contracts, no cancellation fees. Cancel from your settings at any time and you keep access until the end of your billing period." },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTypewriter(phrases: string[], speed = 60, pause = 1800) {
  const [display, setDisplay] = useState("")
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIdx]
    let timeout: NodeJS.Timeout

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed)
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2)
    } else {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
    }

    setDisplay(current.slice(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause])

  return display
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountUp({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * to))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

function InfiniteScroll({ items }: { items: typeof testimonials }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden">
      <motion.div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
      <motion.div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex gap-5 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="w-80 shrink-0 rounded-2xl p-6 border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${i % 2 === 0 ? "bg-primary" : "bg-amber-500"}`}
              >
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
              <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {t.result}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex gap-0.5 mt-4">
              {[...Array(5)].map((_, si) => (
                <span key={si} className={i % 2 === 0 ? "text-primary" : "text-amber-500"}>★</span>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const compRef = useRef<HTMLDivElement>(null)
  const typed = useTypewriter(TYPEWRITER_PHRASES)

  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  // GSAP animations
  useGSAP(() => {
    // Floating orbs in hero
    gsap.to(".orb-1", {
      y: -30, x: 20,
      duration: 6, ease: "sine.inOut",
      repeat: -1, yoyo: true,
    })
    gsap.to(".orb-2", {
      y: 25, x: -15,
      duration: 8, ease: "sine.inOut",
      repeat: -1, yoyo: true,
      delay: 2,
    })
    gsap.to(".orb-3", {
      y: -20, x: 30,
      duration: 7, ease: "sine.inOut",
      repeat: -1, yoyo: true,
      delay: 1,
    })

    // Steps scroll reveal
    if (stepsRef.current) {
      const stepItems = stepsRef.current.querySelectorAll(".step-item")
      stepItems.forEach((el, i) => {
        gsap.fromTo(el,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        )
      })
    }

    // Feature cards stagger
    gsap.fromTo(".feature-card",
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 75%",
        },
      }
    )

    // Comparison rows stagger
    gsap.fromTo(".comp-row",
      { x: -40, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".comp-table",
          start: "top 75%",
        },
      }
    )

    // Hero title words
    gsap.fromTo(".hero-word",
      { y: 80, opacity: 0, rotationX: -40 },
      {
        y: 0, opacity: 1, rotationX: 0,
        duration: 0.7, ease: "back.out(1.4)",
        stagger: 0.08,
        delay: 0.2,
      }
    )

    // Stats counter cards
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.querySelectorAll(".stat-card"),
        { scale: 0.8, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        }
      )
    }
  }, [])

  async function handleCheckout(productId: string) {
    const res = await fetch("/api/polar/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      window.location.href = "/auth/sign-up"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <LandingNav />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6"
      >
        <div className="hero-blob hero-blob-1 orb-1" />
        <div className="hero-blob hero-blob-2 orb-2" />
        <div className="hero-blob hero-blob-3 orb-3" />

        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 bg-primary/10 border border-primary/20 text-primary"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            3-day free trial · No credit card required
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
              NEW: Market Intelligence
            </span>
          </motion.div>

          {/* Title */}
          <div className="overflow-hidden mb-6">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-foreground">
              {"Build your".split(" ").map((w, i) => (
                <span key={i} className="hero-word inline-block mr-[0.25em]">{w}</span>
              ))}
              <br />
              <span className="hero-word inline-block text-gradient">
                digital product
              </span>
              <br />
              {"in minutes.".split(" ").map((w, i) => (
                <span key={i} className="hero-word inline-block mr-[0.25em]">{w}</span>
              ))}
            </h1>
          </div>

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm sm:text-base font-mono bg-muted border border-border">
              <span className="text-primary">→</span>
              <span className="text-foreground min-w-[280px] text-left">
                {typed}
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 text-muted-foreground"
          >
            Nixio validates your idea, builds the full product architecture, writes the content,
            and exports a sell-ready PDF — powered by live market intelligence from Whop.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
          >
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 rounded-xl font-bold text-base text-white bg-primary glow-primary transition-all hover:scale-[1.03] hover:opacity-90 active:scale-[0.98]"
            >
              Start free trial →
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl font-semibold text-base border border-border text-foreground bg-card hover:bg-muted transition-all hover:scale-[1.02]"
            >
              See how it works
            </a>
          </motion.div>
          <p className="text-xs text-muted-foreground">
            3 days free &nbsp;·&nbsp; Then from $19.99/mo &nbsp;·&nbsp; Cancel anytime
          </p>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-border bg-card shadow-lg"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <span className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 mx-3 h-6 rounded-md flex items-center px-3 bg-background border border-border">
                <span className="text-[11px] text-muted-foreground">nixiolabs.com/dashboard</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-5 sm:p-7">
              <div className="flex gap-3 mb-5">
                <div className="flex-1 h-11 rounded-xl flex items-center px-4 bg-input border border-border">
                  <span className="text-sm text-muted-foreground">
                    &ldquo;beginner investing ebook for millennials&rdquo;
                  </span>
                </div>
                <button className="px-5 h-11 rounded-xl text-sm font-bold text-white shrink-0 bg-primary hover:opacity-90">
                  Analyze & Build
                </button>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-5">
                {["Market Intel", "Blueprint", "Content", "Funnel", "PDF"].map((tab, i) => (
                  <div
                    key={tab}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      i === 4
                        ? "bg-primary text-white border-transparent"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              {/* Preview cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Demand Score", val: "87/100", colorClass: "text-primary" },
                  { label: "Avg Competitor Price", val: "$47/mo", colorClass: "text-amber-600" },
                  { label: "Market Gap Found", val: "3 gaps", colorClass: "text-green-600" },
                ].map((card) => (
                  <div key={card.label} className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-[10px] mb-1 text-muted-foreground">{card.label}</p>
                    <p className={`text-lg font-bold ${card.colorClass}`}>{card.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 px-4 sm:px-6 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: 10, suffix: "s", label: "Seconds to generate", colorClass: "text-primary" },
            { val: 6, suffix: " outputs", label: "Per single prompt", colorClass: "text-amber-600" },
            { val: 97, suffix: "%", label: "Revenue you keep on Whop", colorClass: "text-green-600" },
            { val: 0, suffix: " code", label: "Required to start selling", colorClass: "text-primary" },
          ].map((s, i) => (
            <div key={i} className="stat-card text-center p-5 rounded-2xl bg-card border border-border shadow-sm">
              <p className={`text-4xl sm:text-5xl font-black mb-1 ${s.colorClass}`}>
                <CountUp to={s.val} suffix={s.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" ref={stepsRef} className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-primary"
            >
              How it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-black text-foreground"
            >
              From idea to selling
              <br />
              <span className="text-primary">in four steps.</span>
            </motion.h2>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-8 md:left-1/2 top-8 bottom-8 w-px hidden sm:block bg-gradient-to-b from-primary/40 to-transparent" />

            <div className="space-y-10">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`step-item relative flex items-start gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Number */}
                  <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl relative z-10 bg-primary text-white shadow-md">
                    {step.num}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-2 md:max-w-sm">
                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                  {/* Spacer for opposite side */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-primary"
            >
              Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-black text-foreground"
            >
              One input.
              <br />
              <span className="text-amber-600">Your entire product, built.</span>
            </motion.h2>
          </div>

          <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card group p-6 rounded-2xl cursor-default border border-border bg-card shadow-sm"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 ${
                    i % 2 === 0 ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
                <div
                  className={`mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full ${
                    i % 2 === 0 ? "bg-primary" : "bg-amber-500"
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-24 overflow-hidden bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-primary"
            >
              Real results
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-black text-foreground mb-4"
            >
              Builders shipping with Nixio
            </motion.h2>
            <p className="text-sm text-muted-foreground">
              Real people. Real products. Real revenue.
            </p>
          </div>
        </div>
        <InfiniteScroll items={testimonials} />
      </section>

      {/* ── COMPARISON ───────────────────────────────────────────────────────── */}
      <section ref={compRef} className="py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-primary"
            >
              Why Nixio
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-black text-foreground mb-4"
            >
              Not a prompt wrapper.
              <br />
              <span className="text-amber-600">A real product engine.</span>
            </motion.h2>
            <p className="text-sm max-w-lg mx-auto text-muted-foreground">
              Generic AI gives you text. Nixio gives you a sellable product backed by live market intelligence.
            </p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px] gap-3 mb-3 px-4">
            <div />
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary">
                NIXIO
              </div>
            </div>
            <div className="text-center">
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground border border-border">
                Generic AI
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="comp-table space-y-2">
            {comparison.map((row, i) => (
              <motion.div
                key={i}
                className={`comp-row grid grid-cols-[1fr_100px_100px] gap-3 items-center px-4 py-3 rounded-xl border border-border ${
                  i % 2 === 0 ? "bg-card" : "bg-muted/40"
                }`}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <span className="text-sm font-medium text-foreground">{row.feature}</span>
                <div className="flex justify-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">
                    ✓
                  </div>
                </div>
                <div className="flex justify-center">
                  {row.generic === true ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">✓</div>
                  ) : row.generic === "partial" ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-amber-100 text-amber-600">~</div>
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-red-100 text-red-600">✕</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white bg-primary glow-primary transition-all hover:scale-[1.03] hover:opacity-90"
            >
              Try Nixio free for 3 days →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PDF CALLOUT ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 border border-border bg-gradient-to-br from-primary/5 via-background to-amber-50 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none hero-blob-2 opacity-60" />

            <div className="flex-1 relative z-10 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5 bg-primary/10 text-primary">
                PDF-first design
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                Not just content.
                <br />
                <span className="text-amber-600">A deliverable PDF.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-7 max-w-md text-muted-foreground">
                Every blueprint includes a print-ready PDF — branded cover, idea scores, product outline, content scripts, and your full launch funnel. View it in-app or download instantly.
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-primary transition-all hover:scale-[1.03] hover:opacity-90"
              >
                Generate your first blueprint
                <span>→</span>
              </Link>
            </div>

            {/* PDF preview */}
            <motion.div
              whileHover={{ rotate: -2, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-52 shrink-0 rounded-2xl p-5 flex flex-col gap-3 relative z-10 border border-border bg-card shadow-lg"
            >
              <div className="h-2.5 w-20 rounded-full bg-primary/40" />
              <div className="h-24 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/10 to-amber-50">
                <span className="text-4xl text-primary">◈</span>
              </div>
              <div className="space-y-1.5">
                {[1, 0.7, 0.5].map((op, i) => (
                  <div key={i} className="h-2 rounded-full bg-primary/20" style={{ width: `${100 - i * 20}%`, opacity: op }} />
                ))}
              </div>
              <div className="h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white bg-primary">
                Download PDF
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-primary"
            >
              Pricing
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-black text-foreground mb-3"
            >
              Simple, honest pricing
            </motion.h2>
            <p className="text-sm text-muted-foreground">
              3-day free trial on all plans. No credit card required to start.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative flex flex-col rounded-2xl p-7 border bg-card shadow-sm ${
                  plan.highlight ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap bg-primary">
                      Most Popular
                    </span>
                  </div>
                )}

                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-foreground">${plan.price}</span>
                  <span className="mb-2 text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-green-600">{plan.trial}</span>
                </div>
                <p className="text-sm mb-6 leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-primary/10 text-primary">
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => window.location.href = "/auth/sign-up"}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    plan.highlight
                      ? "bg-primary text-white hover:opacity-90"
                      : "border border-border text-foreground bg-background hover:bg-muted"
                  }`}
             
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 items-start">
            <div className="md:col-span-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-primary">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                Questions &<br />answers
              </h2>
              <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
                Everything you need to know about Nixio. Can&apos;t find what you&apos;re looking for?
              </p>
              <a href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15">
                Chat with us →
              </a>
            </div>

            <div className="md:col-span-3 space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  className={`rounded-2xl overflow-hidden border bg-card ${
                    openFaq === i ? "border-primary/40" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center border border-primary/30 text-primary"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground border-t border-border">
                          <div className="pt-4">{faq.a}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl px-10 py-20 text-center border border-border bg-gradient-to-br from-primary/10 via-background to-amber-50 shadow-sm"
          >
            <div className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-5"
              >
                Ready to build faster?
              </motion.h2>
              <p className="text-base sm:text-lg max-w-xl mx-auto mb-10 text-muted-foreground">
                Join solopreneurs launching digital products in days, not months.
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-base text-white bg-primary glow-primary transition-all hover:scale-[1.04] hover:opacity-90 active:scale-[0.98]"
              >
                Start your 3-day free trial →
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">
                No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}