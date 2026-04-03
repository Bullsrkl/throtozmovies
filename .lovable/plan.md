

# Plan: Redesign Checkout Page — Payment Popup with QR, Timer & Invoice

## New Flow

**Page layout (top to bottom):**
1. Back button
2. Order Summary card (challenge type, size, discount code field with Apply button)
3. Invoice-style summary showing final amount after discount
4. Payment info card (USDT address, network, amount)
5. **"Buy Now" button** — opens the payment popup

**Payment Popup (Dialog):**
- X close button (top-right, already in Dialog component)
- Payment address with copy button
- QR code generated from the USDT address (using `qrcode` library or a QR API like `https://api.qrserver.com/v1/create-qr-code/`)
- 30-minute countdown timer (MM:SS format, red when < 5 min)
- Transaction ID input field
- Screenshot upload field
- "Done" button to submit

When user clicks Done → same submit logic as current `handleSubmit`, then closes popup and redirects to dashboard.

## Changes

### 1. Install QR dependency or use API
Use `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={address}` — no install needed, just an `<img>` tag.

### 2. Rewrite `Checkout.tsx`

**Top section stays:** Order Summary + Discount code field with Apply button + Invoice summary showing:
- Original price (if discounted, shown with strikethrough)
- Discount amount
- **Amount to Pay** (bold, highlighted)

**Remove:** The current inline payment details form (txn ID, screenshot, submit button)

**Add:** A prominent "Buy Now" button below the invoice

**Add:** A `Dialog` popup triggered by "Buy Now" containing:
- Payment address + copy button
- QR code image (from API using usdtAddress)
- Amount to send reminder
- 30-min countdown timer using `useEffect` + `setInterval`
- Transaction ID input
- Screenshot upload
- "Done" button (calls handleSubmit)

### 3. Timer Logic
```
const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 min in seconds
useEffect interval that decrements every second when popup is open
Display as MM:SS
When reaches 0, auto-close popup with toast "Payment session expired"
```

## Technical Details
- Uses existing `Dialog` component from `src/components/ui/dialog.tsx`
- QR generated via free API: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encodedAddress}`
- No new dependencies needed
- Timer resets each time popup opens
- Submit logic unchanged — same Supabase insert + storage upload

