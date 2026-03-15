

# Plan: Trading Account Detail View with Credentials, Drawdown Bars & Rules

## Overview

Currently, the Trading Accounts page shows a flat list of account cards. The user wants a **click-to-expand detail view** for each account showing:

1. **Platform Credentials** (Account Number, Password, Server, Platform) at the top
2. **Drawdown percentage bars** with limit numbers (Daily DD used vs 5% limit, Overall DD used vs 10% limit)
3. **All trading rules** displayed visually (profit target, min trading days, drawdown limits, etc.)
4. **Analytics section** (balance, profit, phase progress)

## Changes

### 1. Rewrite `TradingAccounts.tsx` — Clickable Account Cards with Detail View

**Account List View (default):**
- Each account shown as a compact card with account number, status badge, phase badge, balance, profit %
- Clicking a card expands it or navigates to a detail view (using local state, no new route needed)

**Account Detail View (when clicked):**

**Section A — Credentials Card**
- Match Trader / MetaTrader credentials box with copy buttons
- Fields: Account Number, Password (masked with show/hide toggle), Server, Platform
- Styled as a bordered card with a key/lock icon

**Section B — Performance Metrics**
- Balance, Profit %, Trading Days — stat cards (existing, cleaned up)

**Section C — Drawdown Bars with Limits**
- **Daily Drawdown**: Progress bar showing `daily_drawdown` used out of `daily_drawdown_limit` (from challenge_plans via purchase_id)
  - Color: green when < 50% used, yellow 50-80%, red > 80%
  - Label: "2.1% / 5% Daily Drawdown Limit"
- **Overall Drawdown**: Same visual pattern for `overall_drawdown` vs `overall_drawdown_limit`
  - Label: "4.5% / 10% Overall Drawdown Limit"

**Section D — Trading Rules (Visual)**
- Grid of rule cards, each with icon + label + value + status (pass/fail/in-progress):
  - Profit Target: `profit_percent` vs `profit_target` (progress bar)
  - Min Trading Days: `trading_days` vs `min_trading_days` (e.g., "3 / 5 days")
  - Daily Drawdown Limit: current vs limit
  - Overall Drawdown Limit: current vs limit
  - Each rule shows a checkmark (green) if met, warning (yellow) if approaching, or active indicator

### 2. Fetch Related Plan Data

The `trading_accounts` table has `purchase_id` → `challenge_purchases` → `plan_id` → `challenge_plans`. Need to join or separately fetch the plan data to get `daily_drawdown_limit`, `overall_drawdown_limit`, `min_trading_days`, `profit_target_phase1/phase2`.

Query approach: Fetch accounts, then for each account fetch its purchase → plan. Or do a single query with nested select:
```typescript
supabase.from("trading_accounts")
  .select("*, challenge_purchases!inner(plan_id, challenge_plans!inner(*))")
```

This gives us all the plan rules for each account.

### 3. Back Button

When viewing account detail, show a back arrow button to return to the accounts list.

## Technical Details

- No new routes needed — use `selectedAccount` state in `TradingAccounts.tsx`
- Drawdown bars use the existing `<Progress>` component with conditional colors via className
- Credentials password uses a show/hide toggle with `Eye`/`EyeOff` icons from lucide
- Copy buttons use `navigator.clipboard.writeText()` with toast feedback
- All data comes from existing tables — no database changes needed
- Mobile responsive: stack all sections vertically on 375px viewport

