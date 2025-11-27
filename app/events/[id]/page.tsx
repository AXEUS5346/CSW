import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LumaEmbed } from "@/components/luma-embed"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).single()
    isAdmin = !!admin
  }

  // Fetch event
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single()

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.event_date)
  const isPast = new Date() > eventDate

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={isAdmin} />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/events" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>
          </Button>

          <article>
            {event.image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-xl mb-8">
                <img
                  src={event.image_url || "/placeholder.svg"}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
              {isPast && (
                <Badge variant="secondary" className="text-sm">
                  Past Event
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mb-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" at "}
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.description && (
              <div className="prose prose-neutral max-w-none mb-8">
                <p className="text-lg text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {event.luma_embed_url && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{isPast ? "Event Details" : "Register for this Event"}</h2>
                <LumaEmbed url={event.luma_embed_url} />
              </div>
            )}

            {!event.luma_embed_url && !isPast && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Registration details coming soon.</p>
              </div>
            )}
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
