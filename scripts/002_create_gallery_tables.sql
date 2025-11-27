-- Create gallery_events table for organizing photos by events/categories
CREATE TABLE IF NOT EXISTS public.gallery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  cover_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery_images table for storing individual images with metadata
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_event_id UUID NOT NULL REFERENCES public.gallery_events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  description TEXT,
  width INTEGER,
  height INTEGER,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gallery_events table
CREATE POLICY "Allow public read of published gallery events" ON public.gallery_events 
  FOR SELECT USING (is_published = true);
CREATE POLICY "Allow admins to read all gallery events" ON public.gallery_events 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Allow admins to insert gallery events" ON public.gallery_events 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Allow admins to update gallery events" ON public.gallery_events 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Allow admins to delete gallery events" ON public.gallery_events 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- RLS Policies for gallery_images table
CREATE POLICY "Allow public read of gallery images" ON public.gallery_images 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gallery_events ge WHERE ge.id = gallery_event_id AND ge.is_published = true)
  );
CREATE POLICY "Allow admins to read all gallery images" ON public.gallery_images 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Allow admins to insert gallery images" ON public.gallery_images 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Allow admins to update gallery images" ON public.gallery_images 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Allow admins to delete gallery images" ON public.gallery_images 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_event_id ON public.gallery_images(gallery_event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_events_published ON public.gallery_events(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_images_featured ON public.gallery_images(is_featured);
