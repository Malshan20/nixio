"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

const navItems: { label: string; href: string; badge?: string; icon: React.ReactNode }[] = [
  {
    label: "Synthesize",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5L11.5 7H16L12 10.5l1.5 5.5L9 13l-4.5 3L6 10.5 2 7h4.5L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Blueprints",
    href: "/blueprints",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 2v4h4M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Assets",
    href: "/assets",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 13h6M13 10v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Intelligence",
    href: "/intelligence",
    badge: "NEW",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M14.78 3.22l-1.42 1.42M4.64 13.36l-1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const bottomItems = [
  {
    label: "Upgrade",
    href: "/pricing",
    accent: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5l2.121 5.379L17.25 9l-6.129 2.121L9 16.5l-2.121-6.129-5.629.129 4.629-3L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    accent: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 1.5v1.5M9 15v1.5M1.5 9H3M15 9h1.5M3.698 3.698l1.06 1.06M13.243 13.243l1.06 1.06M14.302 3.698l-1.06 1.06M4.757 13.243l-1.06 1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

interface SidebarProps {
  userEmail?: string
  userName?: string
}

// ─── Shared nav content rendered inside both desktop sidebar + mobile drawer ──
function SidebarContent({
  collapsed,
  userName,
  userEmail,
  pathname,
  onSignOut,
  signingOut,
  onClose,
}: {
  collapsed: boolean
  userName?: string
  userEmail?: string
  pathname: string
  onSignOut: () => void
  signingOut: boolean
  onClose?: () => void
}) {
  const initial = userName ? userName[0].toUpperCase() : userEmail?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className={`flex items-center border-b border-border shrink-0 ${collapsed ? "justify-center px-0 py-4" : "gap-2.5 px-5 py-[18px]"}`}>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Image src="/logo.png" alt="Nixio" width={32} height={32} />
        </div>
        {!collapsed && (
          <>
            <span className="text-foreground font-bold text-lg tracking-tight">Nixio</span>
            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">Beta</span>
          </>
        )}
      </div>

      {/* Main nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                active
                  ? "bg-primary/8 text-primary border border-primary/15 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className={`shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  {item.label}
                  {item.badge && !active && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">{item.badge}</span>
                  )}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={`pb-3 space-y-0.5 border-t border-border pt-3 ${collapsed ? "px-2" : "px-3"}`}>
        {bottomItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                item.accent
                  ? "bg-primary/10 text-primary border border-primary/15 hover:bg-primary/15"
                  : active
                  ? "bg-primary/8 text-primary border border-primary/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className={`shrink-0 ${item.accent ? "text-primary" : active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </Link>
          )
        })}

        {/* User row */}
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-sm text-xs font-bold">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <button onClick={onSignOut} disabled={signingOut} title="Sign out" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10.667 11.333 14 8l-3.333-3.333M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onSignOut}
            disabled={signingOut}
            title="Sign out"
            className="w-full flex justify-center py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10.667 11.333 14 8l-3.333-3.333M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Desktop sidebar (collapsible rail) ───────────────────────────────────────
export function Sidebar({ userEmail, userName }: SidebarProps) {
  const rawPathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const pathname = mounted ? rawPathname : ""

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <aside
      className={`relative flex flex-col bg-card border-r border-border h-screen transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-64"
      }`}
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[22px] z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d={collapsed ? "M3.5 2l3 3-3 3" : "M6.5 2l-3 3 3 3"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <SidebarContent
        collapsed={collapsed}
        userName={userName}
        userEmail={userEmail}
        pathname={pathname}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
    </aside>
  )
}

// ─── Mobile sidebar (slide-in overlay) ────────────────────────────────────────
export function MobileSidebar({ userEmail, userName }: SidebarProps) {
  const rawPathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const pathname = mounted ? rawPathname : ""

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <>
      {/* Top bar — visible only on mobile */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-card border-b border-border shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="Nixio" width={28} height={28} />
          </div>
          <span className="text-foreground font-bold text-base tracking-tight">Nixio</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open navigation"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 6h16M3 11h16M3 16h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 md:hidden transition-transform duration-200 ease-out ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close navigation"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <SidebarContent
          collapsed={false}
          userName={userName}
          userEmail={userEmail}
          pathname={pathname}
          onSignOut={handleSignOut}
          signingOut={signingOut}
          onClose={() => setOpen(false)}
        />
      </aside>
    </>
  )
}
