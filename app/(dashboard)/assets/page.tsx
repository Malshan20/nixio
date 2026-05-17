import { createClient } from "@/lib/supabase/server"
import { AssetsClient } from "./assets-client"

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: blueprints }, { data: pdfAssets }] = await Promise.all([
    supabase
      .from("assets")
      .select("id, name, created_at, content")
      .eq("user_id", user!.id)
      .eq("type", "blueprint")
      .order("created_at", { ascending: false }),
    supabase
      .from("pdf_assets")
      .select("id, type, title, content_json, created_at, blueprint_id")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ])

  return <AssetsClient blueprints={blueprints || []} pdfAssets={pdfAssets || []} />
}
