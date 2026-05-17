import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MarketIntelligenceClient } from "./mie-client"

export const metadata = {
  title: "Marketplace Intelligence Engine — Nixio",
  description: "Live Whop market data + AI-powered product blueprints.",
}

export default async function IntelligencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: history } = await supabase
    .from("mie_generations")
    .select("id, niche_query, created_at, blueprint")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return <MarketIntelligenceClient history={history || []} />
}
