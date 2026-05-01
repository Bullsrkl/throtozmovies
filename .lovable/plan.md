# Plan: King Maker Event — Free $30K Master Account Giveaway

## Summary

Run a special promotional event called **King Maker** where 500 users (chosen randomly by system) who own a $10 Instant account and complete 5 promotional tasks win a free **$30K Master Account** (normally ~$150). The event is fully managed via a dedicated page, hero banner, hamburger menu link, admin event management panel, and auto-issued trading account on win.

---

## 1. Database Schema (new migration)

### New enum value
- Add `king_maker` to `challenge_type` enum (used to mark the $30K King Maker plan)
- Add `king_maker_master` to `account_phase` enum (or reuse `master`)

### New table: `event_settings` (single-row config managed by admin)
- `id` (text, pk, default 'king_maker')
- `event_name` (text, default 'King Maker')
- `banner_title`, `banner_subtitle`, `banner_image_url` (text)
- `instagram_profile_url` (text) — link admin sets for Task 3
- `poster_image_url` (text) — image for Task 5
- `result_announcement_at` (timestamptz) — countdown target
- `total_winners` (int, default 500)
- `winners_announced` (boolean, default false)
- `is_active` (boolean, default true)

### New table: `king_maker_participants`
- `id` (uuid, pk)
- `user_id` (uuid, unique)
- `task1_buy_10_completed` (bool) — auto-detected from `challenge_purchases`
- `task2_instagram_id` (text, nullable) — user-entered IG handle
- `task2_completed` (bool)
- `task3_screenshot_url` (text, nullable)
- `task3_status` (text: `pending` | `under_review` | `approved`)
- `task3_submitted_at` (timestamptz, nullable)
- `task4_reels_completed` (bool, default false) — increments after watch+like+share simulation (we'll mark true once user clicks 4 reels' "Done" buttons)
- `task5_screenshot_url` (text, nullable)
- `task5_status` (text: `pending` | `under_review` | `approved`)
- `task5_submitted_at` (timestamptz, nullable)
- `joined` (bool, default false) — true after final Join click
- `joined_at` (timestamptz)
- `is_winner` (bool, default false)
- `created_at`, `updated_at`

### New table: `king_maker_reels` (admin-managed, list of 4 reels for Task 4)
- `id`, `reel_url`, `position` (1-4), `created_at`

### New storage bucket
- `king-maker-uploads` (public) — for Task 3 (Instagram follow screenshot) and Task 5 (story screenshot)

### Duplicate detection
- Unique constraint on `task2_instagram_id` (case-insensitive) — prevents same IG handle twice
- Application-level check on screenshot URL hash (optional, basic)

### RLS policies
- Participants: user can SELECT/INSERT/UPDATE own row; admin manages all
- Event settings & reels: everyone can SELECT, only admin manages
- Storage: authenticated users can upload to their own folder; everyone read

---

## 2. New Page: `/king-maker` (`src/pages/KingMaker.tsx`)

Sections top-to-bottom:

### A. Hero banner (large landscape)
- Big bold text: **"FREE $30K MASTER ACCOUNT"**
- Subtitle: "Win 1 of 500 funded accounts — King Maker Event"
- Background: admin-uploaded `banner_image_url` with overlay
- Reverse countdown to `result_announcement_at`

### B. Account rules box
- 5% daily drawdown / 10% max drawdown
- Weekly payout / 90% profit split
- No news trading
- No other rules
- Worth ~$150 — Free for winners

### C. Task list (5 tasks, in this exact order top→bottom)

1. **Buy $10 Instant Account** — auto-checked from purchases. Green tick when owned.
2. **Enter your Instagram ID** — input field + Submit. Instant green tick. Duplicate IG → error.
3. **Follow Prop Gym on Instagram** — opens `instagram_profile_url` in new tab. Below: upload screenshot + Done button. Status badge cycles: `Pending` → `Under Review` → `Approved` (green tick). Auto-approves after 2 minutes via timestamp check on page load (no countdown shown to user).
4. **Watch & like 4 Reels** — 4 reel cards (admin-managed URLs). Each opens in new tab; user clicks "Done" on each. Once all 4 marked, green tick.
5. **Share poster on Instagram story** — Download poster button + Copy referral link button + instructions in English ("Put this poster on your Instagram story with the link and mention Prop Gym"). Then upload screenshot + "Promoted" button. Same review flow as Task 3.

### D. Big Join Button
- Disabled until all 5 tasks green
- On click → set `joined = true`, show success toast
- Once joined → show "✓ Joined" badge, button disabled

### E. Post-join view (when `joined = true`)
- "You've joined!" badge
- Reverse countdown to results
- Leaderboard:
  - Always show current user's row first ("You — Joined")
  - Show top 100 other joined users (name/email masked partially)
  - Once `winners_announced = true`, show winners with "Winner 🏆" badge

