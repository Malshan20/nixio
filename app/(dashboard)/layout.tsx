import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar, MobileSidebar } from "@/components/nixio/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single()

  const userName = profile?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop collapsible sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar userEmail={user.email} userName={userName} />
      </div>

      {/* Mobile: top bar + slide-in sidebar overlay */}
      <MobileSidebar userEmail={user.email} userName={userName} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
