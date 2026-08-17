import { ReactNode, useState } from "react";
import { MobileShell } from "@/components/mww/MobileShell";
import { AppTopBar } from "@/components/mww/AppTopBar";
import { BottomNav } from "@/components/mww/BottomNav";
import { NavDrawer } from "@/components/mww/NavDrawer";
import { useMemberProfile } from "@/hooks/useMemberProfile";

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { member } = useMemberProfile();

  return (
    <MobileShell withBottomNav>
      <AppTopBar
        onMenu={() => setMenuOpen(true)}
        name={member?.full_name}
        avatarUrl={member?.avatar_url}
      />
      <NavDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <main className="flex-1 px-4 py-4">{children}</main>
      <BottomNav />
    </MobileShell>
  );
}
