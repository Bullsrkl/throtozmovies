import { AppLayout } from "@/components/mww/AppLayout";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BadgeCheck, Bell, ChevronRight, Crown, LifeBuoy, LogOut, ShieldCheck, User } from "lucide-react";

const rows = [
  { label: "KYC Verification", icon: BadgeCheck },
  { label: "Membership", icon: Crown },
  { label: "Security Center", icon: ShieldCheck },
  { label: "Notifications", icon: Bell },
  { label: "Help & Support", icon: LifeBuoy },
];

export default function Profile() {
  const { member } = useMemberProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <AppLayout>
      <div className="glass-card flex items-center gap-4 p-5">
        <span className="grid h-16 w-16 place-items-center rounded-2xl gold-surface font-display text-2xl font-extrabold text-primary-foreground">
          {(member?.full_name || "M").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">{member?.full_name || "Member"}</p>
          <p className="text-xs tracking-wider text-primary">{member?.member_id || "—"}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {member?.city || "—"}{member?.state ? `, ${member.state}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="glass-card flex items-center gap-3 p-4">
          <User className="h-[18px] w-[18px] text-primary" />
          <span className="flex-1 text-sm">Edit Profile</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        {rows.map((r) => (
          <div key={r.label} className="glass-card flex items-center gap-3 p-4">
            <r.icon className="h-[18px] w-[18px] text-primary" />
            <span className="flex-1 text-sm">{r.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 py-3.5 text-sm font-semibold text-destructive press"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </AppLayout>
  );
}
