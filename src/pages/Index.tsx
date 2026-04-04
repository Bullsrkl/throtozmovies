import { Header } from "@/components/Header";
import { HeroBanner, FundingModels, Features, PlatformRules, HowItWorks } from "@/components/HeroBanner";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <FundingModels />
      <Features />
      <PlatformRules />
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
