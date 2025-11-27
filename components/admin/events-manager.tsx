"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import type { Event } from "@/lib/types"

interface EventsManagerProps {
  events: Event[]
  adminId: string
}

export function EventsManager({ events, adminId }: EventsManagerProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_end_date: "",
    location: "",
    luma_embed_url: "",
    image_url: "",
    is_published: true,
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      event_end_date: "",
      location: "",
      luma_embed_url: "",
      image_url: "",
      is_published: true,
    })
    setEditingEvent(null)
  }

  const openEditDialog = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      event_end_date: event.event_end_date ? new Date(event.event_end_date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      luma_embed_url: event.luma_embed_url || "",
      image_url: event.image_url || "",
      is_published: event.is_published,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      event_date: new Date(formData.event_date).toISOString(),
      event_end_date: formData.event_end_date ? new Date(formData.event_end_date).toISOString() : null,
      location: formData.location || null,
      luma_embed_url: formData.luma_embed_url || null,
      image_url: formData.image_url || null,
      is_published: formData.is_published,
      updated_at: new Date().toISOString(),
    }

    if (editingEvent) {
      await supabase.from("events").update(eventData).eq("id", editingEvent.id)
    } else {
      await supabase.from("events").insert({
        ...eventData,
        created_by: adminId,
      })
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    const supabase = createClient()
    await supabase.from("events").delete().eq("id", eventId)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Events</CardTitle>
            <CardDescription>Manage your community events and embed Luma links.</CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? "Update the event details below." : "Fill in the details for your new event."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="event_date">Start Date & Time *</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_end_date">End Date & Time</Label>
                    <Input
                      id="event_end_date"
                      type="datetime-local"
                      value={formData.event_end_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event_end_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Online via Zoom, or 123 Main St"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="luma_embed_url">Luma Event URL</Label>
                  <Input
                    id="luma_embed_url"
                    type="url"
                    value={formData.luma_embed_url}
                    onChange={(e) => setFormData({ ...formData, luma_embed_url: e.target.value })}
                    placeholder="https://lu.ma/your-event"
                  />
                  <p className="text-xs text-muted-foreground">Paste your Luma event URL to embed registration.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No events yet. Create your first event!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Luma</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const isPast = new Date(event.event_date) < new Date()
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                    <TableCell>{event.location || "-"}</TableCell>
                    <TableCell>
                      {!event.is_published ? (
                        <Badge variant="secondary">Draft</Badge>
                      ) : isPast ? (
                        <Badge variant="outline">Past</Badge>
                      ) : (
                        <Badge>Upcoming</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.luma_embed_url ? (
                        <a
                          href={event.luma_embed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Link <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
