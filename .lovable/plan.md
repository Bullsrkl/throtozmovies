

# Prop Gym — Full Platform Conversion Plan

## Overview

Convert "Throtoz Movies" into "Prop Gym" — a proprietary trading evaluation platform. This is a massive transformation touching every page and most components, but reusing the auth system, admin infrastructure, wallet structure, and design system.

---

## What We KEEP (Reuse)

| Component | Reuse Strategy |
|-----------|---------------|
| `useAuth` hook + AuthProvider | Keep as-is (auth, roles, admin check) |
| `Auth.tsx` | Keep login/signup, remove referral code & movie branding |
| `user_roles` table + `has_role()` | Keep exactly |
| `profiles` table | Keep, add trading-related fields later |
| `wallets` table | Repurpose for profit tracking |
| `withdrawals` table | Modify for USDT withdrawals |
| `platform_settings` table | Keep for admin-configurable settings |
| Tailwind config + CSS theme | Keep dark theme, shift primary accent to teal/green |
| UI components (shadcn) | Keep all |
| `NavLink`, `DashboardSidebar` | Modify menu items |

## What We REMOVE

| File | Reason |
|------|--------|
| `MovieCard.tsx` | Movie-specific |
| `MovieDetailModal.tsx` | Movie-specific |
| `HeroBanner.tsx` | Replace with Prop Gym hero |
| `Upload.tsx` page | Movie upload — not needed |
| `Subscriptions.tsx` | Replace with challenge purchase |
| `PaymentPopup.tsx` | Replace with USDT payment flow |
| Movie-related dashboard tabs (MyUploads, Analytics, PromotionRequests, Referrals) | Replace with trading tabs |

---

## Database Changes

### New Tables

**1. `challenge_plans`** — replaces `subscription_plans`
| Column | Type |
|--------|------|
| id | uuid PK |
| account_size | integer (5000, 10000, etc.) |
| challenge_type | enum (instant, one_step, two_step) |
| price_usd | numeric |
| profit_target_phase1 | numeric (%) |
| profit_target_phase2 | numeric (%) |
| daily_drawdown_limit | numeric (%) |
| overall_drawdown_limit | numeric (%) |
| min_trading_days | integer |

**2. `challenge_purchases`** — replaces subscriptions
| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK |
| plan_id | uuid FK → challenge_plans |
| status | enum (pending_payment, payment_submitted, approved, rejected) |
| transaction_id | text |
| payment_screenshot_url | text |
| discount_code | text |
| created_at | timestamptz |

**3. `trading_accounts`** — new
| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK |
| purchase_id | uuid FK → challenge_purchases |
| account_number | text (9-digit) |
| password | text |
| server | text |
| platform | text default 'Match Trader' |
| phase | enum (phase1, phase2, master) |
| balance | numeric |
| profit_percent | numeric |
| daily_drawdown | numeric |
| overall_drawdown | numeric |
| trading_days | integer |
| profit_target | numeric |
| status | enum (active, passed, failed, funded) |
| created_at | timestamptz |

**4. `certificates`** — new
| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK |
| account_id | uuid FK → trading_accounts |
| certificate_type | text (phase1_pass, phase2_pass, funded) |
| issued_at | timestamptz |

### Modify Existing Tables

- **`withdrawals`**: Add `usdt_address` text, `network` text (BEP20/ERC20). Remove `upi_id` requirement. Change amounts to USD.
- **`wallets`**: Repurpose — balance = trading profit available for withdrawal.

### Update `platform_settings`
Insert default: `usdt_deposit_address` = `0xe00f8c174fdbf8b0a0ff5688e650422f805b6c9c`

---

## Theme Changes

Shift primary accent from orange to teal/cyan to match the reference:
- `--primary`: change from orange `19 100% 50%` → teal `160 100% 45%`
- `--primary-light`: → `160 80% 55%`
- Keep premium green, admin gold as-is
- Add glass-card effect utilities

---

## Pages Structure

### Remove
- `Upload.tsx`
- `Subscriptions.tsx` (replaced by BuyChallenge)

