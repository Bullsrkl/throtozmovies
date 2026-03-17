

# Analysis: Issues Found & Fixes Needed

After reviewing the entire codebase, here are the problems found — from critical logic breaks to cleanup items:

## Critical Logic Breaks

### 1. Google OAuth Referral Code Never Processed
In `Auth.tsx`, the referral code is saved to `localStorage` as `pending_referral_code` before Google OAuth redirect, but **it is never read back** after the redirect completes. The Google OAuth `signUp` call doesn't pass `referral_code` in `user_metadata` (unlike email signup). So referrals via Google signup are completely lost.

**Fix:** In `useAuth.tsx` or `Auth.tsx`, after detecting a new Google OAuth session, read `pending_referral_code` from localStorage and update the user's profile `referred_by` + insert into `referrals` table.

### 2. Discount Validation Counts Rejected Purchases
In `Checkout.tsx`, the discount check does:
```typescript
.select("*", { count: "exact", head: true })
.eq("user_id", user.id)
```
This counts ALL purchases including `rejected` ones. So if a user's first purchase was rejected, they can never use a discount code again.

**Fix:** Add `.not("status", "eq", "rejected")` to exclude rejected purchases.

### 3. Mobile Dashboard Has No Navigation
The `DashboardSidebar` is `hidden md:block` — on mobile there's zero way to navigate between dashboard sections (Accounts, Wallet, Referral, Settings, etc.). The Header mobile menu has some links but misses "Refer & Earn".

**Fix:** Add a mobile bottom navigation bar or a horizontal scrollable tab bar at the top of the dashboard for mobile users. Also add "Refer & Earn" to the Header mobile menu.

## Minor Logic Issues

### 4. Wallet.tsx Sends Legacy `upi_id: "N/A"`
The withdrawal insert still sends `upi_id: "N/A"` — a leftover from the old INR/UPI system. Not harmful but unnecessary.

**Fix:** Remove `upi_id` from the insert.

### 5. Admin Panel Doesn't Show Discount Info
When admin reviews a payment, they see `challenge_plans.price_usd` as the amount but not the actual discounted price the user paid. The `discount_code` field exists on the purchase but isn't displayed.

**Fix:** Show discount code and actual paid amount in the admin payments table.

### 6. Legacy Database Artifacts
These old tables/functions still exist in the database and should be cleaned up:
- Tables: `movies`, `episodes`, `download_logs`, `promotion_requests`, `subscription_plans`, `subscriptions`
- Functions: `credit_referral_bonus` (uses ₹ currency and old bonus logic)
- Profile columns: `youtube_bonus_claimed`, `primary_upi_id`, `secondary_upi_id`, `default_language`, `default_category`
- Storage bucket: `movie-posters`

**Fix:** Migration to drop legacy tables and columns (can be done later, not blocking).

## Implementation Plan

### Step 1: Fix Google OAuth Referral Processing
- In `Auth.tsx`, add a `useEffect` that runs when `user` becomes available
- Check localStorage for `pending_referral_code`
- If found, look up referrer, update `profiles.referred_by`, insert into `referrals`, then clear localStorage

### Step 2: Fix Discount Validation Query
- In `Checkout.tsx` line 134-137, add `.not("status", "eq", "rejected")` filter

### Step 3: Add Mobile Dashboard Navigation
- Add a horizontal scrollable nav bar at the top of `Dashboard.tsx` main content area (visible only on mobile)
- Add "Refer & Earn" link to `Header.tsx` mobile menu

### Step 4: Minor Fixes
- Remove `upi_id: "N/A"` from `Wallet.tsx` withdrawal insert
- Add discount code column to Admin payments table

