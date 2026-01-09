-- ==============================================================================
-- ETHAUM.AI DATABASE SCHEMA & CONFIGURATION
-- VERSION: 1.0 (Stable Production Build)
-- 
-- INSTRUCTIONS FOR DEVELOPERS:
-- 1. Create a new Supabase Project.
-- 2. Go to the SQL Editor.
-- 3. Paste this entire script and click "RUN".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CLEANUP (Ensures a fresh start if re-running)
-- ------------------------------------------------------------------------------
BEGIN;

-- Disable RLS to allow dropping
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.startups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pilot_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pilot_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.startup_upvotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;

-- Drop Tables (Cascade handles dependencies)
DROP TABLE IF EXISTS public.pilot_messages CASCADE;
DROP TABLE IF EXISTS public.pilot_requests CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.startup_upvotes CASCADE;
DROP TABLE IF EXISTS public.startups CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Note: We do NOT wipe auth.users here to avoid breaking the developer's 
-- local Supabase instance if they have other projects, but in a fresh project,
-- this is fine.

COMMIT;

-- ------------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ------------------------------------------------------------------------------

-- PROFILES (Linked to auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text CHECK (role IN ('founder', 'buyer')),
  full_name text,
  startup_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STARTUPS
CREATE TABLE public.startups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  tagline text,
  description text,
  website_url text,
  logo_url text,
  stage text CHECK (stage IN ('Series A', 'Series B', 'Series C', 'Series D')),
  arr_range text CHECK (arr_range IN ('$1M-$5M', '$5M-$20M', '$20M-$50M', '$50M+')),
  deal_offer text,
  deal_expiry date,
  vault_ready boolean DEFAULT false,
  -- Asset Links
  pitch_deck_url text,
  technical_docs_url text,
  financials_url text,
  compliance_url text,
  is_onboarded boolean DEFAULT false,
  -- Metrics
  upvotes_count integer DEFAULT 0,
  eth_aum_score integer DEFAULT 0,
  -- Vector Embedding (Optional placeholder)
  description_embedding text, 
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PILOT REQUESTS
CREATE TABLE public.pilot_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PILOT MESSAGES (Chat)
CREATE TABLE public.pilot_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.pilot_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- UPVOTES
CREATE TABLE public.startup_upvotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id uuid REFERENCES public.startups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  content text,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. STORAGE BUCKET SETUP (Vault Assets)
-- ------------------------------------------------------------------------------
-- Create the bucket for PDFs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-assets', 'vault-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. REALTIME SETUP (Crucial for Chat)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pilot_messages;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 5. SECURITY POLICIES (RLS) - The "Deadlock-Free" Logic
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES
CREATE POLICY "Public_Read_Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Self_Insert_Profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Self_Update_Profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5.2 STARTUPS
CREATE POLICY "Public_Read_Startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Founder_Manage_Startup" ON public.startups FOR ALL USING (auth.uid() = founder_id);

-- 5.3 PILOT REQUESTS
-- Buyers create requests
CREATE POLICY "Buyer_Create_Req" ON public.pilot_requests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
-- Combined View: Buyers see own, Founders see requests for their startups
CREATE POLICY "View_Relevant_Req" ON public.pilot_requests FOR SELECT USING (
    auth.uid() = buyer_id 
    OR 
    EXISTS (SELECT 1 FROM public.startups WHERE id = startup_id AND founder_id = auth.uid())
);
-- Founders accept/reject
CREATE POLICY "Founder_Update_Req" ON public.pilot_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.startups WHERE id = startup_id AND founder_id = auth.uid())
);

-- 5.4 PILOT MESSAGES
CREATE POLICY "User_Send_Msg" ON public.pilot_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "User_View_Msg" ON public.pilot_messages FOR SELECT USING (
    auth.uid() = sender_id OR 
    EXISTS (
        SELECT 1 FROM public.pilot_requests pr 
        WHERE pr.id = request_id 
        AND (
            pr.buyer_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.startups s WHERE s.id = pr.startup_id AND s.founder_id = auth.uid())
        )
    )
);

-- 5.5 UPVOTES & REVIEWS
CREATE POLICY "Public_Read_Votes" ON public.startup_upvotes FOR SELECT USING (true);
CREATE POLICY "User_Vote" ON public.startup_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User_Unvote" ON public.startup_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public_Read_Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "User_Review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ------------------------------------------------------------------------------
-- 6. STORAGE POLICIES (RLS for Files)
-- ------------------------------------------------------------------------------
-- Allow public read (download) of assets
CREATE POLICY "Public Access Vault" ON storage.objects FOR SELECT
USING ( bucket_id = 'vault-assets' );

-- Allow authenticated users (Founders) to upload
CREATE POLICY "Auth Upload Vault" ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'vault-assets' AND auth.role() = 'authenticated' );

-- Allow users to update/delete their own files
CREATE POLICY "Owner Manage Vault" ON storage.objects FOR ALL
USING ( bucket_id = 'vault-assets' AND auth.uid()::text = (storage.foldername(name))[1] );

-- ------------------------------------------------------------------------------
-- 7. FINAL PERMISSIONS
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- End of Script