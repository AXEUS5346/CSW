"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Shield, FileText, LogOut, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Admin, Event, Member, Content, GalleryEvent, GalleryImage } from "@/lib/types"
import { EventsManager } from "./events-manager"
import { MembersManager } from "./members-manager"
import { AdminsManager } from "./admins-manager"
import { ContentManager } from "./content-manager"
import { GalleryManager } from "./gallery-manager"

interface AdminDashboardProps {
  admin: Admin
  events: Event[]
  members: Member[]
  admins: Admin[]
  content: Content[]
  galleryEvents: (GalleryEvent & { images: GalleryImage[] })[]
}

export function AdminDashboard({ admin, events, members, admins, content, galleryEvents }: AdminDashboardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date()).length
  const totalPhotos = galleryEvents.reduce((acc, event) => acc + (event.images?.length || 0), 0)

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/crossstack-logo.png"
                alt="CrossStack"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold">CrossStack Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{admin.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            <div className="bg-background border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-primary">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </div>
            <div className="bg-background border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-accent">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingEvents}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-background border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-foreground">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </div>
            <div className="bg-background border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-primary">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{admins.length}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </div>
            <div className="bg-background border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-accent">
                  <ImageIcon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPhotos}</p>
                  <p className="text-sm text-muted-foreground">Photos</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" /> Events
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <ImageIcon className="h-4 w-4" /> Gallery
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" /> Members
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Shield className="h-4 w-4" /> Admins
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <FileText className="h-4 w-4" /> Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <EventsManager events={events} adminId={admin.id} />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryManager galleryEvents={galleryEvents} adminId={admin.id} />
            </TabsContent>

            <TabsContent value="members">
              <MembersManager members={members} />
            </TabsContent>

            <TabsContent value="admins">
              <AdminsManager admins={admins} currentAdmin={admin} />
            </TabsContent>

            <TabsContent value="content">
              <ContentManager content={content} adminId={admin.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
