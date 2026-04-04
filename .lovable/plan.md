

# Plan: Creamy Theme + Rules Section + Hero Redesign + Logo Branding

## Overview

Transform the entire app from dark fintech theme to a **creamy/warm** palette. Add platform rules section on the home page, redesign the hero banner with a creamy card, and make the "Prop Gym" logo professional and dynamic.

## Changes

### 1. Creamy Theme Overhaul (`src/index.css`)

Replace the dark HSL palette with a warm cream-based palette:

```text
Background:     35 40% 96%   (warm cream white)
Card:           35 30% 92%   (soft cream card)
Foreground:     30 20% 15%   (dark brown text)
Primary:        168 80% 38%  (teal — kept but slightly deeper for cream contrast)
Primary-light:  168 65% 48%
Border:         35 20% 85%   (warm beige border)
Muted:          35 15% 88%   (light cream muted)
Muted-fg:       30 10% 45%   (warm gray text)
Secondary:      35 20% 90%
Accent:         35 25% 88%
Shadows:        warm-toned rgba(139, 119, 91, 0.08) instead of black
Glass-bg:       rgba(255, 248, 235, 0.85) (creamy glass)
```

Add CSS utility classes for cream touch/click effects:
- `.cream-ripple` — on click/touch, a soft cream-colored radial ripple animation
- `.cream-hover` — on hover, card lifts with warm shadow and slight cream glow

### 2. Cream Touch/Click Effects (`src/index.css` + `tailwind.config.ts`)

Add new keyframes in tailwind config:
- `cream-ripple` — scale + fade radial animation
- `cream-slide` — smooth slide with cream trail effect
- `cream-glow` — subtle warm glow pulse

Add a global CSS class using `::after` pseudo-element for interactive cream ripple on cards and buttons.

### 3. Hero Banner Redesign (`src/components/HeroBanner.tsx`)

- Wrap the hero text inside a **creamy frosted-glass card** with warm border, rounded corners, subtle shadow
- Background gradients changed from teal/dark to warm cream tones with teal accents
- The text stays inside this creamy card banner
- "View Plans" button renamed to **"Rules"**
- On click, scrolls to the new rules section (id: `rules-section`)

### 4. Platform Rules Section — New Export in `HeroBanner.tsx`

Create a new `PlatformRules` component with comprehensive rules fetched from `challenge_plans` table:

- **Section heading**: "Platform Rules & Guidelines"
- **Tabs or accordion** by challenge type (1-Step, 2-Step, Instant)
- For each type, a table/grid showing:
  - Account sizes available
  - Profit Target Phase 1 & Phase 2
  - Daily Drawdown Limit
  - Overall Drawdown Limit
  - Minimum Trading Days
  - Price
- **General Rules section** below with static content:
  - Payout rules: "First payout after 14 calendar days, then on-demand every 7 days"
  - Payout split: "Up to 90% profit split"
  - Platform: "MetaTrader 5"
  - Restrictions: "No martingale, no HFT, no copy trading between accounts"
  - Scaling: "Account scaling available after 3 consecutive profitable months"
  - Refund policy: "No refunds after evaluation begins"

Add `<PlatformRules />` to `Index.tsx` between Features and HowItWorks (or replacing HowItWorks position).

### 5. Logo Redesign (`src/components/Header.tsx` + footer)

- "Prop Gym" text in a **branded label/badge**: a rounded pill/tag with creamy background, teal border, bold Space Grotesk font
- Add a small inline SVG icon (dumbbell/chart hybrid) before the text
- Make it larger (`text-2xl` -> `text-3xl`), bolder, with a subtle shadow
- Same treatment in footer

### 6. Update All Cards & Interactive Elements

Apply `cream-hover` class to all cards in:
- `HeroBanner.tsx` (FundingModels cards, Features cards)
- `BuyChallenge.tsx` (plan selection cards)
- Dashboard cards

Apply `cream-ripple` class to buttons globally via `button.tsx` base styles.

### 7. Slider Animations

In `src/components/ui/slider.tsx`, add cream-themed track/thumb styling:
- Track: cream gradient background
- Thumb: teal with cream glow on drag
- Range fill: teal-to-cream gradient animation

In `BuyChallenge.tsx` size selector pills, add smooth slide transition animation when switching sizes.

## Files Modified

1. `src/index.css` — Full palette swap + cream utility classes
2. `tailwind.config.ts` — New keyframes (cream-ripple, cream-slide, cream-glow)
3. `src/components/HeroBanner.tsx` — Hero card banner, rename button to "Rules", new `PlatformRules` component
4. `src/pages/Index.tsx` — Add `PlatformRules` section
5. `src/components/Header.tsx` — Branded logo label with icon
6. `src/components/ui/slider.tsx` — Cream-themed slider styling
7. `src/components/ui/button.tsx` — Add ripple effect class
8. `src/components/ui/card.tsx` — Add cream-hover class by default

## Technical Details

- Rules data fetched from `challenge_plans` table via Supabase query, grouped by `challenge_type`
- All color changes are in CSS variables only — no component-level color hardcoding needed (except gradient classes which reference primary)
- Ripple effect uses CSS `::after` with `@keyframes` — no JS needed
- The cream theme maintains sufficient contrast ratios (WCAG AA) with dark brown text on cream backgrounds