---

## 3. Hero Banner (Homepage)

Replace/add a new large landscape banner on `src/pages/Index.tsx` above the existing hero:

- Massive text "FREE $30K MASTER ACCOUNT"
- Tag: "King Maker Event • 500 Winners"
- CTA → navigates to `/king-maker`
- Gradient bg (gold/teal), landscape proportions (full-width, ~200-280px tall on desktop)
- Keeps the existing $10 highlight strip below or merges it

---

## 4. Hamburger Menu Link

Update `src/components/Header.tsx`:
- Add **King Maker** link (with Crown icon) to both desktop nav and mobile menu
- Routes to `/king-maker`

---

## 5. Admin Panel — King Maker Section

Update `src/pages/Admin.tsx`:
- Add **King Maker** sidebar item (Crown icon)
- Two sub-tabs inside:

### A. Event Edit
- Form to edit: event name, banner title/subtitle, banner image upload, Instagram profile URL, poster image upload, result announcement date/time, total winners
- Manage 4 reels (URL inputs, save)
- "Pick Winners Now" button → randomly selects N winners from joined participants, marks `is_winner=true`, sets `winners_announced=true`, and auto-creates trading accounts for them (see section 6)

### B. User Tracking
- Table of all participants: name, email, IG ID, task statuses, joined status, winner status
- Click row → modal showing both uploaded screenshots (Task 3 + Task 5) full-size
- Manual approve/reject for screenshots if needed (overrides 2-min auto-approve)

---

## 6. Winner Account Issuance

When admin clicks "Pick Winners":
1. Random sample 500 from `king_maker_participants` where `joined = true`
2. For each winner:
   - Insert a `challenge_plans` row of type `king_maker` (or use a single pre-seeded plan with $30K size, $0 price)
   - Insert `trading_accounts` row: `balance: 30000`, `phase: master`, `status: funded`, `profit_target: 0`
   - Mark `is_winner = true`

Add new $30K King Maker plan to `challenge_plans` (price_usd: 150, challenge_type: 'king_maker', daily_dd: 5, overall_dd: 10) — visible on Buy Challenge page as a paid option for non-winners (~$150).

---

## 7. Buy Challenge Page Update

`src/pages/BuyChallenge.tsx`:
- Add `king_maker` to CHALLENGE_TYPES toggle with Crown icon
- When selected: locked $30K size, $150 price
- Rules: 5% daily / 10% max / 90% split / weekly payout / no news trading
- Badge: "Free in King Maker Event 🎉" linking to `/king-maker`

---

## 8. Auto-Approve Logic (Tasks 3 & 5)

No backend cron needed. On every page load of `/king-maker`:
- For tasks with `status = 'under_review'` and `submitted_at < now() - 2 minutes` → update to `approved`
- User just sees "Under Review" then "Approved ✓" on next refresh/check (we poll every 15s while page open)

---

## 9. Duplicate Detection

- Instagram ID: DB unique index (lowercased). Insert returns error → toast "This Instagram ID is already used"
- Optional: store SHA-256 of uploaded image bytes in participant row to detect identical screenshots; reject duplicates

---

## 10. Files to Create/Modify

**New files:**
- `src/pages/KingMaker.tsx` — main event page
- `src/components/king-maker/TaskList.tsx`
- `src/components/king-maker/Leaderboard.tsx`
- `src/components/king-maker/CountdownTimer.tsx`
- `src/components/admin/KingMakerEventEdit.tsx`
- `src/components/admin/KingMakerUserTracking.tsx`

**Modified:**
- `src/App.tsx` — add `/king-maker` route
- `src/components/Header.tsx` — add King Maker nav link
- `src/pages/Index.tsx` — add giant landscape hero banner
- `src/pages/Admin.tsx` — add King Maker sidebar tab
- `src/pages/BuyChallenge.tsx` — add `king_maker` challenge type

**Database migrations:**
- New enum values, new tables (`event_settings`, `king_maker_participants`, `king_maker_reels`), RLS policies, new storage bucket, seed default King Maker plan & event row

---

## Notes / Assumptions

- Task 4 (reels watch/like/share) cannot be truly verified by us since Instagram has no public API for that — we use a "click-to-confirm" model where user opens each reel and clicks Done. This is industry-standard for such giveaways.
- Auto-approve uses client-side timestamp comparison (no cron job). Admin can manually approve/reject from the tracking panel.
- "Top 100 leaderboard" is a simple `LIMIT 100` query; current user's row is always pinned at top via separate query+merge.
- Winner picking uses Postgres `ORDER BY random() LIMIT 500` for true randomness.
