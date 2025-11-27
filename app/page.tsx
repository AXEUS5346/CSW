import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EventCard } from "@/components/event-card"
import { AlbumPreview } from "@/components/gallery/album-preview"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, Code, Terminal } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).maybeSingle()
    isAdmin = !!admin
  }

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(3)

  const { data: heroContent } = await supabase
    .from("content")
    .select("*")
    .eq("page", "home")
    .eq("section", "hero")
    .maybeSingle()

  const { data: galleryEventsData } = await supabase
    .from("gallery_events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: false })
    .limit(6)

  const galleryEvents = galleryEventsData || []

  // Fetch images for each gallery event
  const galleryEventsWithImages = await Promise.all(
    galleryEvents.map(async (event) => {
      const { data: images } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("gallery_event_id", event.id)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
      return { ...event, images: images || [] }
    }),
  )

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={isAdmin} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 border-b border-border">
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
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center mb-8">
                <Image
                  src="/crossstack-logo.png"
                  alt="CrossStack"
                  width={100}
                  height={100}
                  className="h-24 w-24 object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
                {heroContent?.title || "Build Together. Learn Together."}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
                {heroContent?.content ||
                  "CrossStack is a developer-first community where builders, founders, and tinkerers regularly meet to showcase what they are building, exchange feedback, and learn from each other."}
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Button asChild size="lg" className="font-semibold">
                  <Link href="/events">
                    Explore Events <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-semibold bg-transparent">
                  <Link href="/join">Join the Community</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-px bg-border md:grid-cols-3">
              <div className="flex flex-col p-8 bg-background">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-6">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Demo Sessions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Present your projects, prototypes, or startup ideas to a room of builders and founders.
                </p>
              </div>
              <div className="flex flex-col p-8 bg-background border-x border-border">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Builder Network</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with founders, developers, and tinkerers who ship real projects.
                </p>
              </div>
              <div className="flex flex-col p-8 bg-background">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-6">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Real Feedback</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get honest, actionable feedback and walk away with clear next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-20 bg-secondary border-y border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
                <p className="text-muted-foreground mt-1">Join us at our next gathering</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/events" className="flex items-center gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-border bg-background">
                <Terminal className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No upcoming events</h3>
                <p className="mt-2 text-muted-foreground">Check back soon for new events!</p>
              </div>
            )}
          </div>
        </section>

        {/* CrossStack Album Preview Section */}
        <AlbumPreview galleryEvents={galleryEventsWithImages} />

        {/* CTA Section */}
        <section className="py-20 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to build with us?</h2>
                <p className="mt-4 text-lg opacity-80">Join CrossStack and connect with builders who ship.</p>
              </div>
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link href="/join">Become a Member</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
