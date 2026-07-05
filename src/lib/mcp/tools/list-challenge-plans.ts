import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Public, read-only. Anyone can browse the available funded-account challenges.
function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "list_challenge_plans",
  title: "List challenge plans",
  description:
    "List the available Prop Gym funded-account challenge plans with pricing, account sizes, profit targets, and drawdown limits. Public, no login required.",
  inputSchema: {
    challenge_type: z
      .string()
      .optional()
      .describe("Optional filter by challenge type, e.g. one_step, two_step, or instant."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ challenge_type }) => {
    let query = publicClient()
      .from("challenge_plans")
      .select(
        "id, challenge_type, account_size, price_usd, profit_target_phase1, profit_target_phase2, daily_drawdown_limit, overall_drawdown_limit, min_trading_days",
      )
      .order("price_usd", { ascending: true });
    if (challenge_type) query = query.eq("challenge_type", challenge_type);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { plans: data ?? [] },
    };
  },
});