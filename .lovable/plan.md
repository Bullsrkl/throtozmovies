

# Plan: Hero Banner "Keep 90% Profit Split" + New Pg Logo

## Changes

### 1. Hero Banner — Add "Keep 90% Profit Split" on Right Side
**File:** `src/components/HeroBanner.tsx`

Replace the `TraderIllustration` SVG with a clean typographic display inside the creamy card (right side of the grid):

- **"Keep"** — large teal text (`text-5xl md:text-7xl font-extrabold text-primary`)
- **"90%"** — massive bold black text (`text-7xl md:text-9xl font-black text-foreground`)
- **"profit Split"** — inside a teal arrow/ribbon label (like the reference image: a teal badge with right-pointing arrow shape, white bold text)
- All inside the same creamy card banner, right column
- On mobile, this stacks below the left text column

### 2. Logo Redesign — "Pg" Monogram Label
**File:** `src/components/Header.tsx` + footer in `src/pages/Index.tsx`

Replace the current dumbbell SVG logo with:

- A **rounded square** (like an app icon, ~36x36px) with cream background, subtle teal border, soft shadow
- Inside: **"Pg"** monogram — "P" uppercase teal, "g" lowercase teal, modern sans-serif font
- Subtle teal glow around the square (matching reference image)
- Next to it: **"Prop"** in dark foreground + **"Gym"** in teal/primary color
- Remove the pill/badge wrapper — use the square icon + text directly
- Same treatment in the footer

### 3. Remove TraderIllustration Component
- Delete the entire `TraderIllustration()` function (lines 6-131)
- Replace with the "Keep 90% Profit Split" typographic block

## Files Modified

1. `src/components/HeroBanner.tsx` — Remove SVG illustration, add "Keep 90% Profit Split" typography
2. `src/components/Header.tsx` — New Pg monogram logo
3. `src/pages/Index.tsx` — Update footer logo to match

## Technical Details
- The teal ribbon/arrow for "profit Split" uses CSS `clip-path` or a simple div with a CSS triangle pseudo-element on the right
- Logo icon is pure CSS/HTML (rounded div with text), no external image needed
- The "90%" text uses `font-black` (weight 900) for maximum impact
- Mobile responsive: right column stacks below on `< lg` breakpoints

