"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Message {
  id: string
  ticket_id: string
  sender_type: "user" | "support"
  sender_name: string
  body: string
  created_at: string
}

interface Props {
  ticketId: string
  ticketNumber: string
  senderName: string
  onBack: () => void
}

export default function TicketChatInner({ ticketId, ticketNumber, senderName, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Load initial messages
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true })
      if (data) setMessages(data as Message[])
    }
    load()
  }, [ticketId, supabase])

  // Subscribe to realtime
  useEffect(() => {
    const channel = supabase
      .channel(`ticket_${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const incoming = payload.new as Message
            // avoid duplicates
            if (prev.some((m) => m.id === incoming.id)) return prev
            return [...prev, incoming]
          })
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED")
      })

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, supabase])

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = input.trim()
    if (!body || sending) return

    setSending(true)
    setInput("")

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, senderName, senderType: "user" }),
      })
      if (!res.ok) {
        const d = await res.json()
        console.error("[v0] Message send error:", d.error)
        setInput(body)
      }
    } catch (err) {
      console.error("[v0] Send failed:", err)
      setInput(body)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    if (isToday) return "Today"
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Group messages by date
  const grouped: { date: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const d = formatDate(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.date === d) {
      last.msgs.push(msg)
    } else {
      grouped.push({ date: d, msgs: [msg] })
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "600px" }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl border border-border border-b-0 bg-card shadow-sm">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-none">Nixio Support</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{ticketNumber}</p>
            </div>
          </div>
        </div>
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-amber-400"}`} />
          <span className="text-[10px] text-muted-foreground">{connected ? "Live" : "Connecting..."}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 border-x border-border bg-muted/30 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 3h18v13H12.5L7 19v-3H2V3Z" stroke="#5b6af9" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Start the conversation</p>
            <p className="text-xs text-muted-foreground max-w-xs">Your message has been submitted. Send additional details or questions below.</p>
          </div>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {msgs.map((msg, i) => {
              const isUser = msg.sender_type === "user"
              const showAvatar = !isUser && (i === 0 || msgs[i - 1]?.sender_type !== "support")

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-1.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar (support only) */}
                  {!isUser && (
                    <div className={`w-6 h-6 rounded-lg shrink-0 mb-0.5 ${showAvatar ? "bg-primary flex items-center justify-center" : "opacity-0"}`}>
                      {showAvatar && <span className="text-white font-bold text-[9px]">N</span>}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                    {showAvatar && !isUser && (
                      <span className="text-[10px] text-muted-foreground font-semibold mb-1 ml-1">Nixio Support</span>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-white border border-border text-foreground rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.body}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-end gap-2 px-3 py-3 rounded-b-2xl border border-border border-t bg-card shadow-sm"
      >
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage(e as unknown as React.FormEvent)
            }
          }}
          placeholder="Type a message... (Enter to send)"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none min-h-[40px] max-h-[120px]"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="p-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          aria-label="Send"
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M2 8.5h13M9.5 3 15 8.5 9.5 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
