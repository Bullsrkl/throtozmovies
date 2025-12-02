-- Add advanced settings columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS primary_upi_id TEXT,
ADD COLUMN IF NOT EXISTS secondary_upi_id TEXT,
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'Hindi',
ADD COLUMN IF NOT EXISTS default_category TEXT DEFAULT 'Bollywood',
ADD COLUMN IF NOT EXISTS notify_downloads BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_earnings BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_withdrawals BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_subscription BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_promotions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_withdrawal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_withdrawal_threshold NUMERIC DEFAULT 500;