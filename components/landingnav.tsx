"use client"

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function LandingNav() {
  const [open, setOpen] = useState(false)
  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          {/* Logo */}
          <Link href="/">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Image src="/logo.png" alt="Nixio" width={32} height={32} />
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">Nixio</span>
          </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="/#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/auth/sign-up" className="px-4 py-2 rounded-xl bg-foreground text-white text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm">
              Start free trial
            </Link>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/auth/sign-up" className="px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-semibold shrink-0">
              Try free
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 6h16M3 11h16M3 16h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-border bg-white animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="px-4 pb-5 pt-2 border-t border-border flex flex-col gap-2.5">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Start 3-day free trial
              </Link>
            </div>
          </div>
        )}
      </nav>
      </>
  )
}