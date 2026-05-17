import Image from "next/image"
import Link from "next/link"

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
        {/* Logo and Slogan */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Image src="/logo.png" alt="Nixio" width={28} height={28} />
          </div>
          <span className="text-base font-bold text-foreground">Nixio</span>
          <span className="text-muted-foreground text-sm ml-1 hidden sm:inline">
            — Faster. Simpler. More actionable.
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="/#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
          <Link href="/auth/login" className="hover:text-foreground transition-colors">
            Login
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        {/* Policy Links and Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border hidden sm:inline">·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="text-border hidden sm:inline">·</span>
            <Link href="/refund" className="hover:text-foreground transition-colors">
              Refund Policy
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Nixio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}