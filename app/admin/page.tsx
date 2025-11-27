import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: admin } = await supabase.from("admins").select("*").eq("user_id", user.id).single()

  if (!admin) {
    redirect("/")
  }

  // Fetch dashboard data
  const { data: events } = await supabase.from("events").select("*").order("event_date", { ascending: false })

  const { data: members } = await supabase.from("members").select("*").order("created_at", { ascending: false })

  const { data: admins } = await supabase.from("admins").select("*").order("created_at", { ascending: false })

  const { data: content } = await supabase.from("content").select("*").order("page", { ascending: true })

  return (
    <AdminDashboard
      admin={admin}
      events={events || []}
      members={members || []}
      admins={admins || []}
      content={content || []}
    />
  )
}
