import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const publicPaths = ["/", "/auth/login", "/auth/sign-up", "/auth/callback", "/auth/reset-callback", "/auth/error", "/auth/sign-up-success", "/pricing", "/privacy", "/terms", "/refund", "/contact", "/reset-password"]
  // API routes never get redirected to HTML — they handle their own auth and return JSON
  const isApiRoute = pathname.startsWith("/api/")
  const isPublic = isApiRoute || publicPaths.some((p) =>
    pathname === p ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/reset-password")
  )

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/sign-up")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Gate: logged-in users without a paid plan must complete onboarding
  if (user && pathname !== "/onboarding" && !isApiRoute && !pathname.startsWith("/auth/")) {
    // Only check plan for dashboard routes (not public pages)
    const isDashboardRoute = !isPublic
    if (isDashboardRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single()
      if (!profile?.plan || profile.plan === "free" || profile.plan === null) {
        const url = request.nextUrl.clone()
        url.pathname = "/onboarding"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
