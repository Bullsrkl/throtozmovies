import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { LogoMark } from "@/components/mww/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell className="px-6 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/login")}
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 press"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <LogoMark className="h-9 w-9" />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto h-14 w-14 text-points" />
            <h1 className="mt-5 font-display text-2xl font-extrabold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Humne <span className="text-foreground">{email}</span> par password reset link bhej diya he.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block w-full rounded-2xl gold-surface py-4 font-display font-bold text-primary-foreground shadow-gold press"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold">Forgot Password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Apna registered email daalein, hum reset link bhej denge.
            </p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl gold-surface py-4 font-display font-bold text-primary-foreground shadow-gold press disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          </>
        )}
      </div>
    </MobileShell>
  );
}
