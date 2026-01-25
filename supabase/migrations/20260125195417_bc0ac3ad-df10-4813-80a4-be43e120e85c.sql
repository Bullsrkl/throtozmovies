-- Fix overly permissive INSERT policy for referrals
DROP POLICY IF EXISTS "System can create referrals" ON public.referrals;

CREATE POLICY "Users can create referrals on signup"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);