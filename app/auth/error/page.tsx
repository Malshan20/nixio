import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
        <Link href="/auth/login" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Back to login
        </Link>
      </div>
    </div>
  )
}
