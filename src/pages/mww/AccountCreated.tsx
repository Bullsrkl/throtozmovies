import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { LogoMark } from "@/components/mww/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BadgeCheck, Copy, MailCheck, PartyPopper } from "lucide-react";

export default function AccountCreated() {
  const location = useLocation();
  const state = (location.state as { hasSession?: boolean; email?: string } | null) ?? {};
  const { user } = useAuth();
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("member_profiles")
      .select("member_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setMemberId(data?.member_id ?? null));
  }, [user]);

  const copy = () => {
    if (!memberId) return;
    navigator.clipboard.writeText(memberId);
    toast.success("Member ID copied");
  };

  const verified = !!user;

  return (
    <MobileShell className="px-6 pb-10 pt-10">
      <LogoMark className="h-10 w-10" />

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <div className="absolute inset-0 rounded-full bg-points/20 blur-2xl" />
          {verified ? (
            <PartyPopper className="relative h-14 w-14 text-primary" />
          ) : (
            <MailCheck className="relative h-14 w-14 text-primary" />
          )}
        </div>

        <h1 className="mt-6 font-display text-2xl font-extrabold">
          {verified ? "Account Created!" : "Almost there!"}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          {verified
            ? "Welcome to the MultiWorkWala ecosystem. Ye rahi aapki permanent Member ID."
            : `Humne ${state.email || "aapke email"} par verification link bheja he. Verify karte hi aapki Member ID activate ho jayegi.`}
        </p>

        {verified && (
          <div className="glass-card mt-8 w-full p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your Member ID
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-display text-2xl font-extrabold gold-text">
                {memberId || "Generating…"}
              </span>
              <button onClick={copy} aria-label="Copy Member ID" className="text-muted-foreground press">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-points">
              <BadgeCheck className="h-3.5 w-3.5" /> Permanent — kabhi change nahi hogi
            </p>
          </div>
        )}
      </div>

      <Link
        to={verified ? "/home" : "/login"}
        className="rounded-2xl gold-surface py-4 text-center font-display font-bold text-primary-foreground shadow-gold press"
      >
        {verified ? "Go to Dashboard" : "Back to Login"}
      </Link>
    </MobileShell>
  );
}
