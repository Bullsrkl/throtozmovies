

## Current YouTube Feature Analysis

### Abhi kya hai (Current State):
- **Hardcoded YouTube links** in 2 files:
  - `src/components/dashboard/Overview.tsx` (line 140-141)
  - `src/components/dashboard/Wallet.tsx` (line 139-140)
- Links hardcoded hain: `@throtozm` channel
  - Deep link: `vnd.youtube://www.youtube.com/channel/@throtozm?sub_confirmation=1`
  - Web fallback: `https://youtube.com/@throtozm?si=OzLo_9frW1Dd1Rwv&sub_confirmation=1`
- Admin ke paas **koi control nahi** hai link change karne ka — code edit karna padta hai

---

## Proposed Plan: Admin-Controlled YouTube Link

### 1. Database: New `platform_settings` table
| Column | Type | Purpose |
|--------|------|---------|
| `key` | text (PK) | Setting name (e.g., `youtube_channel_url`) |
| `value` | text | The URL/link value |
| `updated_at` | timestamp | Last update time |

- RLS: Admin can read/write, all authenticated users can read
- Insert default row: `youtube_channel_url` = current `@throtozm` link

### 2. Admin Panel (`src/pages/Admin.tsx`)
- New "Platform Settings" tab or section add karna
- Input field for YouTube channel URL
- "Done" / Save button — saves to `platform_settings` table
- Admin enters any YouTube channel link, it becomes active for all users

### 3. User Side Updates
- `Overview.tsx` and `Wallet.tsx` mein hardcoded links hata kar database se fetch karna
- `platform_settings` table se `youtube_channel_url` read karke deep link + web fallback generate karna automatically

### Files to Modify
| File | Change |
|------|--------|
| Database | Create `platform_settings` table with default YouTube URL |
| `src/pages/Admin.tsx` | Add YouTube link management section |
| `src/components/dashboard/Overview.tsx` | Fetch YouTube URL from DB instead of hardcoded |
| `src/components/dashboard/Wallet.tsx` | Same — fetch from DB |

