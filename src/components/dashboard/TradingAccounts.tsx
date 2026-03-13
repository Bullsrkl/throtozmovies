import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3 } from "lucide-react";

interface TradingAccount {
  id: string;
  account_number: string;
  server: string;
  platform: string;
  phase: string;
  balance: number;
  profit_percent: number;
  daily_drawdown: number;
  overall_drawdown: number;
  trading_days: number;
  profit_target: number;
  status: string;
}

export function TradingAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setAccounts((data as TradingAccount[]) || []);
    setLoading(false);
  };

  const phaseLabel = (phase: string) => {
    if (phase === "phase1") return "Phase 1";
    if (phase === "phase2") return "Phase 2";
    return "Master";
  };

  const statusColor = (status: string) => {
    if (status === "active") return "bg-primary/10 text-primary";
    if (status === "passed") return "bg-green-500/10 text-green-500";
    if (status === "funded") return "bg-premium/10 text-premium";
    return "bg-destructive/10 text-destructive";
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Trading Accounts</h1>
        <p className="text-muted-foreground">Track your evaluation progress</p>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-12 space-y-3">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-display font-bold">No Trading Accounts Yet</h3>
            <p className="text-muted-foreground text-sm">Purchase a challenge to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {accounts.map((acc) => (
            <Card key={acc.id} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display">Account #{acc.account_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">{acc.platform} • {acc.server}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusColor(acc.status)}>{acc.status}</Badge>
                  <Badge variant="outline">{phaseLabel(acc.phase)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-lg font-bold">${acc.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Profit</p>
                    <p className={`text-lg font-bold ${acc.profit_percent >= 0 ? "text-primary" : "text-destructive"}`}>
                      {acc.profit_percent >= 0 ? "+" : ""}{acc.profit_percent}%
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Daily DD</p>
                    <p className="text-lg font-bold">{acc.daily_drawdown}%</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Max DD</p>
                    <p className="text-lg font-bold">{acc.overall_drawdown}%</p>
                  </div>
                </div>

                {acc.profit_target > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Profit Target</span>
                      <span className="text-primary">{acc.profit_percent}% / {acc.profit_target}%</span>
                    </div>
                    <Progress value={Math.min((acc.profit_percent / acc.profit_target) * 100, 100)} className="h-2" />
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trading Days</span>
                  <span className="font-medium">{acc.trading_days} / 5 min</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
