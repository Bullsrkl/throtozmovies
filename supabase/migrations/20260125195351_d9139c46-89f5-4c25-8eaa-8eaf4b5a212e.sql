-- Fix 70% discount for all plans that don't have original_price_inr set
UPDATE subscription_plans SET 
  original_price_inr = price_inr,
  price_inr = ROUND(price_inr * 0.30)
WHERE original_price_inr IS NULL AND plan_code != 'TRIAL';

-- Add referral_code column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate referral codes for existing users
UPDATE profiles 
SET referral_code = 'THR' || UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 6))
WHERE referral_code IS NULL;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  signup_bonus_credited BOOLEAN DEFAULT false,
  subscription_bonus_credited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin can manage referrals"
ON public.referrals FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code = 'THR' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-generate referral code
DROP TRIGGER IF EXISTS set_referral_code ON profiles;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Function to credit referral bonus
CREATE OR REPLACE FUNCTION public.credit_referral_bonus(
  p_referrer_id UUID,
  p_referred_id UUID,
  p_bonus_type TEXT
)
RETURNS void AS $$
BEGIN
  IF p_bonus_type = 'signup' THEN
    -- Credit both users ₹25
    UPDATE wallets SET balance = balance + 25, total_earnings = total_earnings + 25, updated_at = now()
    WHERE user_id = p_referrer_id;
    UPDATE wallets SET balance = balance + 25, total_earnings = total_earnings + 25, updated_at = now()
    WHERE user_id = p_referred_id;
    
    UPDATE referrals SET signup_bonus_credited = true, status = 'signup_bonus'
    WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id;
    
  ELSIF p_bonus_type = 'subscription' THEN
    -- Credit referrer ₹50, referred ₹25
    UPDATE wallets SET balance = balance + 50, total_earnings = total_earnings + 50, updated_at = now()
    WHERE user_id = p_referrer_id;
    UPDATE wallets SET balance = balance + 25, total_earnings = total_earnings + 25, updated_at = now()
    WHERE user_id = p_referred_id;
    
    UPDATE referrals SET subscription_bonus_credited = true, status = 'subscription_bonus'
    WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;