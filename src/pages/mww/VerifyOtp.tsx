import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { LogoMark } from "@/components/mww/Logo";
import { OtpInput } from "@/components/mww/OtpInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone ?? "";

  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(45);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = async () => {
    if (code.trim().length < 6) {
      toast.error("6 digit OTP daalein");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: code.trim(),
        type: "sms",
      });
      if (error) throw error;
      toast.success("Mobile number verified");
      navigate("/home", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
      if (error) throw error;
      toast.success("OTP resent");
      setSeconds(45);
    } catch (err: any) {
      toast.error(err.message || "Could not resend OTP");
    }
  };

  return (
    <MobileShell className="px-6 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 press"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <LogoMark className="h-9 w-9" />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <ShieldCheck className="h-12 w-12 text-primary" />
        <h1 className="mt-5 font-display text-2xl font-extrabold">Secure Verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          6-digit code bheja gaya he{" "}
          <span className="font-semibold text-foreground">+91 {phone || "•••• ••••••"}</span> par.
        </p>

        <div className="mt-8">
          <OtpInput value={code} onChange={setCode} />
        </div>

        <button
          onClick={verify}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl gold-surface py-4 font-display font-bold text-primary-foreground shadow-gold press disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify & Continue
        </button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {seconds > 0 ? (
            <>Resend code in 00:{String(seconds).padStart(2, "0")}</>
          ) : (
            <button onClick={resend} className="font-bold text-primary">
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </MobileShell>
  );
}
