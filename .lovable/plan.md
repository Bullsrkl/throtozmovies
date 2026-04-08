

# Plan: $10 Instant Funded Account + Homepage Highlight Banner

## Summary

Add a new "$10 Instant Funded" plan with custom rules (3% daily DD, 6% max DD, 3 min days, 80% profit split) across the entire system — database, Buy Challenge page, Rules page, Checkout, and homepage. Plus add a highlight banner above the hero section promoting this plan.

## Changes

### 1. Database: Insert New Challenge Plan
**Migration** — Insert a new row into `challenge_plans`:
- account_size: 5000, challenge_type: `instant`, price_usd: 10
- daily_drawdown_limit: 3, overall_drawdown_limit: 6
- profit_target_phase1: 0, profit_target_phase2: 0
- min_trading_days: 3

### 2. Buy Challenge Page (`src/pages/BuyChallenge.tsx`)
- Add `instant_10` as a new challenge type option (4th tab: "$10 Instant")
- When selected, lock account size to $5K, price to $10
- Show custom rules: 3% daily DD, 6% max DD, 3 min days, 80% profit split, 30% consistency
- Features list shows "Profit Split up to 80%" instead of 90%
- Tag: "Low Cost Entry" badge on the card

### 3. Checkout Page (`src/pages/Checkout.tsx`)
- Handle `type=instant_10` — hardcode price $10, size $5000
- Everything else (payment flow, modal) stays the same

### 4. Rules Page (`src/pages/Rules.tsx`)
- Add a 4th tab or a dedicated section for "$10 Instant Funded Account Rules"
- Display all detailed rules: 3% daily DD, 6% max DD, 3 min days, profit split 70% initial up to 80%, withdrawal $50 min, first after 7 days then every 7 days
- Include full 30% consistency rule explanation (already exists for instant, reuse)

### 5. Funding Models Card (`src/components/HeroBanner.tsx` — FundingModels section)
- Add a 4th card for "$10 Instant Funded" with "Low Cost Entry" tag
- Description: "Start with just $10. Get a $5,000 funded account instantly."

### 6. Homepage Highlight Banner (`src/pages/Index.tsx`)
- Add a slim, eye-catching banner **above** the HeroBanner
- Teal gradient background, text: "NEW: Get a $5,000 Funded Account for just $10 →"
- Clickable, navigates to `/buy-challenge` with instant_10 preselected
- Subtle shimmer animation

### 7. Dashboard Display
- No changes needed — existing Trading Accounts, Wallet, and drawdown display already work with any `challenge_plans` entry. The new plan's drawdown limits (3%/6%) will auto-display via the existing joins.

## Files Modified/Created

1. **Database migration** — Insert `$10 instant` plan into `challenge_plans`
2. `src/pages/BuyChallenge.tsx` — Add instant_10 type, custom rules display
3. `src/pages/Checkout.tsx` — Handle instant_10 pricing
4. `src/pages/Rules.tsx` — Add $10 instant rules section
5. `src/components/HeroBanner.tsx` — Add 4th funding model card
6. `src/pages/Index.tsx` — Add highlight banner above hero

## Technical Details
- The $10 plan uses `challenge_type: instant` in the DB but is distinguished by its unique `account_size: 5000` + `price_usd: 10` combination
- Alternatively, we can add a new enum value `instant_10` to `challenge_type` — this keeps it cleanly separated. This requires an ALTER TYPE migration.
- Risk engine logic (daily DD tracking, breach) is admin-side/manual currently — no code changes needed, the rules are stored in `challenge_plans` and displayed in dashboard
- The highlight banner uses `position: sticky` or just renders as a div above the hero

