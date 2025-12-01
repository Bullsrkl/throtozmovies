-- Add youtube_bonus_claimed to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_bonus_claimed boolean DEFAULT false;

-- Add promotion_price and payment_method columns to promotion_requests table
ALTER TABLE promotion_requests ADD COLUMN IF NOT EXISTS promotion_price numeric DEFAULT 0;
ALTER TABLE promotion_requests ADD COLUMN IF NOT EXISTS payment_method text;

-- Create RPC function to credit wallet bonus
CREATE OR REPLACE FUNCTION credit_wallet_bonus(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE wallets 
  SET balance = balance + p_amount,
      total_earnings = total_earnings + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;