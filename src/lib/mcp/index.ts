import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChallengePlans from "./tools/list-challenge-plans";
import listMyTradingAccounts from "./tools/list-my-trading-accounts";
import getMyWallet from "./tools/get-my-wallet";
import listMyPurchases from "./tools/list-my-purchases";

// Build the OAuth issuer from the project ref (inlined at build time by Vite),
// never from SUPABASE_URL which is the .lovable.cloud proxy on Cloud apps.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "prop-gym-mcp",
  title: "Prop Gym MCP",
  version: "0.1.0",
  instructions:
    "Tools for Prop Gym, a proprietary trading platform. Use `list_challenge_plans` to browse funded-account challenges (public). Signed-in users can inspect their trading accounts, wallet, and purchases with the `list_my_*` and `get_my_wallet` tools.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listChallengePlans, listMyTradingAccounts, getMyWallet, listMyPurchases],
});