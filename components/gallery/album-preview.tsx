import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { GalleryEvent, GalleryImage } from "@/lib/types"

interface AlbumPreviewProps {
  galleryEvents: (GalleryEvent & { images: GalleryImage[] })[]
}

export function AlbumPreview({ galleryEvents }: AlbumPreviewProps) {
  // Get featured images or first images from each event for the preview
  const previewImages: (GalleryImage & { eventTitle: string })[] = []

  galleryEvents.forEach((event) => {
    if (event.images && event.images.length > 0) {
      // First, add featured images
      const featuredImages = event.images.filter((img) => img.is_featured)
      featuredImages.forEach((img) => {
        previewImages.push({ ...img, eventTitle: event.title })
      })

      // If no featured images, add the first image from the event
      if (featuredImages.length === 0 && event.images[0]) {
        previewImages.push({ ...event.images[0], eventTitle: event.title })
      }
    }
  })

  // Limit to 8 images for the preview grid
  const displayImages = previewImages.slice(0, 8)

  if (displayImages.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-background border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">CrossStack Album</h2>
            <p className="text-muted-foreground mt-1">Memories from our community events</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/album" className="flex items-center gap-2">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Dynamic Masonry-like Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayImages.map((image, index) => {
            // Create varied sizes for visual interest
            const isLarge = index === 0 || index === 5
            const isTall = index === 2 || index === 7

            return (
              <Link
                key={image.id}
                href="/album"
                className={`group relative overflow-hidden bg-secondary ${
                  isLarge ? "md:col-span-2 md:row-span-2" : ""
                } ${isTall ? "row-span-2" : ""}`}
              >
                <div className={`${isLarge ? "aspect-square" : isTall ? "aspect-[3/4]" : "aspect-square"}`}>
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.caption || "Gallery image"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-end">
                  <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.caption && <p className="text-background text-sm font-medium">{image.caption}</p>}
                    <p className="text-background/80 text-xs mt-1">{image.eventTitle}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
