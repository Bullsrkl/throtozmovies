import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, ArrowRight, BarChart3, Target, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TraderIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow background */}
      <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl -z-10" />
      
      <svg viewBox="0 0 500 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Desk */}
        <rect x="100" y="280" width="300" height="12" rx="6" fill="hsl(30 25% 78%)" />
        <rect x="180" y="292" width="16" height="60" rx="4" fill="hsl(30 20% 72%)" />
        <rect x="304" y="292" width="16" height="60" rx="4" fill="hsl(30 20% 72%)" />
        
        {/* Laptop body */}
        <rect x="150" y="210" width="200" height="130" rx="8" fill="hsl(30 15% 35%)" className="drop-shadow-lg" />
        <rect x="158" y="218" width="184" height="100" rx="4" fill="hsl(168 60% 96%)" />
        
        {/* Laptop screen - profit graph */}
        <line x1="170" y1="300" x2="330" y2="300" stroke="hsl(30 20% 85%)" strokeWidth="1" />
        <line x1="170" y1="280" x2="330" y2="280" stroke="hsl(30 20% 90%)" strokeWidth="0.5" strokeDasharray="4" />
        <line x1="170" y1="260" x2="330" y2="260" stroke="hsl(30 20% 90%)" strokeWidth="0.5" strokeDasharray="4" />
        <line x1="170" y1="240" x2="330" y2="240" stroke="hsl(30 20% 90%)" strokeWidth="0.5" strokeDasharray="4" />
        
        {/* Rising profit line - animated */}
        <path
          d="M175 295 L200 288 L225 275 L250 268 L275 250 L300 240 L325 228"
          fill="none"
          stroke="hsl(168 80% 38%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
        />
        
        {/* Area under line */}
        <path
          d="M175 295 L200 288 L225 275 L250 268 L275 250 L300 240 L325 228 L325 300 L175 300 Z"
          fill="hsl(168 80% 38%)"
          opacity="0.1"
        />
        
        {/* Green dots on graph */}
        <circle cx="250" cy="268" r="3" fill="hsl(168 80% 38%)" className="animate-pulse" />
        <circle cx="325" cy="228" r="4" fill="hsl(168 80% 38%)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        {/* Character - body */}
        <ellipse cx="250" cy="200" rx="35" ry="20" fill="hsl(168 50% 45%)" /> {/* shoulders */}
        <rect x="230" y="180" width="40" height="40" rx="8" fill="hsl(168 50% 45%)" /> {/* torso */}
        
        {/* Character - head */}
        <circle cx="250" cy="160" r="25" fill="hsl(30 40% 75%)" /> {/* face */}
        
        {/* Hair */}
        <path d="M225 155 Q230 130 250 128 Q270 130 275 155" fill="hsl(30 15% 25%)" />
        
        {/* Happy face */}
        <circle cx="241" cy="157" r="2.5" fill="hsl(30 15% 25%)" /> {/* left eye */}
        <circle cx="259" cy="157" r="2.5" fill="hsl(30 15% 25%)" /> {/* right eye */}
        <path d="M241 167 Q250 175 259 167" fill="none" stroke="hsl(30 15% 25%)" strokeWidth="2" strokeLinecap="round" /> {/* smile */}
        
        {/* Arms */}
        <path d="M220 195 Q195 215 190 240" fill="none" stroke="hsl(168 50% 45%)" strokeWidth="10" strokeLinecap="round" />
        <path d="M280 195 Q305 215 310 240" fill="none" stroke="hsl(168 50% 45%)" strokeWidth="10" strokeLinecap="round" />
        
        {/* Hands */}
        <circle cx="190" cy="242" r="7" fill="hsl(30 40% 75%)" />
        <circle cx="310" cy="242" r="7" fill="hsl(30 40% 75%)" />
        
        {/* Floating UI Card - Balance */}
        <g className="animate-float" style={{ animationDelay: '0s' }}>
          <rect x="20" y="100" width="100" height="55" rx="8" fill="hsl(35 35% 94%)" stroke="hsl(168 60% 70%)" strokeWidth="1.5" className="drop-shadow-md" />
          <text x="30" y="118" fontSize="8" fill="hsl(30 15% 40%)" fontFamily="sans-serif">Balance</text>
          <text x="30" y="136" fontSize="14" fontWeight="bold" fill="hsl(168 80% 30%)" fontFamily="sans-serif">$50,000</text>
          <circle cx="105" cy="115" r="6" fill="hsl(168 80% 38%)" opacity="0.2" />
          <text x="102" y="118" fontSize="7" fill="hsl(168 80% 38%)" fontFamily="sans-serif">$</text>
        </g>
        
        {/* Floating UI Card - Profit */}
        <g className="animate-float" style={{ animationDelay: '1s' }}>
          <rect x="380" y="80" width="100" height="55" rx="8" fill="hsl(35 35% 94%)" stroke="hsl(168 60% 70%)" strokeWidth="1.5" className="drop-shadow-md" />
          <text x="390" y="98" fontSize="8" fill="hsl(30 15% 40%)" fontFamily="sans-serif">Profit</text>
          <text x="390" y="116" fontSize="14" fontWeight="bold" fill="hsl(168 80% 30%)" fontFamily="sans-serif">+12.4%</text>
          <path d="M395 125 L415 118 L435 122 L455 112 L470 108" fill="none" stroke="hsl(168 80% 38%)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        
        {/* Floating UI Card - Win Rate */}
        <g className="animate-float" style={{ animationDelay: '2s' }}>
          <rect x="370" y="200" width="100" height="55" rx="8" fill="hsl(35 35% 94%)" stroke="hsl(168 60% 70%)" strokeWidth="1.5" className="drop-shadow-md" />
          <text x="380" y="218" fontSize="8" fill="hsl(30 15% 40%)" fontFamily="sans-serif">Win Rate</text>
          <text x="380" y="236" fontSize="14" fontWeight="bold" fill="hsl(168 80% 30%)" fontFamily="sans-serif">78.5%</text>
          <circle cx="455" cy="225" r="12" fill="none" stroke="hsl(168 80% 38%)" strokeWidth="2" strokeDasharray="60 15" />
        </g>
        
        {/* Floating coins */}
        <g className="animate-float" style={{ animationDelay: '0.5s' }}>
          <circle cx="60" cy="200" r="14" fill="hsl(45 80% 55%)" stroke="hsl(45 80% 45%)" strokeWidth="2" />
          <text x="55" y="205" fontSize="12" fontWeight="bold" fill="hsl(45 80% 30%)" fontFamily="sans-serif">$</text>
        </g>
        
        <g className="animate-float" style={{ animationDelay: '1.5s' }}>
          <circle cx="440" cy="290" r="11" fill="hsl(45 80% 55%)" stroke="hsl(45 80% 45%)" strokeWidth="2" />
          <text x="436" y="295" fontSize="10" fontWeight="bold" fill="hsl(45 80% 30%)" fontFamily="sans-serif">$</text>
        </g>
        
        <g className="animate-float" style={{ animationDelay: '2.5s' }}>
          <circle cx="100" cy="60" r="9" fill="hsl(45 80% 55%)" stroke="hsl(45 80% 45%)" strokeWidth="1.5" />
          <text x="97" y="64" fontSize="8" fontWeight="bold" fill="hsl(45 80% 30%)" fontFamily="sans-serif">$</text>
        </g>
        
        {/* Glow particles */}
        <circle cx="80" cy="150" r="3" fill="hsl(168 80% 60%)" opacity="0.4" className="animate-pulse" />
        <circle cx="420" cy="170" r="2" fill="hsl(168 80% 60%)" opacity="0.3" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="350" cy="50" r="2.5" fill="hsl(168 80% 60%)" opacity="0.35" className="animate-pulse" style={{ animationDelay: '2s' }} />
      </svg>
      
      <style>{`
        .animate-draw-line {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: drawLine 2s ease-out forwards;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
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

          {/* Right: Vector Illustration */}
          <div className="relative">
            <TraderIllustration />
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
      icon: Zap,
      title: "Instant Account",
      description: "Skip the evaluation. Get funded immediately with our instant funding option.",
      tag: "+20% premium",
      gradient: "gradient-card-amber",
    },
    {
      icon: Target,
      title: "1-Step Challenge",
      description: "Pass a single evaluation phase and receive your funded account.",
      tag: "Popular",
      gradient: "gradient-card-green",
    },
    {
      icon: BarChart3,
      title: "2-Step Challenge",
      description: "Complete two evaluation phases at the lowest price point.",
      tag: "Best Value",
      gradient: "gradient-card-teal",
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
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {models.map((model, i) => (
            <Card
              key={i}
              className={`relative p-6 ${model.gradient} border-border hover:border-primary/30 transition-all cursor-pointer group cream-hover`}
              onClick={() => navigate("/buy-challenge")}
            >
              {model.tag === "Popular" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-xs font-semibold">
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
