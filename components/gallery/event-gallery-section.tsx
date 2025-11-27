"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Calendar, ImageIcon } from "lucide-react"
import type { GalleryEvent, GalleryImage } from "@/lib/types"

interface EventGallerySectionProps {
  event: GalleryEvent & { images: GalleryImage[] }
}

export function EventGallerySection({ event }: EventGallerySectionProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImageIndex(null)
  }

  const goToPrevious = () => {
    if (selectedImageIndex === null) return
    setSelectedImageIndex(selectedImageIndex === 0 ? event.images.length - 1 : selectedImageIndex - 1)
  }

  const goToNext = () => {
    if (selectedImageIndex === null) return
    setSelectedImageIndex(selectedImageIndex === event.images.length - 1 ? 0 : selectedImageIndex + 1)
  }

  const currentImage = selectedImageIndex !== null ? event.images[selectedImageIndex] : null

  if (!event.images || event.images.length === 0) {
    return null
  }

  // Create a dynamic grid layout based on number of images
  const getGridClass = () => {
    const count = event.images.length
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-2"
    if (count === 3) return "grid-cols-2 md:grid-cols-3"
    if (count <= 5) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
  }

  return (
    <div className="border border-border bg-background">
      {/* Event Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-4">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url || "/placeholder.svg"}
              alt={event.title}
              className="h-20 w-20 object-cover shrink-0"
            />
          ) : (
            <div className="h-20 w-20 bg-secondary flex items-center justify-center shrink-0">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold">{event.title}</h3>
            {event.event_date && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(event.event_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {event.description && <p className="text-sm text-muted-foreground mt-2">{event.description}</p>}
            <p className="text-sm text-muted-foreground mt-2">
              {event.images.length} photo{event.images.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className={`grid ${getGridClass()} gap-1 p-1`}>
        {event.images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={image.image_url || "/placeholder.svg"}
              alt={image.caption || `Photo ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-200" />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-foreground/70 text-background text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                {image.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl w-full p-0 bg-foreground border-none">
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-background hover:bg-background/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {event.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-background hover:bg-background/20 h-12 w-12"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-background hover:bg-background/20 h-12 w-12"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image */}
            {currentImage && (
              <div className="flex flex-col">
                <div className="relative min-h-[60vh] flex items-center justify-center p-4">
                  <img
                    src={currentImage.image_url || "/placeholder.svg"}
                    alt={currentImage.caption || "Gallery image"}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                </div>

                {/* Caption and description */}
                {(currentImage.caption || currentImage.description) && (
                  <div className="p-6 bg-background border-t border-border">
                    {currentImage.caption && <h4 className="font-semibold text-foreground">{currentImage.caption}</h4>}
                    {currentImage.description && (
                      <p className="text-sm text-muted-foreground mt-1">{currentImage.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedImageIndex !== null ? selectedImageIndex + 1 : 1} of {event.images.length}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
