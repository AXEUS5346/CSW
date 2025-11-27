import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EventDetailEditor } from "@/components/admin/event-detail-editor"

export default async function EditEventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).maybeSingle()

  if (!admin) {
    redirect("/")
  }

  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle()

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={true} />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <EventDetailEditor event={event} />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
