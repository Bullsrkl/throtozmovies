# MultiWorkWala — Phase 2: 3 Wallets + Ledger + Membership + UPI Checkout

Phase 1 me shell ban gaya. Ab wallets ko real bana rahe he: har transaction ka ledger, membership plans (₹5,000 / ₹10,000 / ₹25,000) aur manual UPI checkout with admin approval.

## Kya banega

**Wallets (real data)**
- My Wallets page: teen wallet cards (Earning ₹, MVS Pay ₹, MVS Points) live balance ke saath
- Har wallet ka apna detail view: balance header + uski transaction list (credit green, debit red, date, note, status)
- Add Money → MVS Pay wallet me manual UPI deposit request
- Withdraw → Earning wallet se withdrawal request (min ₹500, UPI ID par)
- MVS Points sirf earn/redeem hote he — direct add/withdraw nahi

**Membership**
- Membership page: 3 plans — Silver ₹5,000, Gold ₹10,000, Platinum ₹25,000 (benefits list, level unlocks, MVS Points bonus)
- Plan select → UPI checkout → admin approve hone par membership active + Points credit
- Home ka Membership card real status dikhayega (Active / Inactive, plan naam, activation date)

**Manual UPI Checkout (ek hi reusable flow)**
- Amount + platform UPI ID (admin-configurable) + copy button
- User transaction/UTR number dalega aur payment screenshot upload karega
- Submit → status "Pending Verification"
- Admin approve → wallet credit / membership activate; reject → reason ke saath dikhega
- User ko real-time status update milega

**Admin (hamburger me naye sections)**
- Payments Queue: pending deposits + membership purchases, screenshot preview, Approve / Reject with note
- Withdrawals Queue: approve → paid mark, reject with reason
- Wallet Adjustment: kisi member ke kisi bhi wallet me manual credit/debit reason ke saath (sab ledger me record)
- Settings: platform UPI ID, min/max withdrawal, membership plan prices

## Backend

Naye tables:
- `wallet_transactions` — user, wallet type (earning/mvs_pay/points), direction (credit/debit), amount, category (deposit, withdrawal, membership, referral, bonus, purchase, adjustment), reference id, note, status, timestamps
- `membership_plans` — code, naam, price ₹, points bonus, benefits list, active flag
- `memberships` — user, plan, status (pending/active/expired), activated_at
- `payment_requests` — user, purpose (wallet_topup / membership), amount, UPI ref number, screenshot url, status, admin note
- `withdrawal_requests` — user, amount, UPI id, status, admin note
- Storage bucket `payment-proofs` — user apni file upload/dekh sake, admin sab dekhe

Rules:
- Balance kabhi client se update nahi hoga — sirf security-definer functions se, jo transaction + balance ek saath likhte he (ledger hi single source of truth)
- User sirf apna data dekhega; admin sabka
- Approve/reject sirf admin role se

## Technical notes

- Naye pages: `/wallet/:type`, `/membership`, `/payments/checkout`, `/withdraw`, admin ke andar Payments/Withdrawals/Adjustments tabs
- Naye components: `TransactionRow`, `WalletDetailHeader`, `UpiCheckoutSheet`, `AmountInput`, `StatusBadge`, `PlanCard`
- Naye hooks: `useWalletLedger`, `useMembership`, `usePaymentRequests`
- DB functions: `credit_wallet(user, wallet, amount, category, ref, note)`, `debit_wallet(...)`, `approve_payment_request(id)`, `approve_withdrawal(id)` — sab atomic
- Supabase realtime subscription se status change turant UI me
- Sab currency INR, existing navy/gold token set reuse

## Phase 2 ke baad
Phase 3: Products, Orders, Return/Refund — Phase 4: Referral network + 7-level engine — Phase 5: Ranks + Mission 1616
