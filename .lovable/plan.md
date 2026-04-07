

# Plan: Replace Text Logo with Uploaded Pg Image

## What
Copy the uploaded `Pg` logo image into the project and replace the current CSS-based "Pg" monogram div with an `<img>` tag everywhere the logo appears.

## Changes

### 1. Copy Image Asset
- Copy `user-uploads://Picsart_26-04-07_23-50-16-764.png` → `src/assets/pg-logo.png`

### 2. Update Header Logo (`src/components/Header.tsx`)
- Import `pgLogo from "@/assets/pg-logo.png"`
- Replace the `<div className="w-9 h-9 rounded-lg..."><span>Pg</span></div>` with `<img src={pgLogo} alt="Pg" className="w-9 h-9 rounded-lg object-contain" />`

### 3. Update Footer Logo (`src/pages/Index.tsx`)
- Same import and replacement in the footer section

## Files Modified
1. `src/assets/pg-logo.png` — **NEW** (copied from upload)
2. `src/components/Header.tsx` — Use image instead of text div
3. `src/pages/Index.tsx` — Use image instead of text div

