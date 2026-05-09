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

    // Create new auth user
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: new_email,
      password: new_password,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (createErr || !created.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message || "Failed to create user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const newUserId = created.user.id;

    // Assign admin role to new user
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: newUserId, role: "admin" });
    if (roleErr && !roleErr.message.includes("duplicate")) {
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