import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { Logo } from "@/components/mww/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldAlert, ChevronDown, ChevronUp, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const rawNext = searchParams.get("next");
  const nextPath =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/home";
  const redirectUrl = `${window.location.origin}${nextPath}`;

  const [email, setEmail] = useState(() => localStorage.getItem("mww_remember_email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("mww_remember_email"));
  const [loading, setLoading] = useState(false);

  const [transferUsed, setTransferUsed] = useState<boolean | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferPassword, setTransferPassword] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(nextPath, { replace: true });
  }, [user, navigate, nextPath]);

  useEffect(() => {
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "admin_transfer_used")
      .maybeSingle()
      .then(({ data }) => setTransferUsed(data?.value === "true"));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (remember) localStorage.setItem("mww_remember_email", email.trim());
      else localStorage.removeItem("mww_remember_email");
      toast.success("Welcome back!");
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) toast.error(error.message);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail || transferPassword.length < 8) {
      toast.error("Valid email aur kam se kam 8 char ka password daalein");
      return;
    }
    setTransferLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("transfer-admin", {
        body: { new_email: transferEmail.trim(), new_password: transferPassword },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Admin transferred! Ab naye credentials se login karein.");
      setTransferUsed(true);
      setShowTransfer(false);
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <MobileShell className="px-6 pb-10 pt-10">
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" showTagline={false} className="flex-col gap-3" />
        <h1 className="mt-6 font-display text-2xl font-extrabold">Welcome Back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Apne MultiWorkWala account me login karein</p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <div className="glass-card flex items-center gap-3 px-4 py-3.5">
          <Mail className="h-4 w-4 shrink-0 text-primary" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-label="Email address"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="glass-card flex items-center gap-3 px-4 py-3.5">
          <Lock className="h-4 w-4 shrink-0 text-primary" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[hsl(42_70%_56%)]"
            />
            Remember Me
          </label>
          <Link to="/forgot-password" className="font-semibold text-primary">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gold-surface py-4 font-display font-bold text-primary-foreground shadow-gold press disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Login
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/5 py-3.5 text-sm font-semibold press"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to MultiWorkWala?{" "}
        <Link to="/signup" className="font-bold text-primary">
          Create New Account
        </Link>
      </p>

      {transferUsed === false && (
        <div className="mt-8 rounded-2xl border border-destructive/35 bg-destructive/10">
          <button
            type="button"
            onClick={() => setShowTransfer((s) => !s)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
          >
            <span className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-4 w-4" />
              One-Time Admin Transfer
            </span>
            {showTransfer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showTransfer && (
            <form onSubmit={handleTransfer} className="space-y-3 px-4 pb-4">
              <p className="text-[11px] text-muted-foreground">
                Ye feature sirf ek baar use ho sakta hai. Naya admin set hone ke baad purane admin ka
                access remove ho jayega.
              </p>
              <input
                type="email"
                required
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="New admin email"
                aria-label="New admin email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
              <input
                type="password"
                required
                minLength={8}
                value={transferPassword}
                onChange={(e) => setTransferPassword(e.target.value)}
                placeholder="New admin password (min 8)"
                aria-label="New admin password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={transferLoading}
                className="w-full rounded-xl bg-destructive py-2.5 text-sm font-bold text-destructive-foreground press disabled:opacity-60"
              >
                {transferLoading ? "Transferring…" : "Transfer Admin Access"}
              </button>
            </form>
          )}
        </div>
      )}
    </MobileShell>
  );
}
