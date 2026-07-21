import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
      return json({ error: "Server misconfigured: missing service role key" }, 500);
    }

    const { new_email, new_password } = await req.json();
    console.log("transfer-admin: request received", { new_email });

    if (
      typeof new_email !== "string" ||
      typeof new_password !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email) ||
      new_password.length < 8
    ) {
      return json({ error: "Invalid email or password (min 8 chars)" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check one-time flag
    const { data: flag } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "admin_transfer_used")
      .maybeSingle();
    console.log("transfer-admin: flag", flag);

    if (flag?.value === "true") {
      return json({ error: "Admin transfer has already been used" }, 403);
    }

    // Get current admin email
    const { data: currentRow } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "current_admin_email")
      .maybeSingle();
    const currentAdminEmail = currentRow?.value;
    console.log("transfer-admin: current admin", currentAdminEmail);

    // Try to create new auth user; if already exists, find and update password
    let newUserId: string | null = null;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: new_email,
      password: new_password,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });

    if (createErr) {
      const msg = createErr.message || "";
      console.log("transfer-admin: createUser error", msg, (createErr as any).status);
      const alreadyExists =
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("registered") ||
        (createErr as any).code === "email_exists" ||
        (createErr as any).status === 422;

      if (!alreadyExists) {
        return json({ error: msg || "Failed to create user" }, 400);
      }

      // User already exists — find them via auth admin listing (profiles may not have the row)
      let existingId: string | null = null;
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", new_email)
        .maybeSingle();
      if (profileRow?.id) {
        existingId = profileRow.id;
      } else {
        // Fallback: page through auth users
        for (let page = 1; page <= 20 && !existingId; page++) {
          const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
          if (listErr) { console.error("listUsers err", listErr); break; }
          const found = list?.users?.find((u: any) => (u.email || "").toLowerCase() === new_email.toLowerCase());
          if (found) existingId = found.id;
          if (!list?.users || list.users.length < 200) break;
        }
      }

      if (!existingId) {
        return json({ error: "Email already registered but user not found" }, 400);
      }
      newUserId = existingId;

      const { error: updErr } = await supabase.auth.admin.updateUserById(newUserId, {
        password: new_password,
        email_confirm: true,
      });
      if (updErr) {
        console.error("updateUserById err", updErr);
        return json({ error: "Failed to update password: " + updErr.message }, 500);
      }
    } else if (created?.user) {
      newUserId = created.user.id;
    }

    if (!newUserId) {
      return json({ error: "Failed to resolve user id" }, 500);
    }
    console.log("transfer-admin: newUserId", newUserId);

    // Assign admin role to new user (idempotent)
    const { error: roleErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: newUserId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) {
      console.error("role upsert err", roleErr);
      return json({ error: "Failed to assign admin role: " + roleErr.message }, 500);
    }

    // Revoke admin role from old admin
    if (currentAdminEmail) {
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", currentAdminEmail)
        .maybeSingle();
      if (oldProfile?.id && oldProfile.id !== newUserId) {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", oldProfile.id)
          .eq("role", "admin");
      }
    }

    // Mark flag used + update current admin email (upsert in case rows are missing)
    await supabase.from("platform_settings").upsert(
      { key: "admin_transfer_used", value: "true", updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    await supabase.from("platform_settings").upsert(
      { key: "current_admin_email", value: new_email, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    console.log("transfer-admin: success");

    return json({ success: true, message: "Admin transferred successfully" }, 200);
  } catch (e: any) {
    console.error("transfer-admin fatal", e?.stack || e);
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});