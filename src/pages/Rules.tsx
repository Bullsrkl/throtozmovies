import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Clock, BarChart3, Ban, Scale, RefreshCw, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const typeLabels: Record<string, string> = {
  two_step: "2-Step Challenge",
  one_step: "1-Step Challenge",
  instant: "Instant Funding",
};

export default function Rules() {
  const { data: plans = [] } = useQuery({
    queryKey: ["challenge-plans-rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("challenge_plans")
        .select("*")
        .order("account_size", { ascending: true });
      return data || [];
    },
  });

  const generalRules = [
    { icon: DollarSign, title: "Profit Split", desc: "Up to 90% profit split on your funded account earnings." },
    { icon: Clock, title: "First Payout", desc: "First payout after 14 calendar days. Then on-demand every 7 days." },
    { icon: BarChart3, title: "Platform", desc: "Trade on MetaTrader 5 with real market conditions." },
    { icon: Ban, title: "Restrictions", desc: "No martingale, no HFT, no copy trading between accounts." },
    { icon: Scale, title: "Scaling", desc: "Account scaling available after 3 consecutive profitable months." },
    { icon: RefreshCw, title: "Refund Policy", desc: "No refunds after evaluation begins. Fee is non-refundable." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Platform Rules & Guidelines</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete transparency. Know every rule before you start trading.
          </p>
        </div>

        {/* Rules by challenge type */}
        <Tabs defaultValue="two_step" className="mb-12">
          <TabsList className="w-full justify-center bg-card border border-border mb-6">
            <TabsTrigger value="two_step" className="flex-1">2-Step</TabsTrigger>
            <TabsTrigger value="one_step" className="flex-1">1-Step</TabsTrigger>
            <TabsTrigger value="instant" className="flex-1">Instant</TabsTrigger>
            <TabsTrigger value="instant_10" className="flex-1">$10 Instant</TabsTrigger>
          </TabsList>

          {["two_step", "one_step", "instant", "instant_10"].map((type) => {
            const typePlans = type === "instant_10"
              ? plans.filter((p) => p.challenge_type === "instant" && p.price_usd === 10 && p.account_size === 5000)
              : type === "instant"
              ? plans.filter((p) => p.challenge_type === "instant" && !(p.price_usd === 10 && p.account_size === 5000))
              : plans.filter((p) => p.challenge_type === type);
            return (
              <TabsContent key={type} value={type}>
                <Card className="overflow-hidden border-border gradient-card cream-hover mb-6">
                  <div className="p-4 bg-primary/5 border-b border-border">
                    <h3 className="font-display font-bold text-lg">{typeLabels[type]}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-3 font-medium text-muted-foreground">Account Size</th>
                          <th className="text-center p-3 font-medium text-muted-foreground">Phase 1 Target</th>
                          <th className="text-center p-3 font-medium text-muted-foreground">Phase 2 Target</th>
                          <th className="text-center p-3 font-medium text-muted-foreground">Daily DD</th>
                          <th className="text-center p-3 font-medium text-muted-foreground">Max DD</th>
                          <th className="text-center p-3 font-medium text-muted-foreground">Min Days</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {typePlans.map((plan) => (
                          <tr key={plan.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-semibold">${plan.account_size.toLocaleString()}</td>
                            <td className="p-3 text-center text-primary font-medium">{plan.profit_target_phase1}%</td>
                            <td className="p-3 text-center">{type === "instant" ? "—" : `${plan.profit_target_phase2}%`}</td>
                            <td className="p-3 text-center">{plan.daily_drawdown_limit}%</td>
                            <td className="p-3 text-center">{plan.overall_drawdown_limit}%</td>
                            <td className="p-3 text-center">{type === "instant" ? "—" : plan.min_trading_days}</td>
                            <td className="p-3 text-right font-bold text-primary">${plan.price_usd}</td>
                          </tr>
                        ))}
                        {typePlans.length === 0 && (
                          <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No plans available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Type-specific detailed rules */}
                {type === "two_step" && (
                  <Card className="gradient-card p-6 space-y-4">
                    <h4 className="font-display font-bold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> 2-Step Challenge Rules</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>• <strong className="text-foreground">Phase 1:</strong> Achieve the profit target (8%) while respecting daily (5%) and overall (10%) drawdown limits. Minimum 5 trading days required.</p>
                      <p>• <strong className="text-foreground">Phase 2:</strong> Achieve 5% profit target with same drawdown rules. Minimum 5 trading days required.</p>
                      <p>• <strong className="text-foreground">Funded Account:</strong> After passing both phases, receive a Master (funded) account with up to 90% profit split.</p>
                      <p>• <strong className="text-foreground">Payout Eligibility:</strong> First withdrawal after 14 calendar days of funded trading. Subsequent payouts every 7 days.</p>
                      <p>• <strong className="text-foreground">Balance Maintenance:</strong> Must maintain balance above the drawdown threshold at all times. Falling below triggers account breach warning.</p>
                      <p>• <strong className="text-foreground">Account Breach:</strong> If daily or overall drawdown is violated, account will be breached. An email alert is sent before breach when account is near limits.</p>
                      <p>• <strong className="text-foreground">No Consistency Rule:</strong> No consistency rule applies for 2-Step accounts.</p>
                    </div>
                  </Card>
                )}

                {type === "one_step" && (
                  <Card className="gradient-card p-6 space-y-4">
                    <h4 className="font-display font-bold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> 1-Step Challenge Rules</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>• <strong className="text-foreground">Single Phase:</strong> Achieve 10% profit target while respecting daily (5%) and overall (10%) drawdown limits. Minimum 5 trading days.</p>
                      <p>• <strong className="text-foreground">Funded Account:</strong> After passing, receive a Master account with up to 90% profit split.</p>
                      <p>• <strong className="text-foreground">Payout Eligibility:</strong> First withdrawal after 14 calendar days. Subsequent payouts every 7 days.</p>
                      <p>• <strong className="text-foreground">Balance Maintenance:</strong> Maintain estimated balance above drawdown threshold at all times.</p>
                      <p>• <strong className="text-foreground">Account Breach:</strong> Violating drawdown rules triggers breach. Warning email sent when approaching limits.</p>
                      <p>• <strong className="text-foreground">No Consistency Rule:</strong> No consistency rule applies for 1-Step accounts.</p>
                    </div>
                  </Card>
                )}

                {type === "instant" && (
                  <Card className="gradient-card p-6 space-y-4">
                    <h4 className="font-display font-bold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Instant Funded Account Rules</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>• <strong className="text-foreground">No Evaluation:</strong> Get funded immediately. No profit target to pass — start trading with real funds right away.</p>
                      <p>• <strong className="text-foreground">Drawdown Rules:</strong> Daily drawdown limit 5%, Overall drawdown limit 10% still apply.</p>
                      <p>• <strong className="text-foreground">Payout Eligibility:</strong> First withdrawal after 14 calendar days. Subsequent payouts every 7 days.</p>
                      <p>• <strong className="text-foreground">Profit Split:</strong> Up to 90% profit split on withdrawals.</p>
                    </div>

                    {/* 30% Consistency Rule */}
                    <div className="mt-6 p-5 rounded-xl bg-admin/5 border border-admin/20 space-y-4">
                      <h5 className="font-display font-bold text-lg flex items-center gap-2 text-admin">
                        <AlertTriangle className="h-5 w-5" /> 30% Consistency Rule (Instant Accounts Only)
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        The 30% Consistency Rule is a risk management rule for instant funded accounts to ensure consistent trading performance rather than relying on a single large winning day.
                      </p>

                      <div className="space-y-2 text-sm">
                        <p><strong className="text-foreground">Rule Definition:</strong> The profit made in a single trading day must not exceed 30% of the total accumulated profit.</p>
                        <p><strong className="text-foreground">Formula:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">Max Profit in a Day ≤ 30% of Total Profit</code></p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">When is it evaluated?</p>
                        <p className="text-muted-foreground">The rule is <strong className="text-primary">strictly evaluated at the time of withdrawal only</strong>. It does NOT cause account breach. Trading can continue normally.</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-destructive text-sm">
                            <XCircle className="h-4 w-4" /> Violation Example
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Total Profit = $1,000</p>
                            <p>Highest Single Day Profit = $400</p>
                            <p>30% of Total = $300</p>
                            <p className="text-destructive font-medium">$400 &gt; $300 → Withdrawal REJECTED</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-primary text-sm">
                            <CheckCircle className="h-4 w-4" /> Valid Example
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Total Profit = $1,000</p>
                            <p>Highest Single Day Profit = $250</p>
                            <p>30% of Total = $300</p>
                            <p className="text-primary font-medium">$250 ≤ $300 → Withdrawal APPROVED</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-admin/5 border border-admin/20 space-y-2 mt-2">
                        <div className="flex items-center gap-2 font-semibold text-admin text-sm">
                          <RefreshCw className="h-4 w-4" /> Adjustment Example
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Highest Single Day Profit = $400</p>
                          <p>Current Total Profit = $1,000 → 30% = $300 (violating)</p>
                          <p>Continue trading → Total Profit grows to $1,500</p>
                          <p>30% of $1,500 = $450</p>
                          <p className="text-primary font-medium">$400 ≤ $450 → Now VALID for withdrawal!</p>
                        </div>
                      </div>

                      <div className="text-sm space-y-2 mt-4">
                        <p className="font-semibold text-foreground">Purpose of the Rule:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Ensure the trader is consistent and disciplined</li>
                          <li>Prevent gambling behavior or excessive risk-taking</li>
                          <li>Promote steady and controlled growth</li>
                        </ul>
                      </div>

                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-foreground">Key Guidelines for Withdrawal:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Avoid generating a large portion of profit in a single day</li>
                          <li>Maintain consistent daily profits across multiple days</li>
                          <li>Lot size and risk should remain relatively stable</li>
                          <li>Before requesting withdrawal, ensure compliance with the 30% rule</li>
                          <li>If needed, continue trading to increase total profit and balance the ratio</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* General Rules */}
        <div className="mb-12">
          <h3 className="text-2xl font-display font-bold mb-6 text-center">General Rules</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalRules.map((rule, i) => (
              <div key={i} className="p-5 rounded-xl gradient-card border border-border space-y-2 cream-hover">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <rule.icon className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-display font-bold">{rule.title}</h4>
                <p className="text-muted-foreground text-sm">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Breach Policy */}
        <Card className="gradient-card p-6 space-y-4">
          <h4 className="font-display font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Account Breach Policy
          </h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• When your account approaches drawdown limits, you will receive an <strong className="text-foreground">email alert</strong> on your registered email warning that your account is near breach.</p>
            <p>• If any rule is violated (daily drawdown, overall drawdown), the account will be <strong className="text-destructive">breached</strong> and trading will be disabled.</p>
            <p>• The breach process is <strong className="text-foreground">not immediate</strong> — you get fair warning before final breach to protect platform trust.</p>
            <p>• The 30% Consistency Rule (Instant accounts only) does <strong className="text-foreground">NOT</strong> cause account breach — it only affects withdrawal eligibility.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
