-- ============ member_profiles ============
CREATE TABLE public.member_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id text NOT NULL UNIQUE,
  member_role text NOT NULL DEFAULT 'member',
  membership_status text NOT NULL DEFAULT 'inactive',
  membership_plan text,
  kyc_status text NOT NULL DEFAULT 'pending',
  account_status text NOT NULL DEFAULT 'active',
  full_name text,
  mobile text,
  avatar_url text,
  city text,
  state text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.member_profiles TO authenticated;
GRANT ALL ON public.member_profiles TO service_role;

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own member profile"
ON public.member_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all member profiles"
ON public.member_profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can update their own editable profile fields"
ON public.member_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all member profiles"
ON public.member_profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Prevent members from escalating privileged fields
CREATE OR REPLACE FUNCTION public.protect_member_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.member_id := OLD.member_id;
  NEW.member_role := OLD.member_role;
  NEW.membership_status := OLD.membership_status;
  NEW.membership_plan := OLD.membership_plan;
  NEW.kyc_status := OLD.kyc_status;
  NEW.account_status := OLD.account_status;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_member_profile_fields
BEFORE UPDATE ON public.member_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_member_profile_fields();

CREATE TRIGGER trg_member_profiles_updated_at
BEFORE UPDATE ON public.member_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create a permanent member profile on signup
CREATE OR REPLACE FUNCTION public.create_member_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id text;
BEGIN
  v_member_id := 'MWW' || LPAD((FLOOR(RANDOM() * 100000000))::bigint::text, 8, '0');
  WHILE EXISTS (SELECT 1 FROM public.member_profiles WHERE member_id = v_member_id) LOOP
    v_member_id := 'MWW' || LPAD((FLOOR(RANDOM() * 100000000))::bigint::text, 8, '0');
  END LOOP;

  INSERT INTO public.member_profiles (user_id, member_id, full_name, mobile)
  VALUES (
    NEW.id,
    v_member_id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'mobile'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_member_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_member_profile();

-- ============ hero_banners ============
CREATE TABLE public.hero_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  accent text NOT NULL DEFAULT 'gold',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hero_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT ALL ON public.hero_banners TO service_role;

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero banners"
ON public.hero_banners FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage hero banners"
ON public.hero_banners FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ app_announcements ============
CREATE TABLE public.app_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text,
  category text NOT NULL DEFAULT 'general',
  is_new boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_announcements TO authenticated;
GRANT ALL ON public.app_announcements TO service_role;

ALTER TABLE public.app_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements"
ON public.app_announcements FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage announcements"
ON public.app_announcements FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_app_announcements_updated_at
BEFORE UPDATE ON public.app_announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ three-wallet model ============
ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS mvs_pay_balance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mvs_points_balance numeric NOT NULL DEFAULT 0;

-- Backfill member profiles for existing users
INSERT INTO public.member_profiles (user_id, member_id, full_name)
SELECT p.id,
       'MWW' || LPAD((FLOOR(RANDOM() * 100000000))::bigint::text, 8, '0'),
       p.full_name
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.member_profiles m WHERE m.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;