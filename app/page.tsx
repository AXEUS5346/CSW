import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EventCard } from "@/components/event-card"
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
    const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).single()
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
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={isAdmin} />

      <main className="flex-1">
        <section className="relative py-24 lg:py-32 border-b border-border">
          <div className="absolute inset-0 bg-secondary/50" />
          {/* Tech grid pattern */}
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
                {heroContent?.title || "Build Across The Stack"}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
                {heroContent?.content ||
                  "CrossStack is a community of developers who build across technologies. Join us for events, workshops, and connect with builders who ship."}
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

        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-px bg-border md:grid-cols-3">
              <div className="flex flex-col p-8 bg-background">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-6">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Regular Events</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Meetups, workshops, and hackathons. Learn new tech and ship projects with the community.
                </p>
              </div>
              <div className="flex flex-col p-8 bg-background border-x border-border">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Developer Network</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with builders across frontend, backend, DevOps, and beyond. Grow your network.
                </p>
              </div>
              <div className="flex flex-col p-8 bg-background">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-6">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Learn & Ship</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hands-on sessions, code reviews, and project showcases. Level up your skills.
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

        <section className="py-20 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to build with us?</h2>
                <p className="mt-4 text-lg opacity-80">Join CrossStack and connect with developers who ship.</p>
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
