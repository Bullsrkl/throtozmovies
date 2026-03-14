

# Plan: Fix Payment/Checkout Flow

Currently, clicking "Buy Challenge" navigates to `/checkout` which doesn't exist. Need to build the full USDT payment flow as originally specified.

## Changes

### 1. Create Checkout Page (`src/pages/Checkout.tsx`)
A new page that receives `size` and `type` from URL params and shows:
- **Order summary** card (account size, challenge type, price)
- **USDT deposit address** (`0xe00f8c174fdbf8b0a0ff5688e650422f805b6c9c`) fetched from `platform_settings`
- **Network**: BEP20
- **Copy button** for address
- **Optional discount code** input field
- **Transaction ID** text input (required)
- **Payment screenshot** file upload (to `payment-screenshots` bucket)
- **Submit Payment** button

Flow: Finds matching `challenge_plans` row by size+type, creates a `challenge_purchases` record with status `payment_submitted`, uploads screenshot, and shows success confirmation.

### 2. Add Route in `App.tsx`
Add `/checkout` route pointing to the new Checkout page.

### 3. Update `BuyChallenge.tsx`
The existing code already navigates to `/checkout?size=X&type=Y` — no changes needed here.

### 4. Add RLS Policy for `challenge_purchases`
Users need UPDATE permission on their own purchases to submit transaction details. Current policies only allow INSERT and SELECT. Add an UPDATE policy for users to update their own pending purchases.

### Technical Details
- Screenshot upload uses existing `payment-screenshots` storage bucket
- USDT address fetched dynamically from `platform_settings` table (key: `usdt_deposit_address`)
- Input validation: Transaction ID required, screenshot required, max file size 20MB
- After submission, redirect to dashboard with success toast
- Mobile-first responsive design matching the dark fintech theme

