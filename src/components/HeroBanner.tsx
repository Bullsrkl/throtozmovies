import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, ArrowRight, BarChart3, Target, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfitSplitDisplay() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 md:p-10 shadow-elevated text-center space-y-2">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl -z-10" />
        
        <span className="block text-4xl md:text-5xl lg:text-7xl font-extrabold text-primary leading-none">
          Keep
        </span>
        <span className="block text-6xl md:text-8xl lg:text-9xl font-black text-foreground leading-none">
          90%
        </span>
        
        {/* Teal arrow ribbon */}
        <div className="inline-flex items-center mt-2">
          <div
            className="relative bg-gradient-to-r from-primary to-primary-light px-6 py-2 md:px-8 md:py-3"
            style={{ clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 6% 50%)' }}
          >
            <span className="text-primary-foreground font-extrabold text-lg md:text-2xl tracking-wide uppercase">
              Profit Split
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden border-b border-border">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(168_80%_38%/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(35_40%_85%/0.3),transparent_50%)]" />

      {/* Floating particles */}
      <div className="absolute top-20 left-[10%] w-3 h-3 rounded-full bg-primary/20 animate-float" />
      <div className="absolute top-40 right-[15%] w-2 h-2 rounded-full bg-admin/20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-[30%] w-2 h-2 rounded-full bg-primary/15 animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Creamy Card Banner */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-elevated cream-hover">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Funded Trading Accounts
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6">
                <span className="block text-foreground">Start Trading Without</span>
                <span className="block bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  Your Own Money.
                </span>
                <span className="block text-foreground">Get Funded Today.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-8">
                Prop Gym provides rule-based funded trading accounts for skilled traders. Prove your skills, get funded, keep your profits.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-primary-light to-primary hover:opacity-90 text-primary-foreground text-lg px-8 py-6 h-auto font-semibold cream-ripple shimmer-btn bg-[length:200%_auto]"
                  onClick={() => navigate("/buy-challenge")}
                >
                  Get Funded
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/10 text-lg px-8 py-6 h-auto cream-ripple"
                  onClick={() => navigate("/rules")}
                >
                  Rules
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Profit Split Display */}
          <div className="relative">
            <ProfitSplitDisplay />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FundingModels() {
  const navigate = useNavigate();
  const models = [
    {
      icon: DollarSign,
      title: "$10 Instant Funded",
      description: "Start with just $10. Get a $5,000 funded account instantly.",
      tag: "Low Cost Entry",
      gradient: "gradient-card-amber",
      link: "/buy-challenge?type=instant_10",
    },
    {
      icon: Zap,
      title: "Instant Account",
      description: "Skip the evaluation. Get funded immediately with our instant funding option.",
      tag: "+20% premium",
      gradient: "gradient-card-amber",
      link: "/buy-challenge?type=instant",
    },
    {
      icon: Target,
      title: "1-Step Challenge",
      description: "Pass a single evaluation phase and receive your funded account.",
      tag: "Popular",
      gradient: "gradient-card-green",
      link: "/buy-challenge?type=one_step",
    },
    {
      icon: BarChart3,
      title: "2-Step Challenge",
      description: "Complete two evaluation phases at the lowest price point.",
      tag: "Best Value",
      gradient: "gradient-card-teal",
      link: "/buy-challenge?type=two_step",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Funding Models</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the evaluation path that suits your trading style
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {models.map((model, i) => (
            <Card
              key={i}
              className={`relative p-6 ${model.gradient} border-border hover:border-primary/30 transition-all cursor-pointer group cream-hover`}
              onClick={() => navigate(model.link)}
            >
              {(model.tag === "Popular" || model.tag === "Low Cost Entry") && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-xs font-semibold whitespace-nowrap">
                  {model.tag}
                </div>
              )}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <model.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold">{model.title}</h3>
                <p className="text-muted-foreground text-sm">{model.description}</p>
                {model.tag !== "Popular" && (
                  <span className="inline-block text-xs text-primary font-medium">{model.tag}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const features = [
    { icon: BarChart3, title: "Real Trading Evaluation", desc: "Trade on live market conditions with professional-grade tools and platforms." },
    { icon: Shield, title: "Fair Risk Rules", desc: "Clear and transparent rules. No hidden conditions or unfair restrictions." },
    { icon: Zap, title: "Instant Funding Access", desc: "Get your funded account within hours after passing the evaluation." },
    { icon: DollarSign, title: "Fast Withdrawals", desc: "Request payouts anytime. USDT withdrawals processed within 24 hours." },
  ];

  return (
    <section className="py-20 px-4 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Prop Gym?</h2>
          <p className="text-muted-foreground text-lg">Built for serious traders</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-xl gradient-card border border-border space-y-3 cream-hover">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const navigate = useNavigate();
  const steps = [
    { num: "01", title: "Buy Evaluation", desc: "Choose your account size and challenge type." },
    { num: "02", title: "Trade & Follow Rules", desc: "Trade with discipline. Respect drawdown limits and profit targets." },
    { num: "03", title: "Pass the Challenge", desc: "Hit your profit target within the trading rules." },
    { num: "04", title: "Get Funded", desc: "Receive your funded master account and start earning." },
  ];

  return (
    <section className="py-20 px-4 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Four simple steps to get funded</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center cream-glow">
                <span className="text-xl font-display font-bold text-primary">{s.num}</span>
              </div>
              <h3 className="font-display font-bold text-lg">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-8 py-6 h-auto text-lg font-semibold cream-ripple"
            onClick={() => navigate("/buy-challenge")}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Start Your Challenge
          </Button>
        </div>
      </div>
    </section>
  );
}
