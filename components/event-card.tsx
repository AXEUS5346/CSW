import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import type { Event } from "@/lib/types"
import Link from "next/link"

interface EventCardProps {
  event: Event
  showActions?: boolean
}

export function EventCard({ event, showActions = true }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const isPast = new Date() > eventDate

  return (
    <Card className="overflow-hidden transition-all hover:border-primary">
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden border-b border-border">
          <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="h-full w-full object-cover" />
        </div>
      )}
      {!event.image_url && (
        <div className="aspect-video w-full bg-secondary flex items-center justify-center border-b border-border">
          <Calendar className="h-12 w-12 text-muted-foreground/30" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{event.title}</h3>
          {isPast && (
            <Badge variant="secondary" className="shrink-0">
              Past
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" at "}
              {eventDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
            {event.luma_embed_url && !isPast && (
              <Button asChild size="sm" className="flex-1">
                <a
                  href={event.luma_embed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Register <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
