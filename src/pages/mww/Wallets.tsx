import { AppLayout } from "@/components/mww/AppLayout";
import { useMemberProfile, inr } from "@/hooks/useMemberProfile";
import { Wallet as WalletIcon, Coins, Gem, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const wallets = [
  { key: "earning", title: "Earning Wallet", icon: WalletIcon, grad: "var(--gradient-earning)", note: "Income, bonuses aur rewards yahan aate he." },
  { key: "mvspay", title: "MVS Pay Wallet", icon: Coins, grad: "var(--gradient-mvspay)", note: "Platform par shopping aur payments ke liye." },
  { key: "points", title: "MVS Points", icon: Gem, grad: "var(--gradient-points)", note: "Loyalty points — offers par redeem hote he." },
] as const;

export default function Wallets() {
  const { wallet } = useMemberProfile();

  const valueFor = (key: string) => {
    if (key === "earning") return inr(wallet?.balance ?? 0);
    if (key === "mvspay") return inr(wallet?.mvs_pay_balance ?? 0);
    return `${wallet?.mvs_points_balance ?? 0} pts`;
  };

  return (
    <AppLayout>
      <h1 className="font-display text-2xl font-extrabold">My Wallets</h1>
      <p className="mt-1 text-sm text-muted-foreground">Teen smart wallets, ek jagah.</p>

      <div className="mt-5 space-y-3">
        {wallets.map((w) => (
          <div key={w.key} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: w.grad }}>
                <w.icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-bold">{w.title}</p>
                <p className="text-[11px] text-muted-foreground">{w.note}</p>
              </div>
            </div>
            <p className="mt-4 font-display text-2xl font-extrabold">{valueFor(w.key)}</p>
            <div className="mt-4 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/5 py-2.5 text-xs font-semibold press">
                <ArrowDownLeft className="h-3.5 w-3.5" /> Add
              </button>
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/5 py-2.5 text-xs font-semibold press">
                <ArrowUpRight className="h-3.5 w-3.5" /> Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card mt-5 p-5 text-center">
        <p className="font-display text-sm font-bold">Recent Transactions</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Abhi koi transaction nahi. Wallet ledger agle update me aayega.
        </p>
      </div>
    </AppLayout>
  );
}
