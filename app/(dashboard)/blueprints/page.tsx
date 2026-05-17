import { createClient } from "@/lib/supabase/server"
import { BlueprintsClient } from "./blueprints-client"

export default async function BlueprintsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assets } = await supabase
    .from("assets")
    .select("id, name, created_at, content")
    .eq("user_id", user!.id)
    .eq("type", "blueprint")
    .order("created_at", { ascending: false })

  return <BlueprintsClient assets={assets || []} />
}
