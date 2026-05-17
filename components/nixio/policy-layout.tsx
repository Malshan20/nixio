import Link from "next/link"

interface PolicySection {
  heading: string
  body: string | string[]
}

interface PolicyLayoutProps {
  title: string
  subtitle: string
  lastUpdated: string
  badge: string
  badgeColor: string
  sections: PolicySection[]
}

export function PolicyLayout({ title, subtitle, lastUpdated, badge, badgeColor, sections }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: badgeColor + "18", color: badgeColor }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: badgeColor }} />
            {badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground text-balance mb-3">{title}</h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl text-pretty">{subtitle}</p>
          <p className="text-xs text-muted-foreground mt-4">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-14 items-start">

          {/* Sticky TOC — desktop only */}
          <aside className="hidden lg:block sticky top-24">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Contents</p>
            <nav className="space-y-1">
              {sections.map((s, i) => (
                <a
                  key={i}
                  href={`#section-${i}`}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1 pl-2 border-l-2 border-border hover:border-primary"
                >
                  {s.heading}
                </a>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <article className="min-w-0">
            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={i} id={`section-${i}`} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: badgeColor }}
                    >
                      {i + 1}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">{s.heading}</h2>
                  </div>
                  {Array.isArray(s.body) ? (
                    <ul className="space-y-2.5 pl-2">
                      {s.body.map((item, j) => (
                        <li key={j} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: badgeColor }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  )}
                </section>
              ))}
            </div>

            {/* Contact card */}
            <div
              className="mt-12 rounded-2xl border p-6 sm:p-8"
              style={{ background: badgeColor + "0a", borderColor: badgeColor + "30" }}
            >
              <h3 className="text-base font-bold text-foreground mb-1">Have questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about this policy, contact us directly and we&apos;ll respond within 24 hours.
              </p>
              <a
                href="mailto:hello@nixio.app"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: badgeColor }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3h12v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3Z" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 3l6 5 6-5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                hello@nixio.app
              </a>
            </div>
          </article>
        </div>
      </div>

    </div>
  )
}
