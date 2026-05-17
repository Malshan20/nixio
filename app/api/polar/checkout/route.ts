import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { productId, source } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const origin = req.headers.get("origin") || "http://localhost:3000"
    const sourceParam = source ? `&source=${source}` : ""
    const successUrl = `${origin}/api/polar/success?checkout_id={CHECKOUT_ID}${sourceParam}`

    // Build Polar checkout session via API
    const polarRes = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: successUrl,
        ...(user && {
          customer_email: user.email,
          customer_external_id: user.id,
          metadata: { user_id: user.id },
        }),
      }),
    })

    if (!polarRes.ok) {
      const err = await polarRes.text()
      console.error("[polar] checkout error:", err)
      return NextResponse.json({ error: "Polar checkout failed" }, { status: 500 })
    }

    const checkout = await polarRes.json()
    return NextResponse.json({ url: checkout.url })
  } catch (err) {
    console.error("[polar] unexpected error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
