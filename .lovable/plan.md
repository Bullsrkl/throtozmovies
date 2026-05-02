
# Plan: King Maker Admin Image Uploads + Reel Watch Timer + User Poster View

## Summary

Three improvements to the King Maker event:

1. **Admin side:** Replace banner/poster image **URL text inputs** with actual **file upload** controls (uploaded to the existing `king-maker-uploads` storage bucket). Reel section keeps URL inputs as-is.
2. **User side (Task 4 — Reels):** Prevent cheating. Each reel's "Done" button stays **disabled** until the user first clicks "Play Reel" (which opens the reel in a new tab) AND a **60-second countdown** elapses. Countdown ticks down on the button label (e.g. `Wait 60s… 59s… 0s → Done`). Applies to all 4 reels independently.
3. **User side (Task 5 — Poster):** Show the admin-uploaded poster image as a **visible preview** on the King Maker page, with a working **Download** button that saves the image file (not just opens it in a new tab).

---

## Changes

### 1. `src/components/admin/KingMakerAdmin.tsx`

- Replace the `<Input value={event.banner_image_url}>` text field with:
  - A current-image preview (if set)
  - A `<input type="file" accept="image/*">` upload button
  - On file select → upload to `king-maker-uploads/admin/banner-{timestamp}.{ext}` → get public URL → set `event.banner_image_url` in local state
  - User must still click "Save Event" to persist (consistent with current pattern)
- Same treatment for `poster_image_url` → uploads to `king-maker-uploads/admin/poster-{timestamp}.{ext}`
- Show small "Uploading…" spinner during upload
- Keep reel URL inputs unchanged

### 2. `src/pages/KingMaker.tsx` — Task 4 anti-cheat reel timer

Replace the current reel UI with per-reel state:

```text
Reel #1
[ ▶ Play Reel ]      ← opens reel_url in new tab, starts 60s timer
[ Wait 60s ]         ← disabled, counts down: 60 → 59 → … → 0
[ ✓ Done ]           ← enabled only after countdown reaches 0; click marks done
```

Implementation:
- New state: `reelTimers: Record<number, { startedAt: number; remaining: number }>`
- New state: `reelPlayed: Record<number, boolean>` (true once Play clicked)
- `useEffect` with `setInterval(1s)` updates all active timers' `remaining`
- Play button: opens `reel_url`, sets `reelPlayed[pos]=true`, sets `reelTimers[pos]={startedAt:Date.now(), remaining:60}`
- Done button: `disabled` unless `reelPlayed[pos] && remaining<=0`. Label shows:
  - "Play first" if not played
  - `Wait ${remaining}s` while counting
  - "Done" when ready
  - ✓ checkmark once marked done
- Existing `markReelDone` logic stays the same (DB update at 4/4)

### 3. `src/pages/KingMaker.tsx` — Task 5 poster preview + download

- If `event.poster_image_url` exists, show it as `<img src={event.poster_image_url} className="max-h-64 rounded border" />` above the buttons
- Replace `downloadPoster` (currently just `window.open`) with a proper download:
  - Fetch the image as blob, create `<a download="prop-gym-king-maker-poster.jpg">` and trigger click
  - Fallback to opening in new tab if fetch fails (e.g. CORS)

---

## Storage / Backend

- No DB changes — `banner_image_url` and `poster_image_url` columns already exist on `event_settings`
- Existing `king-maker-uploads` bucket is **public** ✓ — admin uploads use the same bucket under an `admin/` prefix
- Existing storage RLS already allows authenticated uploads; admin user qualifies

---

## Files modified

- `src/components/admin/KingMakerAdmin.tsx` — banner & poster fields → file upload
- `src/pages/KingMaker.tsx` — reel timer logic + poster preview + proper download

## Notes

- The 60-second timer is **client-side only** (it's purely a UX/anti-casual-cheat measure; nothing on Instagram is verifiable from the browser anyway, same constraint as the existing design)
- Timer state lives in component state — if the user refreshes mid-countdown, they'll need to click Play again. That's intentional and prevents the trivial cheat of just spamming Done.
