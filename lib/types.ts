export interface Admin {
  id: string
  user_id: string
  email: string
  is_super_admin: boolean
  invited_by: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_end_date: string | null
  location: string | null
  luma_embed_url: string | null
  image_url: string | null
  event_details: string | null
  gallery_images: string[] | null
  is_published: boolean
  is_past: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  user_id: string | null
  email: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  page: string
  section: string
  title: string | null
  content: string | null
  metadata: Record<string, unknown>
  updated_by: string | null
  created_at: string
  updated_at: string
}

// Designated admin emails
export const DESIGNATED_ADMIN_EMAILS = ["avinash.anusuri@voidlabs.in", "gowrish.jamili@voidlabs.in"]

// Gallery types for album feature
export interface GalleryEvent {
  id: string
  title: string
  description: string | null
  event_date: string | null
  cover_image_url: string | null
  display_order: number
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: string
  gallery_event_id: string
  image_url: string
  caption: string | null
  description: string | null
  width: number | null
  height: number | null
  display_order: number
  is_featured: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface GalleryEventWithImages extends GalleryEvent {
  images: GalleryImage[]
}
