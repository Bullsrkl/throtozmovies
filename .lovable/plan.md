

# Plan: $10 Instant Account — Strict Profit Limits + Tuesday-Only Withdrawal

## Summary

Add three new rules specific to the $10 instant account:
1. **Daily Profit Limit: 3%** (same as daily DD) — breached if exceeded
2. **Maximum Profit Limit: 6%** (same as overall DD) — breached if exceeded  
3. **Withdrawal: Only on Tuesdays, max $50/week**

## Changes

### 1. Rules Page (`src/pages/Rules.tsx`)
Update the `instant_10` rules section to include:
- **Daily Profit Limit:** 3% — if profit in a single day exceeds 3% of account size ($150), account is breached
- **Maximum Profit Cap:** 6% — if total profit exceeds 6% of account size ($300), account is breached
- **Withdrawal Day:** Only Tuesday (system blocks requests on other days)
- **Max Withdrawal:** $50 per week
- Clear breach warnings with examples

### 2. Buy Challenge Page (`src/pages/BuyChallenge.tsx`)
- Update `RULES.instant_10` to add `profitLimit: "3% daily / 6% max"` 
- Show profit limit rule in the features list for $10 Instant cards
- Add "Tuesday Only" withdrawal note

### 3. Wallet Page (`src/components/dashboard/Wallet.tsx`)
- Detect if selected account is a $10 instant account (challenge_type === "instant" && account_size === 5000 && price === 10, or simpler: check account_size === 5000 from challenge_plans)
- For $10 accounts:
  - Set `MIN_WITHDRAWAL = 50` and `MAX_WITHDRAWAL = 50`
  - Check if today is Tuesday (`new Date().getDay() === 2`) — if not, disable withdrawal button with message "Withdrawals only available on Tuesdays"
  - Check if user already withdrew this week (query `withdrawals` table for last 7 days)
  - Show these restrictions in the UI with warning badges

### 4. Funding Models on Homepage (`src/components/HeroBanner.tsx`)
- Update $10 Instant card description to mention profit limits and Tuesday withdrawal

## Files Modified

1. `src/pages/Rules.tsx` — Add profit limit rules + Tuesday withdrawal to $10 section
2. `src/pages/BuyChallenge.tsx` — Update rules display for instant_10
3. `src/components/dashboard/Wallet.tsx` — Enforce Tuesday-only, $50 max, weekly limit
4. `src/components/HeroBanner.tsx` — Update funding model card text

## Technical Details
- Profit limit enforcement (3% daily, 6% max) is admin-side — the platform displays the rules, admin monitors and breaches accounts. No automated breach logic needed in frontend.
- Tuesday check: `new Date().getDay() === 2` (0=Sun, 2=Tue)
- Weekly withdrawal check: query `withdrawals` where `requested_at > now() - 7 days` and `user_id` matches
- Need to fetch `price_usd` in addition to `account_size` in Wallet's purchase join to identify $10 accounts

