import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, generations_used, generations_limit, polar_customer_id, polar_subscription_id, created_at")
    .eq("id", user.id)
    .single()

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences.</p>
      </div>

      <SettingsForm
        userId={user.id}
        email={user.email || ""}
        fullName={profile?.full_name || ""}
        plan={profile?.plan || "free"}
        generationsUsed={profile?.generations_used || 0}
        generationsLimit={profile?.generations_limit || 10}
        polarCustomerId={profile?.polar_customer_id || null}
        polarSubscriptionId={profile?.polar_subscription_id || null}
        memberSince={profile?.created_at || null}
      />
    </div>
  )
}
