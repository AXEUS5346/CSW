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

  const { data: admin } = await supabase.from("admins").select("*").eq("user_id", user.id).maybeSingle()

  if (!admin) {
    redirect("/")
  }

  // Fetch dashboard data
  const { data: events } = await supabase.from("events").select("*").order("event_date", { ascending: false })

  const { data: members } = await supabase.from("members").select("*").order("created_at", { ascending: false })

  const { data: adminsData } = await supabase.from("admins").select("*").order("created_at", { ascending: false })

  const { data: content } = await supabase.from("content").select("*").order("page", { ascending: true })

  const { data: galleryEventsData } = await supabase
    .from("gallery_events")
    .select("*")
    .order("display_order", { ascending: true })

  const galleryEvents = galleryEventsData || []

  // Fetch images for each gallery event
  const galleryEventsWithImages = await Promise.all(
    galleryEvents.map(async (event) => {
      const { data: images } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("gallery_event_id", event.id)
        .order("display_order", { ascending: true })
      return { ...event, images: images || [] }
    }),
  )

  return (
    <AdminDashboard
      admin={admin}
      events={events || []}
      members={members || []}
      admins={adminsData || []}
      content={content || []}
      galleryEvents={galleryEventsWithImages}
    />
  )
}
