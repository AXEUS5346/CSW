"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ImageIcon, Calendar, GripVertical, Star } from "lucide-react"
import type { GalleryEvent, GalleryImage } from "@/lib/types"

interface GalleryManagerProps {
  galleryEvents: (GalleryEvent & { images: GalleryImage[] })[]
  adminId: string
}

export function GalleryManager({ galleryEvents, adminId }: GalleryManagerProps) {
  const router = useRouter()
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    cover_image_url: "",
    is_published: true,
  })

  const [imageFormData, setImageFormData] = useState({
    image_url: "",
    caption: "",
    description: "",
    is_featured: false,
  })

  const resetEventForm = () => {
    setEventFormData({
      title: "",
      description: "",
      event_date: "",
      cover_image_url: "",
      is_published: true,
    })
    setEditingEvent(null)
  }

  const resetImageForm = () => {
    setImageFormData({
      image_url: "",
      caption: "",
      description: "",
      is_featured: false,
    })
    setEditingImage(null)
  }

  const openEditEventDialog = (event: GalleryEvent) => {
    setEditingEvent(event)
    setEventFormData({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date ? event.event_date.split("T")[0] : "",
      cover_image_url: event.cover_image_url || "",
      is_published: event.is_published,
    })
    setIsEventDialogOpen(true)
  }

  const openAddImageDialog = (eventId: string) => {
    setSelectedEventId(eventId)
    resetImageForm()
    setIsImageDialogOpen(true)
  }

  const openEditImageDialog = (image: GalleryImage) => {
    setEditingImage(image)
    setSelectedEventId(image.gallery_event_id)
    setImageFormData({
      image_url: image.image_url,
      caption: image.caption || "",
      description: image.description || "",
      is_featured: image.is_featured,
    })
    setIsImageDialogOpen(true)
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const eventData = {
      title: eventFormData.title,
      description: eventFormData.description || null,
      event_date: eventFormData.event_date ? new Date(eventFormData.event_date).toISOString() : null,
      cover_image_url: eventFormData.cover_image_url || null,
      is_published: eventFormData.is_published,
      updated_at: new Date().toISOString(),
    }

    if (editingEvent) {
      await supabase.from("gallery_events").update(eventData).eq("id", editingEvent.id)
    } else {
      await supabase.from("gallery_events").insert({
        ...eventData,
        created_by: adminId,
        display_order: galleryEvents.length,
      })
    }

    setIsLoading(false)
    setIsEventDialogOpen(false)
    resetEventForm()
    router.refresh()
  }

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventId) return
    setIsLoading(true)

    const supabase = createClient()

    const imageData = {
      image_url: imageFormData.image_url,
      caption: imageFormData.caption || null,
      description: imageFormData.description || null,
      is_featured: imageFormData.is_featured,
      updated_at: new Date().toISOString(),
    }

    if (editingImage) {
      await supabase.from("gallery_images").update(imageData).eq("id", editingImage.id)
    } else {
      const event = galleryEvents.find((e) => e.id === selectedEventId)
      const imageCount = event?.images?.length || 0
      await supabase.from("gallery_images").insert({
        ...imageData,
        gallery_event_id: selectedEventId,
        created_by: adminId,
        display_order: imageCount,
      })
    }

    setIsLoading(false)
    setIsImageDialogOpen(false)
    resetImageForm()
    router.refresh()
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this gallery event and all its images?")) return

    const supabase = createClient()
    await supabase.from("gallery_events").delete().eq("id", eventId)
    router.refresh()
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    const supabase = createClient()
    await supabase.from("gallery_images").delete().eq("id", imageId)
    router.refresh()
  }

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>CrossStack Album</CardTitle>
            <CardDescription>
              Manage gallery events and photos. Organize images by event for the album section.
            </CardDescription>
          </div>
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetEventForm}>
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                <DialogDescription>Create a gallery event to organize related photos together.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    placeholder="e.g., CrossStack Meetup #5"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    placeholder="Brief description of this event..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={eventFormData.event_date}
                    onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cover_image_url">Cover Image URL</Label>
                  <Input
                    id="cover_image_url"
                    value={eventFormData.cover_image_url}
                    onChange={(e) => setEventFormData({ ...eventFormData, cover_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={eventFormData.is_published}
                    onCheckedChange={(checked) => setEventFormData({ ...eventFormData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
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
        {galleryEvents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No gallery events yet</h3>
            <p className="mt-2 text-muted-foreground">Create your first gallery event to start organizing photos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {galleryEvents.map((event) => (
              <div key={event.id} className="border border-border bg-background">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
                  onClick={() => toggleEventExpand(event.id)}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    {event.cover_image_url ? (
                      <img
                        src={event.cover_image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-secondary flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        {!event.is_published && <Badge variant="secondary">Draft</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {event.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.event_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {event.images?.length || 0} photos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => openAddImageDialog(event.id)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Photo
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditEventDialog(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedEvents.has(event.id) && event.images && event.images.length > 0 && (
                  <div className="border-t border-border p-4 bg-secondary/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {event.images.map((image) => (
                        <div key={image.id} className="group relative aspect-square">
                          <img
                            src={image.image_url || "/placeholder.svg"}
                            alt={image.caption || "Gallery image"}
                            className="h-full w-full object-cover"
                          />
                          {image.is_featured && (
                            <div className="absolute top-1 left-1">
                              <Star className="h-4 w-4 text-primary fill-primary" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditImageDialog(image)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 text-background p-1 text-xs truncate">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expandedEvents.has(event.id) && (!event.images || event.images.length === 0) && (
                  <div className="border-t border-border p-8 bg-secondary/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      No photos in this event yet. Click "Add Photo" to upload images.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Dialog */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingImage ? "Edit Photo" : "Add New Photo"}</DialogTitle>
              <DialogDescription>
                Add a photo to this gallery event with an optional caption and description.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleImageSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  value={imageFormData.image_url}
                  onChange={(e) => setImageFormData({ ...imageFormData, image_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
                {imageFormData.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden border border-border">
                    <img
                      src={imageFormData.image_url || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-contain bg-secondary"
                      onError={(e) => {
                        e.currentTarget.src = "/image-preview-concept.png"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={imageFormData.caption}
                  onChange={(e) => setImageFormData({ ...imageFormData, caption: e.target.value })}
                  placeholder="Short caption for this photo..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image_description">Description</Label>
                <Textarea
                  id="image_description"
                  value={imageFormData.description}
                  onChange={(e) => setImageFormData({ ...imageFormData, description: e.target.value })}
                  placeholder="Detailed description of this photo..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={imageFormData.is_featured}
                  onCheckedChange={(checked) => setImageFormData({ ...imageFormData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured Image (shown on homepage)</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingImage ? "Update Photo" : "Add Photo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