### New/Modified Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `Index.tsx` | New Prop Gym landing page (hero, features, how it works) |
| `/auth` | `Auth.tsx` | Keep, rebrand |
| `/buy-challenge` | `BuyChallenge.tsx` | Account size selection + USDT payment |
| `/dashboard` | `Dashboard.tsx` | Modified sidebar menu |
| `/dashboard/accounts` | `TradingAccounts.tsx` | My Trading Accounts |
| `/dashboard/competition` | `Competition.tsx` | Leaderboard/competition |
| `/dashboard/wallet` | `Wallet.tsx` | USDT withdrawal system |
| `/dashboard/certificates` | `Certificates.tsx` | View earned certificates |
| `/dashboard/settings` | `Settings.tsx` | Keep, modify |
| `/admin` | `Admin.tsx` | Modify tabs: Payments Review, Withdrawals, Users, System Settings |

### Homepage Sections (as per requirements)
1. **Hero**: "Trade With Discipline. Get Funded." + floating dashboard mockup
2. **Funding Models**: 3 cards (Instant, 1-Step, 2-Step)
3. **Features**: 4 cards (Real Evaluation, Fair Rules, Instant Funding, Fast Withdrawals)
4. **How It Works**: 4-step flow
5. **CTA**: Get started button

---

## Component Changes

| Component | Action |
|-----------|--------|
| `Header.tsx` | Rebrand "Prop Gym", change nav links (Buy Challenge, Dashboard, Login/Signup) |
| `DashboardSidebar.tsx` | New menu: Trading Accounts, Competition, Wallet, Certificates, Settings |
| `HeroBanner.tsx` | Complete rewrite for Prop Gym |
| `PaymentPopup.tsx` | Replace with USDT payment flow component |
| `MovieCard.tsx` | Delete |
| `MovieDetailModal.tsx` | Delete |
| New: `TradingAccountCard.tsx` | Shows account status, balance, drawdown, phase |
| New: `ChallengeCard.tsx` | Pricing card for challenge purchase |
| New: `USDTPayment.tsx` | USDT address display, copy, screenshot upload |

---

## Admin Panel Changes

Replace movie-related tabs with:
1. **Payments Review** — See pending challenge purchases, approve/reject, generate trading credentials
2. **Withdrawal Requests** — Approve/reject USDT withdrawals
3. **Users** — Keep user management
4. **System Settings** — USDT deposit address, platform config

---

## Hamburger Menu (Mobile)

User: My Trading Accounts, Competition, Wallet, Certificates, Settings, Logout
Admin: Admin Dashboard, Payments Review, Withdrawal Requests, Users, System Settings

---

## Implementation Order (Phased)

Due to the massive scope, this should be done in phases:

**Phase 1 — Foundation (~first batch)**
- Theme color shift (orange → teal)
- Header rebrand
- New homepage (hero + sections)
- Database migration (challenge_plans, challenge_purchases, trading_accounts, certificates)
- Remove movie components

**Phase 2 — Purchase Flow**
- Buy Challenge page with pricing cards
- USDT payment component
- Admin payment approval tab

**Phase 3 — Trading Dashboard**
- Trading Accounts page
- Account status cards (balance, drawdown, phase tracking)
- Admin: generate trading credentials

**Phase 4 — Wallet & Withdrawals**
- Wallet page (USDT withdrawal)
- Admin withdrawal approval
- Certificates page

**Phase 5 — Polish**
- Competition/leaderboard
- Mobile hamburger menu
- Final UI polish

---

## Technical Notes

- Storage bucket `movie-posters` can be repurposed or a new `payment-screenshots` bucket created
- The `subscription_plans` and related movie tables stay in DB but are unused (no need to drop — just ignore)
- All new tables get proper RLS policies (user reads own, admin manages all)
- Challenge pricing calculated programmatically: Step-2 = base, Step-1 = base×1.1, Instant = base×1.2

---

## Estimated Scope

This is approximately **15-20 significant file changes/creations** across 4-5 implementation phases. Each phase should be a separate implementation batch to keep changes manageable.

Shall I proceed with **Phase 1** first?

