import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EventGallerySection } from "@/components/gallery/event-gallery-section"
import { ImageIcon } from "lucide-react"

export const metadata = {
  title: "CrossStack Album | Photo Gallery",
  description: "Browse photos from CrossStack community events and meetups.",
}

export default async function AlbumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).maybeSingle()
    isAdmin = !!admin
  }

  // Fetch published gallery events with their images
  const { data: galleryEventsData } = await supabase
    .from("gallery_events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: false })

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

  // Filter out events with no images
  const eventsWithPhotos = galleryEventsWithImages.filter((event) => event.images && event.images.length > 0)

  // Calculate total photos
  const totalPhotos = eventsWithPhotos.reduce((acc, event) => acc + (event.images?.length || 0), 0)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={isAdmin} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 border-b border-border">
          <div className="absolute inset-0 bg-secondary/50" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                              linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">CrossStack Album</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Capturing moments from our community events, meetups, and workshops.
              </p>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span>{eventsWithPhotos.length} events</span>
                <span className="w-px h-4 bg-border" />
                <span>{totalPhotos} photos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Sections */}
        <section className="py-12 bg-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {eventsWithPhotos.length > 0 ? (
              <div className="space-y-8">
                {eventsWithPhotos.map((event) => (
                  <EventGallerySection key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-border bg-background">
                <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/30" />
                <h3 className="mt-6 text-xl font-medium">No photos yet</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  We're building our photo gallery. Check back after our next event for fresh memories!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
