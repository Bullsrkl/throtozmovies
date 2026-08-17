import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { LogoMark } from "@/components/mww/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Loader2, Eye, EyeOff,
} from "lucide-react";

const steps = ["Basic Details", "Referral Code", "Profile Setup"];

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  const [referralCode, setReferralCode] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referralError, setReferralError] = useState(false);
  const [validating, setValidating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      validateReferral(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const validateReferral = async (code: string) => {
    if (!code.trim()) return;
    setValidating(true);
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("referral_code", code.trim())
      .maybeSingle();
    if (data) {
      setReferrerName(data.full_name || "MultiWorkWala Member");
      setReferralError(false);
    } else {
      setReferrerName(null);
      setReferralError(true);
    }
    setValidating(false);
  };

  const canContinue =
    step === 0
      ? fullName.trim().length > 1 && /^\d{10}$/.test(mobile) && email.includes("@") && password.length >= 6
      : true;

  const handleSignup = async () => {
    setLoading(true);
    try {
      const metadata: Record<string, string> = { full_name: fullName.trim(), mobile };
      if (referralCode.trim() && referrerName) metadata.referral_code = referralCode.trim();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/home`, data: metadata },
      });
      if (error) throw error;

      if (data.session && (city.trim() || stateName.trim())) {
        await supabase
          .from("member_profiles")
          .update({ city: city.trim() || null, state: stateName.trim() || null })
          .eq("user_id", data.session.user.id);
      }

      navigate("/account-created", {
        replace: true,
        state: { hasSession: !!data.session, email: email.trim() },
      });
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  return (
    <MobileShell className="px-6 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? navigate("/login") : setStep(step - 1))}
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 press"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <LogoMark className="h-9 w-9" />
        <div>
          <p className="font-display text-sm font-bold">Create Account</p>
          <p className="text-[11px] text-muted-foreground">
            Step {step + 1} of {steps.length} — {steps[step]}
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {steps.map((s, i) => (
          <span
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              i <= step ? "gold-surface" : "bg-white/12"
            )}
          />
        ))}
      </div>

      <div className="mt-8 flex-1 space-y-4">
        {step === 0 && (
          <>
            <input
              className={inputClass}
              placeholder="Full name"
              aria-label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4">
              <span className="text-sm text-muted-foreground">+91</span>
              <input
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="10-digit mobile number"
                aria-label="Mobile number"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </div>
            <input
              className={inputClass}
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4">
              <input
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                type={showPassword ? "text" : "password"}
                placeholder="Create password (min 6)"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-muted-foreground">
              Kisi member ne aapko invite kiya he? Unka referral code yahan daalein. Ye optional he.
            </p>
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Referral code"
                aria-label="Referral code"
                value={referralCode}
                disabled={!!referrerName}
                onChange={(e) => {
                  setReferralCode(e.target.value.toUpperCase());
                  setReferrerName(null);
                  setReferralError(false);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  referrerName
                    ? (setReferrerName(null), setReferralCode(""), setReferralError(false))
                    : validateReferral(referralCode)
                }
                disabled={!referralCode.trim()}
                className="shrink-0 rounded-2xl border border-primary/40 px-4 text-xs font-bold text-primary press disabled:opacity-40"
              >
                {referrerName ? "Clear" : validating ? "…" : "Apply"}
              </button>
            </div>
            {referrerName && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-points">
                <CheckCircle2 className="h-4 w-4" /> Referred by {referrerName}
              </p>
            )}
            {referralError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <XCircle className="h-4 w-4" /> Invalid referral code
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-muted-foreground">
              Thoda sa aur — ye details aapke member profile me dikhengi.
            </p>
            <input
              className={inputClass}
              placeholder="City (optional)"
              aria-label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="State (optional)"
              aria-label="State"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
            <div className="glass-card p-4 text-xs leading-relaxed text-muted-foreground">
              Account banate hi aapko ek <span className="font-bold text-primary">permanent Member ID</span>{" "}
              milegi jo kabhi change nahi hogi.
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => (step === steps.length - 1 ? handleSignup() : setStep(step + 1))}
        disabled={!canContinue || loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl gold-surface py-4 font-display font-bold text-primary-foreground shadow-gold press disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {step === steps.length - 1 ? "Create Account" : "Continue"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link to="/login" className="font-bold text-primary">
          Login
        </Link>
      </p>
    </MobileShell>
  );
}
