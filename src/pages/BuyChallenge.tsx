import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Target, BarChart3, ArrowRight, DollarSign, Crown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ACCOUNT_SIZES = [5000, 10000, 30000, 50000, 100000, 500000];

const SIZE_LABELS: Record<number, string> = {
  5000: "$5K", 10000: "$10K", 30000: "$30K", 50000: "$50K", 100000: "$100K", 500000: "$500K",
};

const BASE_PRICES: Record<number, number> = {
  5000: 28, 10000: 49, 30000: 90, 50000: 169, 100000: 210, 500000: 350,
};

function getPrice(size: number, type: string): number {
  if (type === "instant_10") return 10;
  if (type === "king_maker") return 150;
  const base = BASE_PRICES[size];
  if (type === "one_step") return Math.round(base * 1.1 * 10) / 10;
  if (type === "instant") return Math.round(base * 1.2 * 10) / 10;
  return base;
}

const CHALLENGE_TYPES = [
  { value: "two_step", label: "2-Step", icon: BarChart3, gradient: "gradient-card-teal" },
  { value: "one_step", label: "1-Step", icon: Target, gradient: "gradient-card-green" },
  { value: "instant", label: "Instant", icon: Zap, gradient: "gradient-card-amber" },
  { value: "instant_10", label: "$10 Instant", icon: DollarSign, gradient: "gradient-card-amber" },
  { value: "king_maker", label: "King Maker", icon: Crown, gradient: "gradient-card-teal" },
];

const RULES: Record<string, { profitTarget: string; phase2: string; dailyDD: string; overallDD: string; minDays: string; consistency: string; profitSplit: string; profitLimit?: string }> = {
  two_step: { profitTarget: "8%", phase2: "5%", dailyDD: "5%", overallDD: "10%", minDays: "5 Days", consistency: "No", profitSplit: "Up to 90%" },
  one_step: { profitTarget: "10%", phase2: "—", dailyDD: "5%", overallDD: "10%", minDays: "5 Days", consistency: "No", profitSplit: "Up to 90%" },
  instant: { profitTarget: "—", phase2: "—", dailyDD: "5%", overallDD: "10%", minDays: "—", consistency: "30% at withdrawal", profitSplit: "Up to 90%" },
  instant_10: { profitTarget: "—", phase2: "—", dailyDD: "3%", overallDD: "6%", minDays: "3 Days", consistency: "30% at withdrawal", profitSplit: "Up to 80%", profitLimit: "3% daily / 6% max" },
  king_maker: { profitTarget: "—", phase2: "—", dailyDD: "5%", overallDD: "10%", minDays: "—", consistency: "No", profitSplit: "Up to 90%" },
};

export default function BuyChallenge() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "two_step";
  const [challengeType, setChallengeType] = useState(initialType);
  const [selectedSize, setSelectedSize] = useState(50000);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isInstant10 = challengeType === "instant_10";
  const isKingMaker = challengeType === "king_maker";
  const effectiveSize = isInstant10 ? 5000 : isKingMaker ? 30000 : selectedSize;
  const price = getPrice(effectiveSize, challengeType);
  const rules = RULES[challengeType];
  const currentTypeConfig = CHALLENGE_TYPES.find((c) => c.value === challengeType)!;

  const handleBuy = () => {
    if (!user) { navigate("/auth"); return; }
    if (isInstant10) {
      navigate(`/checkout?size=5000&type=instant_10`);
    } else {
      navigate(`/checkout?size=${effectiveSize}&type=${challengeType}`);
    }
  };

  const features = isInstant10
    ? [
        "No Evaluation Required",
        "3% Daily Drawdown",
        "6% Max Drawdown",
        "Profit Limit: 3% daily / 6% max (breach if exceeded)",
        "Min 3 Trading Days",
        "30% Consistency Rule (at withdrawal)",
        "Profit Split up to 80%",
        "Withdrawals: Tuesday only, $50/week",
      ]
    : [
        ...(challengeType === "two_step"
          ? [`Phase 1: ${rules.profitTarget} Profit Target`, `Phase 2: ${rules.phase2} Profit Target`]
          : challengeType === "one_step"
          ? [`${rules.profitTarget} Profit Target`]
          : ["No Evaluation Required"]),
        `${rules.dailyDD} Daily Drawdown`,
        `${rules.overallDD} Max Drawdown`,
        ...(challengeType !== "instant" ? [`Min ${rules.minDays} Trading Days`] : []),
        challengeType === "instant" ? "30% Consistency Rule (at withdrawal)" : "No Consistency Rule",
        `Profit Split ${rules.profitSplit}`,
      ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Choose Your Challenge</h1>
          <p className="text-muted-foreground">Select your evaluation type and account size</p>
        </div>

        {/* Challenge Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap rounded-xl border border-border bg-card p-1 gap-1">
            {CHALLENGE_TYPES.map((ct) => {
              const Icon = ct.icon;
              const isActive = challengeType === ct.value;
              return (
                <button
                  key={ct.value}
                  onClick={() => setChallengeType(ct.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {ct.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Size Selector — hidden for instant_10 */}
        {!isInstant10 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ACCOUNT_SIZES.map((size) => {
              const isActive = selectedSize === size;
              const isPopular = size === 50000;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {SIZE_LABELS[size]}
                  {isPopular && (
                    <span className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                      HOT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Feature Card */}
        <Card className={`relative ${currentTypeConfig.gradient} border-primary/20 shadow-elevated mb-8 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs border-primary/30">
                  {currentTypeConfig.label} Challenge
                </Badge>
                {isInstant10 && (
                  <Badge className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-xs">
                    Low Cost Entry
                  </Badge>
                )}
              </div>
              <h2 className="text-4xl font-display font-bold mb-1">${effectiveSize.toLocaleString()}</h2>
              <p className="text-sm text-muted-foreground mb-4">Account Size</p>
              <div className="inline-flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-primary">${price}</span>
                <span className="text-muted-foreground text-sm">USD</span>
              </div>
            </div>

            <div className="space-y-2.5 max-w-sm mx-auto mb-6">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-display font-bold gap-2 cream-ripple"
              onClick={handleBuy}
            >
              Buy Challenge <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="border-border gradient-card">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Rule</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Phase 1 Profit Target", rules.profitTarget],
                  ["Phase 2 Profit Target", rules.phase2],
                  ["Daily Drawdown Limit", rules.dailyDD],
                  ["Overall Drawdown Limit", rules.overallDD],
                  ["Min Trading Days", rules.minDays],
                  ["Consistency Rule", rules.consistency],
                  ["Profit Split", rules.profitSplit],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border last:border-0">
                    <td className="p-4 text-muted-foreground">{label}</td>
                    <td className="p-4 text-right font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
