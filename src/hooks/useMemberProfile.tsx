import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface MemberProfile {
  id: string;
  user_id: string;
  member_id: string;
  member_role: string;
  membership_status: string;
  membership_plan: string | null;
  kyc_status: string;
  account_status: string;
  full_name: string | null;
  mobile: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
}

export interface WalletBalances {
  balance: number;
  mvs_pay_balance: number;
  mvs_points_balance: number;
  total_earnings: number;
}

export function useMemberProfile() {
  const { user } = useAuth();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [wallet, setWallet] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setMember(null);
      setWallet(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: m }, { data: w }] = await Promise.all([
      supabase.from("member_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    setMember((m as MemberProfile) ?? null);
    setWallet(
      w
        ? {
            balance: Number(w.balance ?? 0),
            mvs_pay_balance: Number(w.mvs_pay_balance ?? 0),
            mvs_points_balance: Number(w.mvs_points_balance ?? 0),
            total_earnings: Number(w.total_earnings ?? 0),
          }
        : { balance: 0, mvs_pay_balance: 0, mvs_points_balance: 0, total_earnings: 0 }
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { member, wallet, loading, refresh: load };
}

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
