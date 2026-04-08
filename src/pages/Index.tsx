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

function HighlightBanner() {
  const navigate = useNavigate();
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-primary text-primary-foreground cursor-pointer"
      onClick={() => navigate("/buy-challenge?type=instant_10")}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-sm md:text-base font-semibold">
        <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">New</span>
        <span>Get a $5,000 Funded Account for just $10</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HighlightBanner />
      <HeroBanner />
      <FundingModels />
      <Features />
      <RulesPreview />
      <HowItWorks />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2.5">
            <img src={pgLogo} alt="Prop Gym" className="w-9 h-9 rounded-lg object-contain" />
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
