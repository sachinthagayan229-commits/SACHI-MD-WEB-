
-- ==========================================
-- SACHI PERSONAL WEBSITE V4
-- SUPABASE DATABASE SETUP
-- ==========================================

-- 1. Website settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '""'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Public website can read settings
DROP POLICY IF EXISTS "Public can read settings"
ON public.site_settings;

CREATE POLICY "Public can read settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Only registered admins can modify settings
DROP POLICY IF EXISTS "Admins can insert settings"
ON public.site_settings;

CREATE POLICY "Admins can insert settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins can update settings"
ON public.site_settings;

CREATE POLICY "Admins can update settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

-- 6. Admin can read own admin record
DROP POLICY IF EXISTS "Admins can read own record"
ON public.admin_users;

CREATE POLICY "Admins can read own record"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 7. Initial website settings
INSERT INTO public.site_settings (key, value)
VALUES
('siteName', '"SACHINTHA"'),
('profileTitle', '"Creator · Tech Enthusiast"'),
('bio', '"Welcome to my personal website."'),
('welcomeText', '"Welcome to my digital space."'),
('whatsappNumber', '"94778936490"'),
('whatsappMessage', '"Hi Sachintha!"'),
('whatsappGroup', '"https://chat.whatsapp.com/KHLoN4Chzag2YPvehbmjm8"'),
('instagram', '"https://www.instagram.com/"'),
('tiktok', '"https://www.tiktok.com/"'),
('facebook', '"https://www.facebook.com/"'),
('facebookDownloader', '""'),
('tiktokDownloader', '""'),
('instagramDownloader', '""'),
('showAbout', '"true"'),
('showTools', '"true"'),
('showContact', '"true"'),
('apiDirectory', '[]')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- SETUP COMPLETE
-- ==========================================
