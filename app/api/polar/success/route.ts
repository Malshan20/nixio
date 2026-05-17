import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Called by Polar after successful checkout via ?checkout_id= query param
// We verify the purchase by querying Polar's API and then update the user's plan in Supabase
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const checkoutId = searchParams.get("checkout_id")
  const source = searchParams.get("source") // "onboarding" | undefined

  if (!checkoutId || !process.env.POLAR_ACCESS_TOKEN) {
    return NextResponse.redirect(`${origin}/onboarding?upgrade=error`)
  }

  try {
    // Verify checkout with Polar API
    const polarRes = await fetch(`https://api.polar.sh/v1/checkouts/${checkoutId}`, {
      headers: {
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!polarRes.ok) {
      const dest = source === "onboarding" ? "/onboarding?upgrade=error" : "/dashboard?upgrade=error"
      return NextResponse.redirect(`${origin}${dest}`)
    }

    const checkout = await polarRes.json()

    // Only process confirmed/succeeded checkouts
    if (checkout.status !== "succeeded" && checkout.status !== "confirmed") {
      const dest = source === "onboarding" ? "/onboarding?upgrade=pending" : "/pricing?status=pending"
      return NextResponse.redirect(`${origin}${dest}`)
    }

    const customerId = checkout.customer_external_id
    const polarCustomerId = checkout.customer_id

    if (!customerId) {
      return NextResponse.redirect(`${origin}/onboarding?upgrade=error`)
    }

    // Determine plan tier from product_id
    const productId = checkout.product_id
    const starterProductId = process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID
    const proProductId = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID

    let plan = "starter"
    let generationsLimit = 10
    if (productId === proProductId) {
      plan = "pro"
      generationsLimit = 999999
    } else if (productId === starterProductId) {
      plan = "starter"
      generationsLimit = 10
    }

    // Update user's plan in Supabase using service role for security
    const supabase = await createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        plan,
        generations_limit: generationsLimit,
        polar_customer_id: polarCustomerId,
        polar_subscription_id: checkout.subscription_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)

    if (error) {
      console.error("[polar/success] DB update error:", error)
      return NextResponse.redirect(`${origin}/onboarding?upgrade=error`)
    }

    // Always go to dashboard after successful subscription
    return NextResponse.redirect(`${origin}/dashboard?upgrade=success`)
  } catch (error) {
    console.error("[polar/success] unexpected error:", error)
    return NextResponse.redirect(`${origin}/onboarding?upgrade=error`)
  }
}
