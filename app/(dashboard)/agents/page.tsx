"use client"

import { useState, useRef, useEffect } from "react"

type AgentMode = "strategist" | "copywriter" | "coach"

interface Message {
  role: "user" | "assistant"
  content: string
}

const AGENTS: { id: AgentMode; name: string; description: string; color: string }[] = [
  {
    id: "strategist",
    name: "Strategist",
    description: "Business planning, positioning, revenue models",
    color: "text-primary border-primary/30 bg-primary/10",
  },
  {
    id: "copywriter",
    name: "Copywriter",
    description: "Sales copy, emails, landing pages, hooks",
    color: "text-accent border-accent/30 bg-accent/10",
  },
  {
    id: "coach",
    name: "Coach",
    description: "Mindset, accountability, overcoming blocks",
    color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  },
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
          <span className="text-primary text-xs font-bold">N</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [mode, setMode] = useState<AgentMode>("strategist")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function clearChat() {
    setMessages([])
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { role: "assistant", content: data.result }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const activeAgent = AGENTS.find(a => a.id === mode)!

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen p-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Agents</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Switch agent modes to get the right kind of AI help</p>
          </div>
          <button onClick={clearChat} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Clear chat
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-2 mt-4 max-w-4xl mx-auto overflow-x-auto pb-1">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setMode(agent.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                mode === agent.id
                  ? agent.color
                  : "border-border text-muted-foreground bg-secondary hover:border-border/80 hover:text-foreground"
              }`}
            >
              <span className="block font-bold">{agent.name}</span>
              <span className="block font-normal opacity-70 mt-0.5 hidden sm:block">{agent.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${activeAgent.color}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 22c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{activeAgent.name} Mode</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">{activeAgent.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {mode === "strategist" && [
                "Help me validate my course idea",
                "What pricing model should I use?",
                "How do I position against competitors?",
              ].map(s => (
                <button key={s} onClick={() => setInput(s)} className="px-4 py-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-left">
                  {s}
                </button>
              ))}
              {mode === "copywriter" && [
                "Write a headline for my productivity course",
                "Give me 5 subject lines for a launch email",
                "Write a VSL script intro",
              ].map(s => (
                <button key={s} onClick={() => setInput(s)} className="px-4 py-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors text-left">
                  {s}
                </button>
              ))}
              {mode === "coach" && [
                "I keep procrastinating on launching",
                "How do I deal with imposter syndrome?",
                "I need accountability — what should I do today?",
              ].map(s => (
                <button key={s} onClick={() => setInput(s)} className="px-4 py-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-yellow-400/30 transition-colors text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
              <span className="text-primary text-xs font-bold">N</span>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-border bg-card">
        <form onSubmit={sendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
            placeholder={`Ask the ${activeAgent.name}...`}
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l3 6-3 6 12-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground mt-2">Shift+Enter for new line • Powered by Groq</p>
      </div>
    </div>
  )
}
