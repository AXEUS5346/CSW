import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EventCard } from "@/components/event-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal } from "lucide-react"

export default async function EventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).single()
    isAdmin = !!admin
  }

  const now = new Date().toISOString()

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", now)
    .order("event_date", { ascending: true })

  const { data: pastEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .lt("event_date", now)
    .order("event_date", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={isAdmin} />

      <main className="flex-1">
        <div className="border-b border-border bg-secondary py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Events</h1>
            <p className="mt-4 text-lg text-muted-foreground">Join our community events, workshops, and meetups.</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="upcoming">Upcoming ({upcomingEvents?.length || 0})</TabsTrigger>
              <TabsTrigger value="past">Past Events ({pastEvents?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-border bg-secondary">
                  <Terminal className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No upcoming events</h3>
                  <p className="mt-2 text-muted-foreground">Check back soon for new events!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents && pastEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-border bg-secondary">
                  <Terminal className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No past events</h3>
                  <p className="mt-2 text-muted-foreground">Events will appear here after they happen.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
