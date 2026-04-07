import { Header } from "@/components/Header";
import pgLogo from "@/assets/pg-logo.png";
import { HeroBanner, FundingModels, Features, HowItWorks } from "@/components/HeroBanner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RulesPreview() {
  const navigate = useNavigate();
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Know the Rules Before You Trade</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Complete transparency on profit targets, drawdown limits, payout schedules, and the 30% consistency rule for instant accounts.
        </p>
        <Button
          size="lg"
          variant="outline"
          className="border-primary/20 hover:bg-primary/10 text-lg px-8 py-5 h-auto cream-ripple"
          onClick={() => navigate("/rules")}
        >
          View All Rules <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <FundingModels />
      <Features />
      <RulesPreview />
      <HowItWorks />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-card border border-primary/30 shadow-card flex items-center justify-center">
              <span className="text-lg font-display font-black text-primary leading-none">Pg</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-display font-bold text-foreground">Prop</span>
              <span className="text-xl font-display font-bold text-primary">Gym</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Rule-based funded trading accounts for skilled traders. Trade with discipline, get funded.
          </p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Prop Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
