"use client"

import { useState } from "react"
import Link from "next/link"
import LandingNav from "@/components/landingnav"
import LandingFooter from "@/components/landingfooter"

type View = "form" | "success" | "tracker" | "chat"

interface Ticket {
  id: string
  ticket_number: string
  name: string
  email: string
  subject: string
  category: string
  status: string
  created_at: string
}

export default function ContactPage() {
  const [view, setView] = useState<View>("form")
  const [createdTicket, setCreatedTicket] = useState<{ ticketNumber: string; ticketId: string } | null>(null)
  const [trackedTicket, setTrackedTicket] = useState<Ticket | null>(null)

  return (
      <div className="min-h-screen bg-background">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/></svg>
            Support Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3 text-balance">How can we help?</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Submit a support ticket and we&apos;ll get back to you. Track your ticket or continue the conversation below.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit mx-auto mb-10">
          {[
            { id: "form", label: "New Ticket" },
            { id: "tracker", label: "Track Ticket" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as View)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === tab.id || (tab.id === "form" && view === "success")
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Views */}
        {(view === "form" || view === "success") && (
          <ContactForm
            onSuccess={(ticketNumber, ticketId) => {
              setCreatedTicket({ ticketNumber, ticketId })
              setView("success")
            }}
            successData={createdTicket}
            view={view}
            onOpenChat={() => {
              if (createdTicket) {
                setView("chat")
              }
            }}
          />
        )}

        {view === "tracker" && (
          <TicketTracker
            onOpenChat={(ticket) => {
              setTrackedTicket(ticket)
              setView("chat")
            }}
          />
        )}

        {view === "chat" && (createdTicket || trackedTicket) && (
          <TicketChat
            ticketId={createdTicket?.ticketId || trackedTicket!.id}
            ticketNumber={createdTicket?.ticketNumber || trackedTicket!.ticket_number}
            senderName={trackedTicket?.name || "You"}
            onBack={() => {
              if (createdTicket) setView("success")
              else setView("tracker")
            }}
          />
        )}

        {/* Info cards */}
        {view === "form" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
            {[
              { icon: "⚡", title: "Fast Response", desc: "We typically reply within 2–4 hours on business days." },
              { icon: "🔒", title: "Secure & Private", desc: "Your tickets are private. Only our support team can view them." },
              { icon: "📧", title: "Email Updates", desc: "You&apos;ll receive updates on your ticket via email." },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl mb-2">{card.icon}</div>
                <p className="font-semibold text-foreground text-sm mb-1">{card.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm({
  onSuccess,
  successData,
  view,
  onOpenChat,
}: {
  onSuccess: (ticketNumber: string, ticketId: string) => void
  successData: { ticketNumber: string; ticketId: string } | null
  view: string
  onOpenChat: () => void
}) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "general", message: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      onSuccess(data.ticketNumber, data.ticketId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (view === "success" && successData) {
    return (
      <div className="max-w-lg mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7 13-13" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Ticket Created!</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your support request has been received. Use your ticket number to track updates.
        </p>
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 px-6 py-5 mb-6">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">Ticket Number</p>
          <p className="text-3xl font-black text-primary tracking-wider">{successData.ticketNumber}</p>
          <p className="text-xs text-muted-foreground mt-1">Save this — you&apos;ll need it to track or continue your conversation</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onOpenChat}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Open Chat
          </button>
          <button
            onClick={() => {
              if (typeof navigator !== "undefined") navigator.clipboard?.writeText(successData.ticketNumber)
            }}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Copy Ticket Number
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name <span className="text-destructive">*</span></label>
            <input
              type="text"
              required
              placeholder="Jane Smith"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address <span className="text-destructive">*</span></label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="general">General Inquiry</option>
            <option value="billing">Billing & Payments</option>
            <option value="technical">Technical Issue</option>
            <option value="account">Account & Access</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Subject <span className="text-destructive">*</span></label>
          <input
            type="text"
            required
            placeholder="Briefly describe your issue"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Message <span className="text-destructive">*</span></label>
          <textarea
            required
            rows={5}
            placeholder="Describe your issue in detail..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
        </div>
        {error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round"/>
              </svg>
              Submitting...
            </>
          ) : "Submit Ticket"}
        </button>
      </form>
    </div>
  )
}

// ─── Ticket Tracker ───────────────────────────────────────────────────────────

function TicketTracker({ onOpenChat }: { onOpenChat: (ticket: Ticket) => void }) {
  const [ticketNumber, setTicketNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ticket, setTicket] = useState<Ticket | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data, error: dbError } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("ticket_number", ticketNumber.trim().toUpperCase())
        .eq("email", email.trim().toLowerCase())
        .single()
      if (dbError || !data) throw new Error("Ticket not found. Check your ticket number and email.")
      setTicket(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Not found")
    } finally {
      setLoading(false)
    }
  }

  const statusColor: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-600",
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleTrack} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm mb-6">
        <p className="text-sm text-muted-foreground">Enter your ticket number and email address to check the status of your request.</p>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Ticket Number</label>
          <input
            type="text"
            required
            placeholder="NXO-20240501-0001"
            value={ticketNumber}
            onChange={e => setTicketNumber(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        {error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? "Looking up..." : "Track Ticket"}
        </button>
      </form>

      {ticket && (
        <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-0.5">Ticket</p>
              <p className="text-lg font-black text-primary tracking-wide">{ticket.ticket_number}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColor[ticket.status] || "bg-muted text-muted-foreground"}`}>
              {ticket.status.replace("_", " ")}
            </span>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Subject</span>
              <span className="text-sm font-semibold text-foreground">{ticket.subject}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Category</span>
              <span className="text-sm text-foreground capitalize">{ticket.category.replace("_", " ")}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Submitted</span>
              <span className="text-sm text-foreground">
                {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <button
            onClick={() => onOpenChat(ticket)}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M1.5 2.5h12v8.5H8.5L5 13.5V11H1.5V2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Open Chat
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Ticket Chat ──────────────────────────────────────────────────────────────

function TicketChat({
  ticketId,
  ticketNumber,
  senderName,
  onBack,
}: {
  ticketId: string
  ticketNumber: string
  senderName: string
  onBack: () => void
}) {
  return (
    <TicketChatInner
      ticketId={ticketId}
      ticketNumber={ticketNumber}
      senderName={senderName}
      onBack={onBack}
    />
  )
}

import dynamic from "next/dynamic"

const TicketChatInner = dynamic(() => import("./ticket-chat"), { ssr: false })