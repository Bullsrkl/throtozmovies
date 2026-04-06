

# Plan: Admin Hamburger Fix, History Tab Move, Hero Text + Illustration, Mobile Polish

## Changes

### 1. Admin Panel — Hamburger Toggle Like Dashboard
**File:** `src/pages/Admin.tsx`
- Replace the floating bottom-left FAB menu button with a proper hamburger toggle button at the top of the admin panel (like DashboardSidebar's ChevronLeft/ChevronRight pattern)
- Add a visible toggle button in the sidebar header that shows Menu/X icon
- On mobile, show a hamburger icon in the main content area header that opens/closes the sidebar
- Add "History" tab to SIDEBAR_ITEMS — shows all user transactions (purchases, withdrawals) with user info, dates, amounts, status

### 2. Move Transaction History from Wallet to Dashboard Sidebar
**File:** `src/components/dashboard/Wallet.tsx`
- Remove the "history" tab and related UI from Wallet component
- Keep only the wallet functionality (balance, withdrawal form, confirmation popup)

**File:** `src/components/DashboardSidebar.tsx`
- Add "History" menu item with Clock icon, path: `/dashboard/history`

**File:** `src/pages/Dashboard.tsx`
- Add "History" to mobileMenuItems
- Add route for `/dashboard/history` rendering a new `History` component

**New File:** `src/components/dashboard/History.tsx`
- Move withdrawal history UI from Wallet here
- Show all withdrawals with status icons (pending=Clock, paid=CheckCircle, rejected=XCircle)
- Click to view details + report feature (same as was in Wallet)

### 3. Admin History Tab
**File:** `src/pages/Admin.tsx`
- Add `{ key: "history", label: "History", icon: Clock }` to SIDEBAR_ITEMS
- History tab shows ALL user transactions across the platform:
  - Challenge purchases (with user email, plan details, status, date)
  - Withdrawals (with user email, amount, address, status, date)
- Searchable/filterable by user email

### 4. Hero Banner Text + Vector Illustration
**File:** `src/components/HeroBanner.tsx`

**Text change:**
- Replace "Trade With / Discipline. / Get Funded." with:
  - "Start Trading Without" 
  - "Your Own Money."  (gradient text)
  - "Get Funded Today."
- Increase font-weight by ~10% (add `font-extrabold` or use `font-[800]`)

**Right side — SVG Vector Illustration:**
- Replace the floating dashboard preview card with a custom inline SVG illustration
- Young trader at laptop with happy expression
- Laptop screen showing rising profit graph (animated SVG path)
- Floating UI cards (balance, profit, win rate) around the character
- Floating coin icons with gentle bob animation
- Subtle glow particles
- Color palette matches platform theme: teal primary, cream backgrounds, warm accents
- Animations: CSS keyframes for floating motion, graph line drawing upward (`stroke-dashoffset` animation), subtle pulse glow
- Show on both desktop AND mobile (scaled down on mobile)

### 5. Mobile View Polish
- **All pages**: Ensure proper padding, no horizontal overflow
- **Hero banner**: Stack text left, illustration below on mobile (single column)
- **Dashboard**: Mobile horizontal scroll nav already exists — verify History is added
- **Admin**: Hamburger menu works like dashboard sidebar on mobile
- **Buy Challenge**: Cards stack vertically, size pills wrap properly
- **Wallet**: Single column layout on mobile without history tab

## Files Modified/Created

1. `src/pages/Admin.tsx` — Hamburger toggle fix, History tab
2. `src/components/dashboard/Wallet.tsx` — Remove history tab
3. `src/components/DashboardSidebar.tsx` — Add History menu item
4. `src/pages/Dashboard.tsx` — Add History route + mobile menu item
5. `src/components/dashboard/History.tsx` — **NEW** withdrawal history component
6. `src/components/HeroBanner.tsx` — New text, SVG illustration with animations

## Technical Details
- SVG illustration is inline (not an external image) for theme color matching and CSS animation control
- Graph line animation uses `stroke-dasharray` + `stroke-dashoffset` CSS animation
- Floating elements use existing `animate-float` keyframe with staggered `animation-delay`
- Admin history fetches from both `challenge_purchases` and `withdrawals` tables with profile joins
- No database changes needed

