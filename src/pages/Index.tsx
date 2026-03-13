import { Header } from "@/components/Header";
import { HeroBanner, FundingModels, Features, HowItWorks } from "@/components/HeroBanner";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <FundingModels />
      <Features />
      <HowItWorks />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center space-y-4">
          <h3 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Prop Gym
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Rule-based funded trading accounts for skilled traders. Trade with discipline, get funded.
          </p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Prop Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
