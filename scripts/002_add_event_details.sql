-- Add event_details column to events table for rich content
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_details TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gallery_images TEXT[];

-- Update default content with CrossStack branding
UPDATE public.content SET 
  title = 'Build Together. Learn Together.',
  content = 'CrossStack is a developer-first community where builders, founders, and tinkerers regularly meet to showcase what they are building, exchange feedback, and learn from each other.'
WHERE page = 'home' AND section = 'hero';

UPDATE public.content SET 
  title = 'Our Story',
  content = 'CrossStack is a developer-first community where builders, founders, and tinkerers regularly meet to showcase what they are building, exchange feedback, and learn from each other through structured but lightweight events. We focus on people who learn by building, giving them a space to present real projects instead of only listening to talks. It encourages an open, collaborative environment where members can share honest feedback, discuss challenges, and explore new ideas together.'
WHERE page = 'about' AND section = 'story';

UPDATE public.content SET 
  title = 'What We Stand For',
  content = 'CrossStack focuses on people who learn by building, giving them a space to present real projects. We encourage an open, collaborative environment where members can share honest feedback, discuss challenges, and explore new ideas together.'
WHERE page = 'about' AND section = 'values';
