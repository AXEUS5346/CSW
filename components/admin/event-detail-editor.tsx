"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, X, ImageIcon } from "lucide-react"
import type { Event } from "@/lib/types"
import Link from "next/link"

interface EventDetailEditorProps {
  event: Event
}

export function EventDetailEditor({ event }: EventDetailEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [eventDetails, setEventDetails] = useState(event.event_details || "")
  const [galleryImages, setGalleryImages] = useState<string[]>(event.gallery_images || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSave = async () => {
    setIsLoading(true)
    setSuccessMessage("")

    const supabase = createClient()

    const { error } = await supabase
      .from("events")
      .update({
        event_details: eventDetails || null,
        gallery_images: galleryImages.length > 0 ? galleryImages : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id)

    setIsLoading(false)

    if (!error) {
      setSuccessMessage("Event details saved successfully!")
      router.refresh()
    }
  }

  const addImage = () => {
    if (newImageUrl && !galleryImages.includes(newImageUrl)) {
      setGalleryImages([...galleryImages, newImageUrl])
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index))
  }

  const isPast = new Date(event.event_date) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date(event.event_date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {isPast && " (Past Event)"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Add detailed information about the event. This content will be displayed on the event page
            {isPast ? " as a record of what happened." : "."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="event_details">Detailed Description</Label>
            <Textarea
              id="event_details"
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              rows={10}
              placeholder={
                isPast
                  ? "Write about what happened at this event, key takeaways, who presented, etc..."
                  : "Write detailed information about this event, agenda, what to expect, etc..."
              }
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supports plain text. Use line breaks to separate paragraphs.
            </p>
          </div>

          <div className="grid gap-4">
            <Label>Gallery Images</Label>
            <p className="text-sm text-muted-foreground -mt-2">
              {isPast
                ? "Add photos from the event to showcase what happened."
                : "Add images to showcase the event venue, speakers, or agenda."}
            </p>

            <div className="flex gap-2">
              <Input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button type="button" onClick={addImage} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>

            {galleryImages.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((url, index) => (
                  <div key={index} className="relative group border border-border">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full aspect-video object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {galleryImages.length === 0 && (
              <div className="border border-dashed border-border p-8 text-center">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No images added yet</p>
              </div>
            )}
          </div>

          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button asChild variant="outline">
              <Link href={`/events/${event.id}`}>Preview Event Page</Link>
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
