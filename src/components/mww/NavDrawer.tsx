import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logo } from "@/components/mww/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { toast } from "sonner";
import {
  Home, Wallet, QrCode, Tag, User, ShoppingBag, Store, Utensils, Hotel, Plane,
  Users, Trophy, Target, Crown, BadgeCheck, ShieldCheck, Bell, LifeBuoy,
  FileText, Scale, LogOut, ChevronRight, Settings, Package,
} from "lucide-react";

interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  {
    title: "Main",
    items: [
      { label: "Home", to: "/home", icon: Home },
      { label: "My Wallets", to: "/wallet", icon: Wallet },
      { label: "MVS Pay", to: "/mvs-pay", icon: QrCode },
      { label: "Offers", to: "/offers", icon: Tag },
    ],
  },
  {
    title: "Shop & Services",
    items: [
      { label: "Products", to: "/offers", icon: ShoppingBag },
      { label: "Services", to: "/offers", icon: Settings },
      { label: "Merchants", to: "/offers", icon: Store },
      { label: "Restaurants", to: "/offers", icon: Utensils },
      { label: "Hotels", to: "/offers", icon: Hotel },
      { label: "Travel", to: "/offers", icon: Plane },
    ],
  },
  {
    title: "My Business",
    items: [
      { label: "My Network", to: "/home", icon: Users },
      { label: "My Rank", to: "/home", icon: Trophy },
      { label: "Mission 1616", to: "/home", icon: Target },
      { label: "Membership", to: "/home", icon: Crown },
      { label: "My Orders", to: "/home", icon: Package },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", to: "/profile", icon: User },
      { label: "KYC Verification", to: "/profile", icon: BadgeCheck },
      { label: "Security Center", to: "/profile", icon: ShieldCheck },
      { label: "Notifications", to: "/profile", icon: Bell },
      { label: "Help & Support", to: "/profile", icon: LifeBuoy },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms & Conditions", to: "/profile", icon: FileText },
      { label: "Privacy Policy", to: "/profile", icon: Scale },
    ],
  },
];

export function NavDrawer({ open, onOpenChange }: NavDrawerProps) {
  const { signOut } = useAuth();
  const { member } = useMemberProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    onOpenChange(false);
    navigate("/login");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[86%] max-w-[340px] border-white/10 bg-card p-0">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <Logo size="sm" />
            {member && (
              <div className="mt-4 rounded-2xl border border-primary/25 bg-white/5 p-3">
                <p className="font-display text-sm font-bold">{member.full_name || "Member"}</p>
                <p className="mt-0.5 text-[11px] tracking-wider text-primary">{member.member_id}</p>
              </div>
            )}
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
            {sections.map((section) => (
              <div key={section.title} className="mb-5">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={`${section.title}-${item.label}`}
                      to={item.to}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/85 transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <item.icon className="h-[18px] w-[18px] text-primary/80" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 py-3 text-sm font-semibold text-destructive press"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
