import { AppLayout } from "@/components/mww/AppLayout";
import { QrCode, Scan, Send, Store } from "lucide-react";
import { useMemberProfile, inr } from "@/hooks/useMemberProfile";

const actions = [
  { label: "Scan & Pay", icon: Scan },
  { label: "Send Money", icon: Send },
  { label: "Pay Merchant", icon: Store },
  { label: "My QR", icon: QrCode },
];

export default function MvsPay() {
  const { wallet, member } = useMemberProfile();
  return (
    <AppLayout>
      <h1 className="font-display text-2xl font-extrabold">MVS Pay</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tez, secure in-app payments.</p>

      <div className="glass-card mt-5 p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          MVS Pay Balance
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold gold-text">
          {inr(wallet?.mvs_pay_balance ?? 0)}
        </p>
        <div className="mx-auto mt-5 grid h-36 w-36 place-items-center rounded-3xl border border-primary/30 bg-white/5">
          <QrCode className="h-20 w-20 text-primary" />
        </div>
        <p className="mt-3 text-xs tracking-wider text-primary">{member?.member_id || "—"}</p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {actions.map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-1.5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <a.icon className="h-5 w-5 text-primary" />
            </span>
            <span className="text-center text-[10px] font-medium text-foreground/80">{a.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card mt-5 p-5 text-center text-xs text-muted-foreground">
        Payment engine agle update me live hoga.
      </div>
    </AppLayout>
  );
}
