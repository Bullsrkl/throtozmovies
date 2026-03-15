import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, ShieldCheck, Clock, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Stats {
  activeAccounts: number;
  walletBalance: number;
  totalProfit: number;
  pendingPurchases: number;
}

interface RecentAccount {
  id: string;
  account_number: string;
  phase: string;
  status: string;
  balance: number;
  profit_percent: number;
  created_at: string;
}

export function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    activeAccounts: 0,
    walletBalance: 0,
    totalProfit: 0,
    pendingPurchases: 0,
  });
  const [recentAccounts, setRecentAccounts] = useState<RecentAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [accountsRes, walletRes, pendingRes] = await Promise.all([
        supabase
          .from("trading_accounts")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("wallets")
          .select("balance, total_earnings")
          .eq("user_id", user!.id)
          .single(),
        supabase
          .from("challenge_purchases")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .in("status", ["pending_payment", "payment_submitted"]),
      ]);

      const accounts = accountsRes.data || [];
      const active = accounts.filter((a) => a.status === "active" || a.status === "funded");
      const totalProfit = accounts.reduce((sum, a) => sum + (a.profit_percent || 0), 0);

      setStats({
        activeAccounts: active.length,
        walletBalance: walletRes.data?.balance || 0,
        totalProfit,
        pendingPurchases: pendingRes.count || 0,
      });
      setRecentAccounts(accounts.slice(0, 5));
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    funded: "bg-primary/20 text-primary",
    passed: "bg-blue-500/20 text-blue-400",
    failed: "bg-destructive/20 text-destructive",
  };

  const phaseLabel: Record<string, string> = {
    phase1: "Phase 1",
    phase2: "Phase 2",
    master: "Master",
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your trading overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAccounts}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.walletBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfit.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPurchases}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Accounts */}
      {recentAccounts.length > 0 ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{account.account_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {phaseLabel[account.phase] || account.phase} · ${account.balance.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{account.profit_percent}%</span>
                  <Badge className={statusColor[account.status] || "bg-muted text-muted-foreground"}>
                    {account.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">No Trading Accounts Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Buy a challenge to get started</p>
            </div>
            <Button
              className="bg-gradient-to-r from-primary to-primary/80"
              onClick={() => navigate("/buy-challenge")}
            >
              Buy Challenge
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
