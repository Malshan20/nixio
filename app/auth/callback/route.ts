import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/onboarding"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Password reset flow — go straight to reset-password, skip plan checks
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Check if user already has a plan — skip onboarding if they do
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single()
        // If they already have a paid plan, go straight to dashboard
        if (profile?.plan && profile.plan !== "free" && profile.plan !== null) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
