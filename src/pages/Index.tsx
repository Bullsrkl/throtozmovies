import { Header } from "@/components/Header";
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/20 shadow-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M6.5 6.5h11v3h-11z" fill="currentColor" opacity="0.3"/>
              <path d="M3 12h3v8H3zM18 12h3v8h-3zM6 6a2 2 0 012-2h8a2 2 0 012 2v4H6V6zM8 10v10M16 10v10M6 14h12M6 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Prop Gym
            </span>
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
