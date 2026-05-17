import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Polar not configured" }, { status: 500 })
    }

    const origin = req.headers.get("origin") || "https://www.nixiolabs.com"
    const returnUrl = `${origin}/settings`

    // Create a Polar customer portal session using the user's Supabase ID as external_customer_id
    const polarRes = await fetch("https://api.polar.sh/v1/customer-sessions/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_customer_id: user.id,
        return_url: returnUrl,
      }),
    })

    if (!polarRes.ok) {
      const err = await polarRes.text()
      console.error("[polar/portal] session create error:", err)
      return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
    }

    const session = await polarRes.json()
    return NextResponse.json({ url: session.customer_portal_url })
  } catch (err) {
    console.error("[polar/portal] unexpected error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
