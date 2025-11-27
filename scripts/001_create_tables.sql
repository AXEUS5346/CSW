-- Create admins table for storing admin users with their roles
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  invited_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table for storing community events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  location TEXT,
  luma_embed_url TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  is_past BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create members table for community members
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content table for dynamic page content
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  updated_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page, section)
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
CREATE POLICY "Allow public read of admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Allow admins to insert" ON public.admins FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to update" ON public.admins FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to delete" ON public.admins FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_super_admin = true)
);

-- RLS Policies for events table (public read, admin write)
CREATE POLICY "Allow public read of published events" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Allow admins to read all events" ON public.events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to insert events" ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to update events" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to delete events" ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- RLS Policies for members table
CREATE POLICY "Allow public read of approved members" ON public.members FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow anyone to insert member" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow members to update own profile" ON public.members FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Allow admins to update any member" ON public.members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to delete members" ON public.members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- RLS Policies for content table (public read, admin write)
CREATE POLICY "Allow public read of content" ON public.content FOR SELECT USING (true);
CREATE POLICY "Allow admins to insert content" ON public.content FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to update content" ON public.content FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Allow admins to delete content" ON public.content FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- Insert default content
INSERT INTO public.content (page, section, title, content) VALUES
  ('home', 'hero', 'Welcome to TechDev Community', 'A vibrant community of developers building the future together. Join us for events, workshops, and networking opportunities.'),
  ('home', 'mission', 'Our Mission', 'To foster a collaborative environment where developers can learn, share, and grow together.'),
  ('about', 'story', 'Our Story', 'TechDev Community was founded with a simple mission: bring developers together to learn, collaborate, and innovate. What started as a small meetup group has grown into a thriving community of passionate technologists.'),
  ('about', 'values', 'Our Values', 'We believe in open source, continuous learning, and supporting each other. Our community is built on respect, inclusivity, and the shared love of technology.')
ON CONFLICT (page, section) DO NOTHING;
