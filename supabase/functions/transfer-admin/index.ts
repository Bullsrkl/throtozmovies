import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { new_email, new_password } = await req.json();

    if (
      typeof new_email !== "string" ||
      typeof new_password !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email) ||
      new_password.length < 8
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password (min 8 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check one-time flag
    const { data: flag } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "admin_transfer_used")
      .single();

    if (flag?.value === "true") {
      return new Response(
        JSON.stringify({ error: "Admin transfer has already been used" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get current admin email
    const { data: currentRow } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "current_admin_email")
      .single();
    const currentAdminEmail = currentRow?.value;

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
      const alreadyExists =
        msg.toLowerCase().includes("already") ||
        (createErr as any).code === "email_exists" ||
        (createErr as any).status === 422;

      if (!alreadyExists) {
        return new Response(
          JSON.stringify({ error: msg || "Failed to create user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // User already exists — locate them via profiles and update password
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", new_email)
        .maybeSingle();

      if (!existing?.id) {
        return new Response(
          JSON.stringify({ error: "Email already registered but profile not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      newUserId = existing.id;

      const { error: updErr } = await supabase.auth.admin.updateUserById(newUserId, {
        password: new_password,
        email_confirm: true,
      });
      if (updErr) {
        return new Response(
          JSON.stringify({ error: "Failed to update password: " + updErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else if (created?.user) {
      newUserId = created.user.id;
    }

    if (!newUserId) {
      return new Response(
        JSON.stringify({ error: "Failed to resolve user id" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Assign admin role to new user (idempotent)
    const { error: roleErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: newUserId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) {
      return new Response(
        JSON.stringify({ error: "Failed to assign admin role: " + roleErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

    // Mark flag used + update current admin email
    await supabase
      .from("platform_settings")
      .update({ value: "true", updated_at: new Date().toISOString() })
      .eq("key", "admin_transfer_used");
    await supabase
      .from("platform_settings")
      .update({ value: new_email, updated_at: new Date().toISOString() })
      .eq("key", "current_admin_email");

    return new Response(
      JSON.stringify({ success: true, message: "Admin transferred successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});