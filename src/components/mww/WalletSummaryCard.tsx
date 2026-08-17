import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export type WalletKind = "earning" | "mvspay" | "points";

const styles: Record<WalletKind, { grad: string; ring: string; label: string }> = {
  earning: { grad: "var(--gradient-earning)", ring: "border-earning/30", label: "text-earning-light" },
  mvspay: { grad: "var(--gradient-mvspay)", ring: "border-mvspay/30", label: "text-mvspay-light" },
  points: { grad: "var(--gradient-points)", ring: "border-points/30", label: "text-points-light" },
};

interface WalletSummaryCardProps {
  kind: WalletKind;
  title: string;
  value: string;
  caption?: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function WalletSummaryCard({
  kind,
  title,
  value,
  caption,
  icon: Icon,
  className,
  onClick,
}: WalletSummaryCardProps) {
  const s = styles[kind];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass-card press w-full overflow-hidden p-4 text-left",
        s.ring,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ background: s.grad }}
        >
          <Icon className="h-5 w-5 text-primary-foreground" />
        </span>
      </div>
      <p className={cn("mt-3 text-[11px] font-semibold uppercase tracking-wider", s.label)}>
        {title}
      </p>
      <p className="font-display text-lg font-extrabold text-foreground">{value}</p>
      {caption && <p className="mt-0.5 text-[11px] text-muted-foreground">{caption}</p>}
    </button>
  );
}
