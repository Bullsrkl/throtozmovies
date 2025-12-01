-- Fix function search path for credit_wallet_bonus
CREATE OR REPLACE FUNCTION credit_wallet_bonus(p_user_id uuid, p_amount numeric)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE wallets 
  SET balance = balance + p_amount,
      total_earnings = total_earnings + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;