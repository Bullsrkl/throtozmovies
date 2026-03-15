

# Plan: Fix Payment Upload + Add Discount Apply Button + Fix Overview + Cleanup

## Issues Found

1. **Screenshot upload fails**: The `payment-screenshots` storage bucket has ZERO RLS policies. Authenticated users cannot upload files to it. This is the root cause of the submit failure.

2. **Discount code field**: Has no "Apply" button next to it. Need to add an inline Apply button.

3. **Dashboard Overview (`Overview.tsx`)**: Still has old movie-related content — "Creator Dashboard", movie uploads count, downloads count, YouTube subscribe bonus, subscription plan references, ₹ currency. Needs complete rewrite for Prop Gym (show active accounts, wallet balance, recent purchases).

4. **Settings avatar upload**: Uses `payment-screenshots` bucket for avatars — should work once storage policies are fixed, but ideally should use a dedicated bucket or at least the same bucket with proper paths.

## Changes

### 1. Database Migration — Storage RLS Policies for `payment-screenshots`
Add storage policies so authenticated users can upload and view files:
- INSERT policy: authenticated users can upload to `payment-screenshots`
- SELECT policy: anyone can view (bucket is public)
- UPDATE/DELETE: authenticated users on their own files

### 2. Fix Checkout.tsx — Add "Apply" Button for Discount Code
- Add an "Apply" button inline next to the discount code input
- Show visual feedback (green checkmark or "Applied!" text) when applied
- Keep discount code state as-is (already sent with the purchase record)

### 3. Rewrite Overview.tsx for Prop Gym
Replace movie stats with trading-relevant dashboard:
- **Stats cards**: Active Accounts, Wallet Balance, Total Profit, Pending Purchases
- **Recent Accounts**: Show latest trading account status
- **Quick Action**: "Buy Challenge" CTA if no accounts exist
- Remove all movie/YouTube/subscription/₹ references

### 4. Minor Cleanup
- Settings.tsx: Avatar upload bucket reference is fine (payment-screenshots is public), no change needed

## Technical Details
- Storage policies use `storage.objects` table with `bucket_id` filter
- The `payment-screenshots` bucket is already set to public, so SELECT is open, but INSERT needs an authenticated user policy
- Overview will query `trading_accounts`, `wallets`, and `challenge_purchases` tables

