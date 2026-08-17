import { Home, Wallet, QrCode, Tag, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/mvs-pay", label: "MVS Pay", icon: QrCode, center: true },
  { to: "/offers", label: "Offers", icon: Tag },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-white/10 bg-card/85 backdrop-blur-xl">
      <div className="flex items-end justify-around px-2 pb-2 pt-1.5">
        {items.map((item) =>
          item.center ? (
            <NavLink
              key={item.to}
              to={item.to}
              className="-mt-7 flex flex-col items-center gap-1"
              activeClassName="[&_span]:text-primary"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl gold-surface shadow-gold press">
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span>
            </NavLink>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-muted-foreground transition-colors"
              )}
              activeClassName="text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}
