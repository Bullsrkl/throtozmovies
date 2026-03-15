import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  BarChart3,
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  KeyRound,
  Target,
  CalendarDays,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ChallengePlan {
  daily_drawdown_limit: number;
  overall_drawdown_limit: number;
  min_trading_days: number;
  profit_target_phase1: number;
  profit_target_phase2: number;
  account_size: number;
  challenge_type: string;
}

interface TradingAccount {
  id: string;
  account_number: string;
  server: string;
  platform: string;
  password: string;
  phase: string;
  balance: number;
  profit_percent: number;
  daily_drawdown: number;
  overall_drawdown: number;
  trading_days: number;
  profit_target: number;
  status: string;
  challenge_purchases?: {
    plan_id: string;
    challenge_plans: ChallengePlan;
  };
}

export function TradingAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from("trading_accounts")
      .select("*, challenge_purchases!inner(plan_id, challenge_plans!inner(*))")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setAccounts((data as unknown as TradingAccount[]) || []);
    setLoading(false);
  };

  const selectedAccount = accounts.find((a) => a.id === selectedId);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
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

  const ddColor = (used: number, limit: number) => {
    const pct = limit > 0 ? (used / limit) * 100 : 0;
    if (pct >= 80) return "text-destructive";
    if (pct >= 50) return "text-yellow-500";
    return "text-primary";
  };

  const ddBarClass = (used: number, limit: number) => {
    const pct = limit > 0 ? (used / limit) * 100 : 0;
    if (pct >= 80) return "[&>div]:bg-destructive";
    if (pct >= 50) return "[&>div]:bg-yellow-500";
    return "";
  };

  const ruleStatus = (current: number, target: number, isDrawdown = false) => {
    if (isDrawdown) {
      const pct = target > 0 ? (current / target) * 100 : 0;
      if (pct >= 100) return "failed";
      if (pct >= 80) return "warning";
      return "safe";
    }
    if (current >= target) return "passed";
    return "in_progress";
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  // ── Detail View ──
  if (selectedAccount) {
    const plan = selectedAccount.challenge_purchases?.challenge_plans;
    const ddLimit = plan?.daily_drawdown_limit ?? 5;
    const odLimit = plan?.overall_drawdown_limit ?? 10;
    const minDays = plan?.min_trading_days ?? 5;
    const profitTarget =
      selectedAccount.phase === "phase2"
        ? (plan?.profit_target_phase2 ?? 5)
        : (plan?.profit_target_phase1 ?? 8);

    const rules = [
      {
        label: "Profit Target",
        icon: Target,
        current: selectedAccount.profit_percent,
        target: profitTarget,
        suffix: "%",
        status: ruleStatus(selectedAccount.profit_percent, profitTarget),
      },
      {
        label: "Min Trading Days",
        icon: CalendarDays,
        current: selectedAccount.trading_days,
        target: minDays,
        suffix: " days",
        status: ruleStatus(selectedAccount.trading_days, minDays),
      },
      {
        label: "Daily Drawdown",
        icon: TrendingDown,
        current: selectedAccount.daily_drawdown,
        target: ddLimit,
        suffix: "%",
        status: ruleStatus(selectedAccount.daily_drawdown, ddLimit, true),
      },
      {
        label: "Overall Drawdown",
        icon: ShieldAlert,
        current: selectedAccount.overall_drawdown,
        target: odLimit,
        suffix: "%",
        status: ruleStatus(selectedAccount.overall_drawdown, odLimit, true),
      },
    ];

    return (
      <div className="space-y-6">
        {/* Back button + header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedId(null); setShowPassword(false); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Account #{selectedAccount.account_number}</h1>
            <p className="text-sm text-muted-foreground">{selectedAccount.platform} • {selectedAccount.server}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={statusColor(selectedAccount.status)}>{selectedAccount.status}</Badge>
            <Badge variant="outline">{phaseLabel(selectedAccount.phase)}</Badge>
          </div>
        </div>

        {/* Section A — Credentials */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              {selectedAccount.platform} Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Account Number", value: selectedAccount.account_number },
                { label: "Server", value: selectedAccount.server },
                { label: "Platform", value: selectedAccount.platform },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-mono text-sm font-medium">{item.value}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(item.value, item.label)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {/* Password field */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="font-mono text-sm font-medium">
                    {showPassword ? selectedAccount.password : "••••••••"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(selectedAccount.password, "Password")}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section B — Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-xl font-bold">${selectedAccount.balance.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Profit</p>
              <p className={`text-xl font-bold ${selectedAccount.profit_percent >= 0 ? "text-primary" : "text-destructive"}`}>
                {selectedAccount.profit_percent >= 0 ? "+" : ""}{selectedAccount.profit_percent}%
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Trading Days</p>
              <p className="text-xl font-bold">{selectedAccount.trading_days} <span className="text-sm text-muted-foreground">/ {minDays} min</span></p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Account Size</p>
              <p className="text-xl font-bold">${(plan?.account_size ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Section C — Drawdown Bars */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Drawdown Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Daily DD */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Daily Drawdown</span>
                <span className={ddColor(selectedAccount.daily_drawdown, ddLimit)}>
                  {selectedAccount.daily_drawdown}% / {ddLimit}%
                </span>
              </div>
              <Progress
                value={Math.min((selectedAccount.daily_drawdown / ddLimit) * 100, 100)}
                className={`h-3 ${ddBarClass(selectedAccount.daily_drawdown, ddLimit)}`}
              />
            </div>
            {/* Overall DD */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Overall Drawdown</span>
                <span className={ddColor(selectedAccount.overall_drawdown, odLimit)}>
                  {selectedAccount.overall_drawdown}% / {odLimit}%
                </span>
              </div>
              <Progress
                value={Math.min((selectedAccount.overall_drawdown / odLimit) * 100, 100)}
                className={`h-3 ${ddBarClass(selectedAccount.overall_drawdown, odLimit)}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section D — Trading Rules */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Trading Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rules.map((rule) => {
                const Icon = rule.icon;
                const StatusIcon =
                  rule.status === "passed" || rule.status === "safe"
                    ? CheckCircle2
                    : rule.status === "warning"
                    ? AlertTriangle
                    : rule.status === "failed"
                    ? XCircle
                    : BarChart3;
                const statusClr =
                  rule.status === "passed" || rule.status === "safe"
                    ? "text-primary"
                    : rule.status === "warning"
                    ? "text-yellow-500"
                    : rule.status === "failed"
                    ? "text-destructive"
                    : "text-muted-foreground";

                return (
                  <div key={rule.label} className="rounded-lg border border-border bg-background p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {rule.label}
                      </div>
                      <StatusIcon className={`h-4 w-4 ${statusClr}`} />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-bold ${statusClr}`}>{rule.current}{rule.suffix}</span>
                      <span className="text-xs text-muted-foreground">/ {rule.target}{rule.suffix}</span>
                    </div>
                    <Progress
                      value={Math.min((rule.current / rule.target) * 100, 100)}
                      className="h-1.5"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── List View ──
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
        <div className="grid gap-4">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className="border-border cursor-pointer transition-colors hover:border-primary/40"
              onClick={() => setSelectedId(acc.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold">Account #{acc.account_number}</p>
                    <p className="text-xs text-muted-foreground">{acc.platform} • {phaseLabel(acc.phase)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold">${acc.balance.toLocaleString()}</p>
                    <p className={`text-xs font-medium ${acc.profit_percent >= 0 ? "text-primary" : "text-destructive"}`}>
                      {acc.profit_percent >= 0 ? "+" : ""}{acc.profit_percent}%
                    </p>
                  </div>
                  <Badge className={statusColor(acc.status)}>{acc.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
