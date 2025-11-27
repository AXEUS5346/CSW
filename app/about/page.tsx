import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Users, Target, Layers, Zap } from "lucide-react"
import Image from "next/image"

export default async function AboutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).single()
    isAdmin = !!admin
  }

  const { data: storyContent } = await supabase
    .from("content")
    .select("*")
    .eq("page", "about")
    .eq("section", "story")
    .single()

  const { data: valuesContent } = await supabase
    .from("content")
    .select("*")
    .eq("page", "about")
    .eq("section", "values")
    .single()

  const { count: memberCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", true)

  const { count: eventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader isAdmin={isAdmin} />

      <main className="flex-1">
        <section className="relative py-24 lg:py-32 border-b border-border bg-secondary">
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
              <Image
                src="/crossstack-logo.png"
                alt="CrossStack"
                width={80}
                height={80}
                className="h-20 w-20 object-contain mx-auto mb-8"
              />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About CrossStack</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Building a stronger developer community, one event at a time.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background border-b border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-px bg-border md:grid-cols-3">
              <div className="bg-background p-8 text-center">
                <div className="text-4xl font-bold text-primary">{memberCount || 0}+</div>
                <div className="mt-2 text-muted-foreground">Community Members</div>
              </div>
              <div className="bg-background p-8 text-center">
                <div className="text-4xl font-bold text-primary">{eventCount || 0}+</div>
                <div className="mt-2 text-muted-foreground">Events Hosted</div>
              </div>
              <div className="bg-background p-8 text-center">
                <div className="text-4xl font-bold text-primary">100%</div>
                <div className="mt-2 text-muted-foreground">Free to Join</div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight mb-6">{storyContent?.title || "Our Story"}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {storyContent?.content ||
                  "CrossStack was founded with a simple mission: bring developers together who work across the full stack. Whether you're building frontends, backends, APIs, or infrastructure - this is your community. What started as a small meetup has grown into a network of builders who learn from each other and ship together."}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary border-y border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight mb-4">{valuesContent?.title || "Our Values"}</h2>
              <p className="text-muted-foreground">
                {valuesContent?.content || "We believe in open source, continuous learning, and shipping together."}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-background border border-border">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Inclusivity</h3>
                <p className="text-sm text-muted-foreground">All skill levels welcome.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background border border-border">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Growth</h3>
                <p className="text-sm text-muted-foreground">Continuous learning.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background border border-border">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-4">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Full Stack</h3>
                <p className="text-sm text-muted-foreground">Build across technologies.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background border border-border">
                <div className="flex h-12 w-12 items-center justify-center border border-primary mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Ship</h3>
                <p className="text-sm text-muted-foreground">Build and launch together.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
