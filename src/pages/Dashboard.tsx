import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Overview } from "@/components/dashboard/Overview";
import { MyUploads } from "@/components/dashboard/MyUploads";
import { Wallet } from "@/components/dashboard/Wallet";
import { Analytics } from "@/components/dashboard/Analytics";
import { SubscriptionManagement } from "@/components/dashboard/SubscriptionManagement";
import { PromotionRequests } from "@/components/dashboard/PromotionRequests";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        <DashboardSidebar />
        
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="uploads" element={<MyUploads />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="promotions" element={<PromotionRequests />} />
            <Route path="settings" element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-display font-bold mb-4">Settings</h2>
                <p className="text-muted-foreground">Coming soon</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
