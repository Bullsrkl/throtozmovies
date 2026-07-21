## Problem
`/auth` page se admin transfer submit karne pe toast error aata he. Direct curl se function 502 Bad Gateway return karta he aur edge function logs empty hain — matlab function boot ke baad request handle karte hi crash ho raha he.

Sabse likely cause: `supabase/functions/transfer-admin/index.ts` `https://esm.sh/@supabase/supabase-js@2.45.0` se import kar raha he. Lovable Cloud edge runtime `npm:` specifier prefer karta he; esm.sh imports intermittently fail hote hain jisse function bina log kiye crash ho jata he.

## Fix

**File: `supabase/functions/transfer-admin/index.ts`**

1. Import badlo: `https://esm.sh/@supabase/supabase-js@2.45.0` → `npm:@supabase/supabase-js@2`
2. Har major step pe `console.log` add karo (flag check, create/update user, role assign, revoke old, mark flag) taaki agar dobara fail ho to logs me exact step dikhe
3. Top-level try/catch me `console.error` add karo full stack ke saath
4. Service role key missing hone par saaf 500 return karo bajaye silently crash hone ke:
   ```ts
   const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
   if (!serviceKey) return json({ error: "Server misconfigured: missing service role key" }, 500);
   ```
5. `platform_settings` `.single()` calls ko `.maybeSingle()` kar do (rows missing hone par silent crash na ho)

Baaki logic (one-time flag, email exists → password update, role assign, old admin revoke, flag mark) same rahega.

## Verify
- `supabase--deploy_edge_functions(["transfer-admin"])`
- `supabase--curl_edge_functions` se POST karke check karo ki ab 200/400 aata he, 502 nahi
- Agar fir bhi error aaye to `supabase--edge_function_logs` se exact step identify karke fix karo

## Files
- `supabase/functions/transfer-admin/index.ts` — rewrite imports + add logging + defensive checks
