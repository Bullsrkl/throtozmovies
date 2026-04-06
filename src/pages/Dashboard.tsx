import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Overview } from "@/components/dashboard/Overview";
import { Wallet } from "@/components/dashboard/Wallet";
import { Settings } from "@/components/dashboard/Settings";
import { TradingAccounts } from "@/components/dashboard/TradingAccounts";
import { Competition } from "@/components/dashboard/Competition";
import { Certificates } from "@/components/dashboard/Certificates";
import { Referral } from "@/components/dashboard/Referral";
import { History } from "@/components/dashboard/History";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const mobileMenuItems = [
    { label: "Overview", path: "/dashboard", end: true },
    { label: "Accounts", path: "/dashboard/accounts" },
    { label: "Competition", path: "/dashboard/competition" },
    { label: "Wallet", path: "/dashboard/wallet" },
    { label: "Certificates", path: "/dashboard/certificates" },
    { label: "Refer & Earn", path: "/dashboard/referral" },
    { label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Mobile nav */}
      <div className="md:hidden overflow-x-auto border-b border-border bg-card">
        <div className="flex gap-1 p-2 min-w-max">
          {mobileMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="px-3 py-1.5 text-sm rounded-full whitespace-nowrap text-muted-foreground hover:bg-accent"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex w-full">
        <DashboardSidebar className="hidden md:block" />
        <main className="flex-1 p-6 md:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="accounts" element={<TradingAccounts />} />
            <Route path="competition" element={<Competition />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="referral" element={<Referral />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
