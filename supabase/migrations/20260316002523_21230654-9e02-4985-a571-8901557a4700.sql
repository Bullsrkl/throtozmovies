
-- Change trading_accounts platform default to MetaTrader 5
ALTER TABLE public.trading_accounts ALTER COLUMN platform SET DEFAULT 'MetaTrader 5';

-- Add referred_by column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

-- Update handle_new_user trigger to process referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referral_code text;
  v_referrer_id uuid;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  -- Check if admin email
  IF NEW.email = 'tilaks631@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Process referral code if provided
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_referral_code;
    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.id THEN
      UPDATE public.profiles SET referred_by = v_referrer_id WHERE id = NEW.id;
      INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status)
      VALUES (v_referrer_id, NEW.id, v_referral_code, 'pending');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
