import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/mww/AppLayout";
import { HeroCarousel } from "@/components/mww/HeroCarousel";
import { WalletSummaryCard } from "@/components/mww/WalletSummaryCard";
import { useMemberProfile, inr } from "@/hooks/useMemberProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Wallet, Coins, Gem, ShoppingBag, QrCode, Users, Tag, Store, Plane, Utensils,
  Crown, Trophy, Target, BadgeCheck, ShieldAlert, ChevronRight, Megaphone, Settings,
} from "lucide-react";

const quickActions = [
  { label: "Products", icon: ShoppingBag, to: "/offers" },
  { label: "Services", icon: Settings, to: "/offers" },
  { label: "MVS Pay", icon: QrCode, to: "/mvs-pay" },
  { label: "Merchants", icon: Store, to: "/offers" },
  { label: "Restaurants", icon: Utensils, to: "/offers" },
  { label: "Travel", icon: Plane, to: "/offers" },
  { label: "My Network", icon: Users, to: "/home" },
  { label: "Offers", icon: Tag, to: "/offers" },
];

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  is_new: boolean;
}

export default function Home() {
  const { member, wallet } = useMemberProfile();
  const [news, setNews] = useState<Announcement[]>([]);

  useEffect(() => {
    supabase
      .from("app_announcements")
      .select("id,title,body,is_new")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setNews((data as Announcement[]) ?? []));
  }, []);

  const firstName = (member?.full_name || "Member").split(" ")[0];
  const total = (wallet?.balance ?? 0) + (wallet?.mvs_pay_balance ?? 0);
  const kycVerified = member?.kyc_status === "verified";
  const membershipActive = member?.membership_status === "active";

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">Namaste,</p>
          <h1 className="font-display text-2xl font-extrabold">{firstName} 👋</h1>
        </div>

        <HeroCarousel />

        {/* Member card */}
        <div className="glass-card overflow-hidden p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gold-surface font-display text-xl font-extrabold text-primary-foreground">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold">{member?.full_name || "Member"}</p>
              <p className="text-xs tracking-wider text-primary">{member?.member_id || "—"}</p>
            </div>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {member?.member_role || "member"}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <span
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-semibold ${
                kycVerified
                  ? "border-points/40 bg-points/10 text-points"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {kycVerified ? <BadgeCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              KYC {kycVerified ? "Verified" : "Pending"}
            </span>
            <span
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-semibold ${
                membershipActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/12 bg-white/5 text-muted-foreground"
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              {membershipActive ? member?.membership_plan || "Active" : "No Membership"}
            </span>
          </div>
        </div>

        {/* Total balance */}
        <div className="glass-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total Balance
          </p>
          <p className="mt-1 font-display text-3xl font-extrabold gold-text">{inr(total)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Earning + MVS Pay · {wallet?.mvs_points_balance ?? 0} MVS Points
          </p>
        </div>

        {/* Wallets */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">My Wallets</h2>
            <Link to="/wallet" className="text-[11px] font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <WalletSummaryCard kind="earning" title="Earning" value={inr(wallet?.balance ?? 0)} icon={Wallet} />
            <WalletSummaryCard kind="mvspay" title="MVS Pay" value={inr(wallet?.mvs_pay_balance ?? 0)} icon={Coins} />
            <WalletSummaryCard
              kind="points"
              title="Points"
              value={String(wallet?.mvs_points_balance ?? 0)}
              icon={Gem}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-2 font-display text-sm font-bold">Quick Actions</h2>
          <div className="glass-card grid grid-cols-4 gap-3 p-4">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="flex flex-col items-center gap-1.5 press">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
                  <a.icon className="h-5 w-5 text-primary" />
                </span>
                <span className="text-center text-[10px] font-medium text-foreground/80">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Membership / Rank / Mission */}
        <div className="space-y-2.5">
          <div className="glass-card flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gold-surface">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">Membership</p>
              <p className="text-[11px] text-muted-foreground">
                {membershipActive ? "Aapka plan active he" : "Abhi tak koi plan active nahi"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="glass-card flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-points/15">
              <Trophy className="h-5 w-5 text-points" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">My Rank</p>
              <p className="text-[11px] text-muted-foreground">Rank 1 of 10 — journey shuru karein</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-earning/15">
                <Target className="h-5 w-5 text-earning" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold">Mission 1616</p>
                <p className="text-[11px] text-muted-foreground">0 of 16 direct · 0 of 16 team</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[3%] rounded-full gold-surface" />
            </div>
          </div>

          <div className="glass-card flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-earning/15">
              <Users className="h-5 w-5 text-earning" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">My Network</p>
              <p className="text-[11px] text-muted-foreground">7-level benefits — apni team banaiye</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="mb-2 font-display text-sm font-bold">Latest Announcements</h2>
          <div className="space-y-2.5">
            {news.length === 0 && (
              <div className="glass-card flex items-center gap-3 p-4">
                <Megaphone className="h-5 w-5 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Abhi koi announcement nahi. Naye offers jaldi aayenge.
                </p>
              </div>
            )}
            {news.map((n) => (
              <div key={n.id} className="glass-card p-4">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold">{n.title}</p>
                  {n.is_new && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                      New
                    </span>
                  )}
                </div>
                {n.body && <p className="mt-1 text-[11px] text-muted-foreground">{n.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
