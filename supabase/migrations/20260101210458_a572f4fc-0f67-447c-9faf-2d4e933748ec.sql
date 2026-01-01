-- Add original_price_inr column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN original_price_inr integer;

-- Update original prices and set 70% discounted prices
-- Trial: ₹50 -> ₹15 (70% off)
UPDATE public.subscription_plans 
SET original_price_inr = 50, price_inr = 15 
WHERE plan_code = 'TRIAL' OR is_trial = true;

-- Basic: ₹499 -> ₹150
UPDATE public.subscription_plans 
SET original_price_inr = 499, price_inr = 150 
WHERE plan_code = 'BASIC';

-- Standard: ₹999 -> ₹300
UPDATE public.subscription_plans 
SET original_price_inr = 999, price_inr = 300 
WHERE plan_code = 'STANDARD';

-- Advanced: ₹1499 -> ₹450
UPDATE public.subscription_plans 
SET original_price_inr = 1499, price_inr = 450 
WHERE plan_code = 'ADVANCED';

-- Pro: ₹1999 -> ₹600
UPDATE public.subscription_plans 
SET original_price_inr = 1999, price_inr = 600 
WHERE plan_code = 'PRO';

-- Premium: ₹2499 -> ₹750
UPDATE public.subscription_plans 
SET original_price_inr = 2499, price_inr = 750 
WHERE plan_code = 'PREMIUM';

-- Elite: ₹2999 -> ₹900
UPDATE public.subscription_plans 
SET original_price_inr = 2999, price_inr = 900 
WHERE plan_code = 'ELITE';