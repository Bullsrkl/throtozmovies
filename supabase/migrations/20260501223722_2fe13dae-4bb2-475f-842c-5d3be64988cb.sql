
-- 1. Add new enum values
ALTER TYPE challenge_type ADD VALUE IF NOT EXISTS 'king_maker';
ALTER TYPE account_phase ADD VALUE IF NOT EXISTS 'king_maker_master';

-- 2. event_settings table (single row keyed by id text)
CREATE TABLE public.event_settings (
  id text PRIMARY KEY,
  event_name text NOT NULL DEFAULT 'King Maker',
  banner_title text NOT NULL DEFAULT 'FREE $30K MASTER ACCOUNT',
  banner_subtitle text NOT NULL DEFAULT 'Win 1 of 500 funded accounts',
  banner_image_url text,
  instagram_profile_url text DEFAULT 'https://instagram.com/propgym',
  poster_image_url text,
  result_announcement_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  total_winners integer NOT NULL DEFAULT 500,
  winners_announced boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event settings viewable by everyone"
  ON public.event_settings FOR SELECT USING (true);

CREATE POLICY "Admin can manage event settings"
  ON public.event_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. king_maker_participants table
CREATE TABLE public.king_maker_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  task1_buy_10_completed boolean NOT NULL DEFAULT false,
  task2_instagram_id text,
  task2_completed boolean NOT NULL DEFAULT false,
  task3_screenshot_url text,
  task3_status text NOT NULL DEFAULT 'pending',
  task3_submitted_at timestamptz,
  task4_reels_completed boolean NOT NULL DEFAULT false,
  task4_progress integer NOT NULL DEFAULT 0,
  task5_screenshot_url text,
  task5_status text NOT NULL DEFAULT 'pending',
  task5_submitted_at timestamptz,
  joined boolean NOT NULL DEFAULT false,
  joined_at timestamptz,
  is_winner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_kmp_instagram_id_lower
  ON public.king_maker_participants (lower(task2_instagram_id))
  WHERE task2_instagram_id IS NOT NULL;

ALTER TABLE public.king_maker_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participation or admin"
  ON public.king_maker_participants FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view leaderboard basics"
  ON public.king_maker_participants FOR SELECT TO authenticated
  USING (joined = true);

CREATE POLICY "Users can insert own participation"
  ON public.king_maker_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON public.king_maker_participants FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage participants"
  ON public.king_maker_participants FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_kmp_updated_at
  BEFORE UPDATE ON public.king_maker_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. king_maker_reels table
CREATE TABLE public.king_maker_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_url text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (position)
);

ALTER TABLE public.king_maker_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reels viewable by everyone"
  ON public.king_maker_reels FOR SELECT USING (true);

CREATE POLICY "Admin can manage reels"
  ON public.king_maker_reels FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('king-maker-uploads', 'king-maker-uploads', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "King Maker uploads public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'king-maker-uploads');

CREATE POLICY "Authenticated users can upload king maker files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'king-maker-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own king maker files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'king-maker-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
