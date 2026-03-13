import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Award,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  className?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: BarChart3, label: "Trading Accounts", path: "/dashboard/accounts" },
  { icon: Trophy, label: "Competition", path: "/dashboard/competition" },
  { icon: Wallet, label: "Wallet", path: "/dashboard/wallet" },
  { icon: Award, label: "Certificates", path: "/dashboard/certificates" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <h2 className="font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Dashboard
            </h2>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center"
              )}
              activeClassName="bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary border-l-2 border-primary"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
