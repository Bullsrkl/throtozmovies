

# Plan: Complete Overhaul — Theme, Rules Page, Wallet Redesign, Admin Sidebar, Reports

## Summary of All Changes

### 1. Theme: Darker Creamy Background + Gradient Cards
**Files:** `src/index.css`, `tailwind.config.ts`
- Darken background from `35 40% 96%` to `30 25% 88%` (warm mocha cream)
- Keep cards lighter `35 35% 94%` for contrast against darker bg
- Add soft gradient backgrounds to cards: `bg-gradient-to-br from-card to-primary/3`
- Add hero banner floating animations (CSS keyframes: float-up-down, shimmer)
- Cards get subtle gradient borders visible on hover

### 2. Separate Rules Page + 30% Consistency Rule
**Files:** New `src/pages/Rules.tsx`, `src/App.tsx`, `src/components/Header.tsx`, `src/components/HeroBanner.tsx`

- Create `/rules` route with dedicated Rules page
- Move `PlatformRules` content to this new page and expand it
- Add **30% Consistency Rule** section under Instant accounts with full explanation:
  - Formula, examples (violation + valid case), adjustment example
  - Clarify it applies only at withdrawal time, not account breach
- Add detailed rules per account type: profit targets, drawdown, min days, payout eligibility, estimated balance maintenance
- Add "Rules" link to hamburger menu (mobile) and desktop nav
- Hero banner "Rules" button navigates to `/rules` instead of scrolling
- On Index page, keep a brief rules preview with "View All Rules" link

### 3. Hero Banner Animations
**File:** `src/components/HeroBanner.tsx`, `src/index.css`
- Add floating animation to the dashboard preview card (right side)
- Add shimmer/pulse effect on the "Get Funded" button
- Subtle particle-like floating dots in background using CSS pseudo-elements

### 4. Buy Challenge Cards — Gradient Colors
**File:** `src/pages/BuyChallenge.tsx`
- Add soft gradient backgrounds to the main feature card and size pills
- Each challenge type gets a subtle unique gradient: 2-Step (teal-blue), 1-Step (teal-green), Instant (amber-teal)
- Add `cream-hover` effects with gradient border glow

### 5. Wallet Complete Redesign
**File:** `src/components/dashboard/Wallet.tsx`

**Account Dropdown (top):**
- Add dropdown selector above balance cards to pick which active trading account's wallet to view
- Fetch user's active `trading_accounts` with join to `challenge_plans` for size/type
- Show balance for selected account

**Eligible Withdrawal Amount:**
- Show "Eligible for Withdrawal" amount (balance above initial account size = profit)
- Add a progress bar showing how close user is to withdrawal criteria

**Withdrawal Form Updates:**
- Add more networks: BEP20, ERC20, TRC20, Polygon, Arbitrum, Solana
- After filling amount/address/network and clicking Payout, show **confirmation popup (Dialog):**
  - Amount, platform fee (if any), net amount, destination address, network, date/time, transaction reference ID
  - "Confirm" and "Cancel" buttons

**Left-side Withdrawal History Tab:**
- Split wallet into two-column layout: left = withdrawal history list, right = main content
- On mobile: tabs (Wallet | History)
- Each history item clickable → shows detail view with transaction ID, status icon (pending=clock, paid=checkmark, rejected=x), dates
- **Report button** on each rejected/disputed entry: opens text area for user to write queries → saved to new `withdrawal_reports` table

### 6. Database Migration
- Create `withdrawal_reports` table:
  - `id` uuid PK, `withdrawal_id` uuid, `user_id` uuid, `message` text, `status` text default 'open', `admin_response` text nullable, `created_at` timestamptz, `resolved_at` timestamptz nullable
- RLS: users can SELECT/INSERT own reports, admin can ALL
- Add more network options — no schema change needed (network is text field)

### 7. Admin Panel — Sidebar Layout + Reports Tab
**File:** `src/pages/Admin.tsx`

- Replace top tabs with a **left sidebar** (hamburger-collapsible on mobile)
- Sidebar items: Dashboard Stats, Payments Review, Withdrawals, Users, Reports, System Settings
- Withdrawals tab: add copy button for USDT address, show Paid/Reject buttons
- **New Reports tab:** 
  - Show all `withdrawal_reports` with user info, withdrawal details, message
  - Admin can write response and mark as "Resolved"
  - Show report count, withdrawal transaction details

### 8. Header — Rules Link in Mobile Menu
**File:** `src/components/Header.tsx`
- Add "Rules" link in both desktop nav and mobile hamburger menu
- Position after "Buy Challenge"

## Technical Details

- Rules page is a new route `/rules` — no auth required (public)
- Wallet account dropdown queries `trading_accounts` WHERE `user_id` AND `status` IN ('active', 'funded') with join to `challenge_plans`
- Withdrawal confirmation popup uses existing `Dialog` component
- `withdrawal_reports` table needs RLS policies for user insert/select and admin all
- Admin sidebar uses simple state toggle, not the shadcn Sidebar component (to keep admin self-contained)
- Hero animations use CSS-only `@keyframes` — no JS
- Background darkness is achieved via CSS variable change only — all components inherit automatically

## Files Modified/Created

1. `src/index.css` — darker bg, gradient card styles, hero animations
2. `tailwind.config.ts` — new animation keyframes
3. `src/pages/Rules.tsx` — **NEW** dedicated rules page with 30% consistency rule
4. `src/App.tsx` — add `/rules` route
5. `src/components/Header.tsx` — Rules link in nav + mobile menu
6. `src/components/HeroBanner.tsx` — animations, Rules button → navigate to /rules, trim inline rules section
7. `src/pages/BuyChallenge.tsx` — gradient cards per challenge type
8. `src/components/dashboard/Wallet.tsx` — full redesign with account dropdown, eligibility bar, confirmation popup, history tab, report feature
9. `src/pages/Admin.tsx` — sidebar layout, reports tab, copy USDT address
10. Database migration — `withdrawal_reports` table + RLS

