import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { LogoMark } from "@/components/mww/Logo";
import { cn } from "@/lib/utils";
import {
  Layers, Wallet, Coins, Gem, ShoppingBag, Store, Utensils, Hotel, Plane,
  Users, TrendingUp, Gift, ShieldCheck, ArrowRight, Settings,
} from "lucide-react";

const slides = [
  {
    title: "One Ecosystem,",
    highlight: "Limitless Possibilities",
    body: "Shopping, payments, services aur earning — sab kuch ek hi platform par.",
    icon: Layers,
    chips: [
      { label: "Products", icon: ShoppingBag },
      { label: "Services", icon: Settings },
      { label: "Payments", icon: Wallet },
      { label: "Rewards", icon: Gift },
    ],
  },
  {
    title: "Three",
    highlight: "Smart Wallets",
    body: "Earning Wallet, MVS Pay aur MVS Points — har zarurat ke liye alag wallet.",
    icon: Wallet,
    chips: [
      { label: "Earning Wallet", icon: Wallet },
      { label: "MVS Pay", icon: Coins },
      { label: "MVS Points", icon: Gem },
    ],
  },
  {
    title: "Products &",
    highlight: "Services",
    body: "Merchants, restaurants, hotels aur travel — sabse behtar deals ek jagah.",
    icon: Store,
    chips: [
      { label: "Merchants", icon: Store },
      { label: "Restaurants", icon: Utensils },
      { label: "Hotels", icon: Hotel },
      { label: "Travel", icon: Plane },
    ],
  },
  {
    title: "Grow",
    highlight: "Together",
    body: "Strong community, unlimited growth, rewards aur poori security ke saath.",
    icon: Users,
    chips: [
      { label: "Community", icon: Users },
      { label: "Growth", icon: TrendingUp },
      { label: "Rewards", icon: Gift },
      { label: "Security", icon: ShieldCheck },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const last = step === slides.length - 1;

  const finish = () => {
    localStorage.setItem("mww_onboarded", "1");
    navigate("/login", { replace: true });
  };

  return (
    <MobileShell className="px-6 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <LogoMark className="h-9 w-9" />
        <button onClick={finish} className="text-xs font-semibold text-muted-foreground press">
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative mb-8 grid h-40 w-40 place-items-center">
          <div className="absolute inset-0 rounded-[2.5rem] border border-primary/25 bg-white/5" />
          <div
            className="absolute inset-6 rounded-3xl blur-2xl"
            style={{ background: "hsl(42 70% 56% / 0.28)" }}
          />
          <slide.icon className="relative h-16 w-16 text-primary" />
        </div>

        <h1 className="font-display text-3xl font-extrabold leading-tight">
          {slide.title}
          <br />
          <span className="gold-text">{slide.highlight}</span>
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{slide.body}</p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {slide.chips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-foreground/85"
            >
              <chip.icon className="h-3.5 w-3.5 text-primary" />
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {slides.map((s, i) => (
          <span
            key={s.highlight}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-7 bg-primary" : "w-1.5 bg-white/20"
            )}
          />
        ))}
      </div>

      <button
        onClick={() => (last ? finish() : setStep(step + 1))}
        className="flex w-full items-center justify-center gap-2 rounded-2xl gold-surface py-4 font-display text-base font-bold text-primary-foreground shadow-gold press"
      >
        {last ? "Get Started" : "Next"}
        <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Step {step + 1} of {slides.length}
      </p>
    </MobileShell>
  );
}
