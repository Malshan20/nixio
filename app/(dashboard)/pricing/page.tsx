import { createClient } from "@/lib/supabase/server"
import PricingClient from "./pricing-client"

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
    currentPlan = profile?.plan ?? null
  }

  return <PricingClient currentPlan={currentPlan} />
}
