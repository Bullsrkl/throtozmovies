import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/mww/Logo";
import { MobileShell } from "@/components/mww/MobileShell";
import { useAuth } from "@/hooks/useAuth";

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(p + 6, 100)), 90);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (user) return navigate("/home", { replace: true });
      const seen = localStorage.getItem("mww_onboarded");
      navigate(seen ? "/login" : "/onboarding", { replace: true });
    }, 1800);
    return () => clearTimeout(t);
  }, [user, loading, navigate]);

  return (
    <MobileShell className="items-center justify-center px-8">
      <div className="flex flex-col items-center text-center">
        <div className="animate-float">
          <Logo size="lg" showTagline={false} className="flex-col gap-4" />
        </div>
        <p className="mt-4 text-sm tracking-[0.2em] text-primary/90">समाधान हर जरूरत का</p>

        <div className="mt-12 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full gold-surface transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Loading your ecosystem…</p>
      </div>

      <p className="absolute bottom-8 text-[11px] text-muted-foreground">
        Powered by MultiWorkWala
      </p>
    </MobileShell>
  );
}
