import { createClient } from "@/lib/supabase/server"
import { SynthesizerClient } from "./synthesizer-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, generations_used, generations_limit")
    .eq("id", user!.id)
    .single()

  const { data: recentAssets } = await supabase
    .from("assets")
    .select("id, name, created_at, content")
    .eq("user_id", user!.id)
    .eq("type", "blueprint")
    .order("created_at", { ascending: false })
    .limit(5)

  const userName = profile?.full_name || user?.email?.split("@")[0] || "there"

  return (
    <SynthesizerClient
      userName={userName}
      plan={profile?.plan || "free"}
      generationsUsed={profile?.generations_used || 0}
      generationsLimit={profile?.generations_limit || 10}
      recentAssets={recentAssets || []}
    />
  )
}
