## Goal
Login page (`/auth`) ke neeche ek **One-Time Admin Transfer** form add karna. User new email + new password daalega, "Transfer Admin" click karega, aur:
- Naya auth user create hoga
- Naye user ko `admin` role mil jayega
- Purane admin (`tilaks631@gmail.com`) ka admin role hat jayega (account user ban jayega)
- Form permanently disable ho jayega (sirf ek baar use ho sakta hai)

## Database Changes (migration)

1. **`platform_settings` me flag insert karna:**
   - `key = 'admin_transfer_used'`, `value = 'false'`

2. **`handle_new_user` trigger update karna:**
   - Hardcoded `tilaks631@gmail.com` check hata dena (taaki transfer ke baad wapas admin na ban jaye Google login se)
   - Iske badle `platform_settings` me ek `current_admin_email` key rakhi jayegi, aur trigger us key se match karega

3. **Initial seed:** `current_admin_email = 'tilaks631@gmail.com'`

## Edge Function: `transfer-admin`

Service role key use karega (admin operations ke liye zaroori).

**Flow:**
1. Request body validate (zod): `new_email`, `new_password` (min 8 chars)
2. `platform_settings` se `admin_transfer_used` check — agar `true` he to **403** return karo ("Admin transfer already used")
3. `supabase.auth.admin.createUser({ email, password, email_confirm: true })` se naya user banao
4. Naye user ke liye `user_roles` me `admin` role insert karo
5. Purane admin ka `user_id` `current_admin_email` se nikaalo, uska `admin` role `user_roles` se delete karo
6. `platform_settings` update: `admin_transfer_used = 'true'`, `current_admin_email = <new_email>`
7. Success response

**Security:**
- `verify_jwt = false` (public form se call hoga)
- One-time flag DB me hai, tampering nahi ho sakti
- Rate-limit ke liye flag hi sufficient he (ek hi successful call possible)

## Frontend: `src/pages/Auth.tsx`

Login card ke neeche ek **collapsible card** "🔐 One-Time Admin Transfer":
- By default closed/small link: "Transfer Admin Access (one-time)"
- Click pe expand hoke 2 inputs (new email, new password) + "Transfer" button
- Submit pe edge function call (`supabase.functions.invoke('transfer-admin', ...)`)
- Component mount pe `platform_settings` se `admin_transfer_used` fetch karo:
  - Agar `true` hai to puri section **hide** kardo (form already used)
- Success toast + form hide; error toast on failure

## Memory Update

`mem://auth/admin-predefined-account` ko update karna — hardcoded email ki jagah note karna ki admin email ab `platform_settings.current_admin_email` se aata hai aur ek baar transfer kiya ja sakta hai.

## Files Touched

- **New migration:** flag insert + trigger update
- **New edge function:** `supabase/functions/transfer-admin/index.ts`
- **Edited:** `src/pages/Auth.tsx`
- **Memory:** admin-predefined-account file update

## Risks / Notes
- Form public hai — koi bhi pehla visitor admin transfer kar sakta hai. Aapne confirm kiya: one-time flag se protect. **Aap hi pehle use karein** deploy ke turant baad.
- Naye admin ka email confirm auto kiya jayega (warna login nahi kar payenge).
- Old admin account delete nahi hoga, sirf admin role revoke hoga (aapki choice).