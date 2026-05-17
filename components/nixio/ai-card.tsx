"use client"

import { useState, useRef } from "react"

interface AiCardProps {
  title: string
  description: string
  placeholder: string
  fields?: { label: string; key: string; placeholder: string; multiline?: boolean }[]
  onSubmit: (values: Record<string, string>) => Promise<void>
  result?: React.ReactNode
  loading?: boolean
}

export function AiCard({ title, description, placeholder, fields, onSubmit, result, loading }: AiCardProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [simpleInput, setSimpleInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (fields && fields.length > 0) {
      await onSubmit(values)
    } else {
      await onSubmit({ input: simpleInput })
    }
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {fields && fields.length > 0 ? (
          fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
              {field.multiline ? (
                <textarea
                  value={values[field.key] ?? ""}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] ?? ""}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              )}
            </div>
          ))
        ) : (
          <textarea
            value={simpleInput}
            onChange={e => setSimpleInput(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 3.5L12 6 8.5 7.5 7 11 5.5 7.5 2 6l3.5-1.5L7 1Z" fill="currentColor"/>
              </svg>
              Generate
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="rounded-lg bg-secondary border border-border p-4">
            {result}
          </div>
        </div>
      )}
    </div>
  )
}
