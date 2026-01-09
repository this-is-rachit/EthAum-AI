-- ==============================================================================
-- ETHAUM.AI DATABASE SCHEMA & CONFIGURATION
-- VERSION: 2.0 (Secure Vault + AI Vector Search Enabled)
-- 
-- INSTRUCTIONS:
-- 1. Create a new Supabase Project.
-- 2. Go to SQL Editor -> Paste this script -> Run.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & SETUP
-- ------------------------------------------------------------------------------
-- Enable Vector extension for AI Semantic Search
CREATE EXTENSION IF NOT EXISTS vector;

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

-- STARTUPS (Includes Vector Embedding)
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
  -- Secure Assets (Stores Paths, not Public URLs)
  pitch_deck_url text,
  technical_docs_url text,
  financials_url text,
  compliance_url text,
  is_onboarded boolean DEFAULT false,
  -- Metrics
  upvotes_count integer DEFAULT 0,
  eth_aum_score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- AI Vector Column (1536 dimensions for OpenAI text-embedding-3-small)
  description_embedding vector(1536)
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
-- 3. STORAGE SETUP (SECURE VAULT)
-- ------------------------------------------------------------------------------
-- Create PRIVATE bucket (Public = False)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-assets', 'vault-assets', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public_Read_Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Self_Update_Profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Self_Insert_Profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Startups Policies
CREATE POLICY "Public_Read_Startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Founder_Manage_Startup" ON public.startups FOR ALL USING (auth.uid() = founder_id);
CREATE POLICY "Founder_Insert_Startup" ON public.startups FOR INSERT WITH CHECK (auth.uid() = founder_id);

-- Requests Policies
CREATE POLICY "Buyer_Create_Req" ON public.pilot_requests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "View_Relevant_Req" ON public.pilot_requests FOR SELECT USING (
    auth.uid() = buyer_id OR 
    EXISTS (SELECT 1 FROM public.startups WHERE id = startup_id AND founder_id = auth.uid())
);
CREATE POLICY "Founder_Update_Req" ON public.pilot_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.startups WHERE id = startup_id AND founder_id = auth.uid())
);

-- Messages Policies
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

-- Upvotes/Reviews Policies
CREATE POLICY "Public_Read_Votes" ON public.startup_upvotes FOR SELECT USING (true);
CREATE POLICY "User_Vote" ON public.startup_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public_Read_Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "User_Review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ------------------------------------------------------------------------------
-- 5. STORAGE POLICIES (VAULT SECURITY)
-- ------------------------------------------------------------------------------
-- A. Founders Manage Own Assets
CREATE POLICY "Founder Manage Own Assets" ON storage.objects
FOR ALL
USING ( bucket_id = 'vault-assets' AND auth.uid()::text = (storage.foldername(name))[1] )
WITH CHECK ( bucket_id = 'vault-assets' AND auth.uid()::text = (storage.foldername(name))[1] );

-- B. Founders Read Own Assets
CREATE POLICY "Founder Read Own Assets" ON storage.objects
FOR SELECT
USING ( bucket_id = 'vault-assets' AND auth.uid()::text = (storage.foldername(name))[1] );

-- C. Buyers Read Approved Assets Only
CREATE POLICY "Buyer Read Approved Assets" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'vault-assets'
    AND EXISTS (
        SELECT 1 FROM public.pilot_requests pr
        JOIN public.startups s ON pr.startup_id = s.id
        WHERE 
            pr.buyer_id = auth.uid()
            AND pr.status = 'approved'
            AND s.founder_id::text = (storage.foldername(name))[1]
    )
);

-- ------------------------------------------------------------------------------
-- 6. AI SEMANTIC SEARCH FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_startups (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS setof startups
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM startups
  WHERE 1 - (description_embedding <=> query_embedding) > match_threshold
  ORDER BY description_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. REALTIME & PERMISSIONS
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pilot_messages;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_startups(vector, double precision, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION match_startups(vector, double precision, integer) TO anon;

-- END OF SCRIPT