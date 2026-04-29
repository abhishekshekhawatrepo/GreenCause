-- ================================================================
-- GreenCause Database Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ================================================================

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  selected_charity_id UUID,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (₹499/month or ₹4,999/year)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  razorpay_plan_id TEXT,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  amount_inr DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Golf Scores (Stableford, 1–45)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Charities
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK after charities table exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_charity;
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_charity
  FOREIGN KEY (selected_charity_id) REFERENCES charities(id)
  ON DELETE SET NULL;

-- Charity Events
CREATE TABLE IF NOT EXISTS charity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Draws (auto-scheduled last day of each month)
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month DATE NOT NULL,
  scheduled_date DATE NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'admin_review', 'published')),
  total_pool_amount_inr DECIMAL(10,2) DEFAULT 0,
  jackpot_rollover_inr DECIMAL(10,2) DEFAULT 0,
  admin_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Draw Entries
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scores INTEGER[] NOT NULL,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(draw_id, user_id)
);

-- Winners (proof = photos only: JPEG/PNG/WebP, max 5 MB)
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_type TEXT CHECK (match_type IN ('5-match', '4-match', '3-match')),
  prize_amount DECIMAL(10,2),
  proof_image_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Donations (independent, non-subscription)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- Row Level Security (RLS) Policies
-- ================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Dynamically drop ALL existing policies on these tables to clear rogue recursive rules
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (
      SELECT policyname, tablename 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('profiles', 'subscriptions', 'scores', 'charities', 'draws', 'draw_entries', 'winners', 'donations')
    ) 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename); 
    END LOOP; 
END $$;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions: users can read own subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores: users can CRUD own scores
CREATE POLICY "Users can view own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Charities: everyone can read active charities
CREATE POLICY "Anyone can view active charities" ON charities FOR SELECT USING (is_active = true);

-- Draws: everyone can view published draws
CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');

-- Draw entries: users can view own entries
CREATE POLICY "Users can view own draw entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);

-- Winners: users can view own winners
CREATE POLICY "Users can view own wins" ON winners FOR SELECT USING (auth.uid() = user_id);

-- Donations: users can view own donations and insert
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert donations" ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- Seed Data: Sample Charities
-- ================================================================

INSERT INTO charities (name, description, category, is_active) VALUES
  ('Fore The Trees Foundation', 'Planting trees on and around golf courses worldwide. One tree for every birdie scored.', 'Environment', true),
  ('Junior Golf India', 'Providing equipment and coaching for underprivileged junior golfers across India.', 'Youth & Sport', true),
  ('Green Fairways Initiative', 'Promoting sustainable golf course management and water conservation.', 'Sustainability', true),
  ('Caddie Welfare Trust', 'Healthcare, education, and financial support for golf caddies and their families.', 'Social Welfare', true),
  ('Swing for Smiles', 'Organising golf charity events to fund cleft palate surgeries for children.', 'Healthcare', true);

-- ================================================================
-- Storage Buckets (Run this if using Supabase Storage)
-- ================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view proofs" ON storage.objects;

CREATE POLICY "Users can upload their own proofs" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'proofs' );
CREATE POLICY "Anyone can view proofs" ON storage.objects FOR SELECT USING ( bucket_id = 'proofs' );
