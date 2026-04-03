

# Plan: Pending Purchases in Trading Accounts + Buy Challenge UI Redesign + Remove QR from Popup

## 3 Changes

### 1. Show Pending Purchases in Trading Accounts Page
Currently, after a user submits payment, they go to dashboard but see nothing until admin creates the trading account. We need to show pending/submitted purchases as cards at the top of the Trading Accounts list.

**In `TradingAccounts.tsx`:**
- Fetch `challenge_purchases` where status is `pending_payment` or `payment_submitted`, joined with `challenge_plans` for size/type info
- Show these as separate cards above the active accounts list, with a pulsing status badge ("Payment Submitted — Under Review" / "Pending Payment")
- Each card shows: challenge type, account size, submission date, status
- Use realtime subscription on `challenge_purchases` table so status updates appear live without refresh

### 2. Redesign Buy Challenge Page (`BuyChallenge.tsx`)
Replace the current grid-of-cards layout with a more interactive design:
- **Horizontal slider/selector** for account sizes at the top (pill buttons showing $5K, $10K, $30K, etc.)
- **Single large feature card** in the center showing the selected size's details, price, and features
- **Challenge type toggle** (2-Step / 1-Step / Instant) as tabs above the feature card
- Glassmorphic card with gradient border for the selected plan
- Prominent price display with "Buy Challenge" CTA button
- Comparison table below showing all rules (profit target, drawdown, min days) for the selected type

### 3. Remove QR Code from Payment Popup, Enlarge USDT Address
**In `Checkout.tsx` popup:**
- Remove the QR code image and the "Scan to get the deposit address" text (lines 333-344)
- Make the USDT address prominently large: bigger font size (`text-base` or `text-sm` instead of `text-xs`), styled in a highlighted box with primary border
- Keep the copy button next to it
- Remove the `QrCode` import from lucide

## Technical Details
- Pending purchases query: `supabase.from("challenge_purchases").select("*, challenge_plans!inner(*)").eq("user_id", user.id).in("status", ["pending_payment", "payment_submitted"])`
- Realtime: subscribe to `postgres_changes` on `challenge_purchases` filtered by user_id
- No database changes needed — all data already exists
- BuyChallenge redesign is purely UI — same navigation logic and pricing functions

