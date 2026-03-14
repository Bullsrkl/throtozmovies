CREATE POLICY "Users can update own pending purchases"
ON public.challenge_purchases
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending_payment')
WITH CHECK (auth.uid() = user_id);