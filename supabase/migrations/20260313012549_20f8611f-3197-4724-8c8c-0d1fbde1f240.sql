
-- Create enums for prop firm
CREATE TYPE public.challenge_type AS ENUM ('instant', 'one_step', 'two_step');
CREATE TYPE public.purchase_status AS ENUM ('pending_payment', 'payment_submitted', 'approved', 'rejected');
CREATE TYPE public.account_phase AS ENUM ('phase1', 'phase2', 'master');
CREATE TYPE public.account_status AS ENUM ('active', 'passed', 'failed', 'funded');

-- Challenge plans table
CREATE TABLE public.challenge_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_size integer NOT NULL,
  challenge_type challenge_type NOT NULL,
  price_usd numeric NOT NULL,
  profit_target_phase1 numeric NOT NULL DEFAULT 8,
  profit_target_phase2 numeric NOT NULL DEFAULT 5,
  daily_drawdown_limit numeric NOT NULL DEFAULT 5,
  overall_drawdown_limit numeric NOT NULL DEFAULT 10,
  min_trading_days integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans viewable by everyone" ON public.challenge_plans FOR SELECT USING (true);
CREATE POLICY "Admin can manage plans" ON public.challenge_plans FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed challenge plans (two_step base prices)
INSERT INTO public.challenge_plans (account_size, challenge_type, price_usd, profit_target_phase1, profit_target_phase2, daily_drawdown_limit, overall_drawdown_limit, min_trading_days) VALUES
(5000, 'two_step', 28, 8, 5, 5, 10, 5),
(10000, 'two_step', 49, 8, 5, 5, 10, 5),
(30000, 'two_step', 90, 8, 5, 5, 10, 5),
(50000, 'two_step', 169, 8, 5, 5, 10, 5),
(100000, 'two_step', 210, 8, 5, 5, 10, 5),
(500000, 'two_step', 350, 8, 5, 5, 10, 5),
(5000, 'one_step', 30.8, 10, 0, 5, 10, 5),
(10000, 'one_step', 53.9, 10, 0, 5, 10, 5),
(30000, 'one_step', 99, 10, 0, 5, 10, 5),
(50000, 'one_step', 185.9, 10, 0, 5, 10, 5),
(100000, 'one_step', 231, 10, 0, 5, 10, 5),
(500000, 'one_step', 385, 10, 0, 5, 10, 5),
(5000, 'instant', 33.6, 0, 0, 5, 10, 0),
(10000, 'instant', 58.8, 0, 0, 5, 10, 0),
(30000, 'instant', 108, 0, 0, 5, 10, 0),
(50000, 'instant', 202.8, 0, 0, 5, 10, 0),
(100000, 'instant', 252, 0, 0, 5, 10, 0),
(500000, 'instant', 420, 0, 0, 5, 10, 0);

-- Challenge purchases table
CREATE TABLE public.challenge_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.challenge_plans(id),
  status purchase_status NOT NULL DEFAULT 'pending_payment',
  transaction_id text,
  payment_screenshot_url text,
  discount_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.challenge_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create purchases" ON public.challenge_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage purchases" ON public.challenge_purchases FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Trading accounts table
CREATE TABLE public.trading_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purchase_id uuid NOT NULL REFERENCES public.challenge_purchases(id),
  account_number text NOT NULL,
  password text NOT NULL,
  server text NOT NULL DEFAULT 'PropGym-Live',
  platform text NOT NULL DEFAULT 'Match Trader',
  phase account_phase NOT NULL DEFAULT 'phase1',
  balance numeric NOT NULL DEFAULT 0,
  profit_percent numeric NOT NULL DEFAULT 0,
  daily_drawdown numeric NOT NULL DEFAULT 0,
  overall_drawdown numeric NOT NULL DEFAULT 0,
  trading_days integer NOT NULL DEFAULT 0,
  profit_target numeric NOT NULL DEFAULT 8,
  status account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.trading_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage accounts" ON public.trading_accounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id),
  certificate_type text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage certificates" ON public.certificates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add USDT fields to withdrawals
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS usdt_address text;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS network text DEFAULT 'BEP20';
ALTER TABLE public.withdrawals ALTER COLUMN upi_id DROP NOT NULL;

-- Insert USDT deposit address into platform_settings
INSERT INTO public.platform_settings (key, value) VALUES ('usdt_deposit_address', '0xe00f8c174fdbf8b0a0ff5688e650422f805b6c9c') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true) ON CONFLICT (id) DO NOTHING;
