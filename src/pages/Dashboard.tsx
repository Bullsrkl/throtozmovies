import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Overview } from "@/components/dashboard/Overview";
import { Wallet } from "@/components/dashboard/Wallet";
import { Settings } from "@/components/dashboard/Settings";
import { TradingAccounts } from "@/components/dashboard/TradingAccounts";
import { Competition } from "@/components/dashboard/Competition";
import { Certificates } from "@/components/dashboard/Certificates";
import { Referral } from "@/components/dashboard/Referral";
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        <DashboardSidebar className="hidden md:block" />
        <main className="flex-1 p-6 md:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="accounts" element={<TradingAccounts />} />
            <Route path="competition" element={<Competition />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
