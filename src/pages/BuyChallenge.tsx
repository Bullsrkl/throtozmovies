import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Zap, Target, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ACCOUNT_SIZES = [5000, 10000, 30000, 50000, 100000, 500000];

const BASE_PRICES: Record<number, number> = {
  5000: 28,
  10000: 49,
  30000: 90,
  50000: 169,
  100000: 210,
  500000: 350,
};

function getPrice(size: number, type: string): number {
  const base = BASE_PRICES[size];
  if (type === "one_step") return Math.round(base * 1.1 * 10) / 10;
  if (type === "instant") return Math.round(base * 1.2 * 10) / 10;
  return base;
}

export default function BuyChallenge() {
  const [challengeType, setChallengeType] = useState("two_step");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBuy = (size: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // TODO: Phase 2 — open USDT payment flow
    navigate(`/checkout?size=${size}&type=${challengeType}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section id="pricing-section" className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Choose Your Challenge</h1>
          <p className="text-muted-foreground text-lg">Select your evaluation type and account size</p>
        </div>

        <Tabs value={challengeType} onValueChange={setChallengeType} className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8 bg-card border border-border">
            <TabsTrigger value="two_step" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground gap-2">
              <BarChart3 className="h-4 w-4" />
              2-Step
            </TabsTrigger>
            <TabsTrigger value="one_step" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground gap-2">
              <Target className="h-4 w-4" />
              1-Step
            </TabsTrigger>
            <TabsTrigger value="instant" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground gap-2">
              <Zap className="h-4 w-4" />
              Instant
            </TabsTrigger>
          </TabsList>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACCOUNT_SIZES.map((size) => {
              const price = getPrice(size, challengeType);
              const isPopular = size === 50000;
              return (
                <Card key={size} className={`relative border ${isPopular ? "border-primary/50 shadow-[0_0_20px_-5px_hsl(168_80%_45%/0.3)]" : "border-border"}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-display">${size.toLocaleString()}</CardTitle>
                    <p className="text-muted-foreground text-sm">Account Size</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-display font-bold text-primary">${price}</span>
                      <span className="text-muted-foreground text-sm ml-1">USD</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {challengeType === "two_step" && (
                        <>
                          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Phase 1: 8% Profit Target</span></div>
                          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Phase 2: 5% Profit Target</span></div>
                        </>
                      )}
                      {challengeType === "one_step" && (
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>10% Profit Target</span></div>
                      )}
                      {challengeType === "instant" && (
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>No Evaluation Required</span></div>
                      )}
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>5% Daily Drawdown</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>10% Max Drawdown</span></div>
                      {challengeType !== "instant" && (
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Min 5 Trading Days</span></div>
                      )}
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>No Consistency Rule</span></div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground"
                      onClick={() => handleBuy(size)}
                    >
                      Buy Challenge
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Tabs>
      </section>
    </div>
  );
}
