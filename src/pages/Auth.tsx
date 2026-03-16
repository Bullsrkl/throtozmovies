import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referralError, setReferralError] = useState(false);
  const [referralValidating, setReferralValidating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Auto-fill referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      setIsSignUp(true);
      validateReferralCode(ref);
    }
  }, [searchParams]);

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferrerName(null);
      setReferralError(false);
      return;
    }
    setReferralValidating(true);
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("referral_code", code.trim())
      .single();
    if (data?.full_name) {
      setReferrerName(data.full_name);
      setReferralError(false);
    } else {
      setReferrerName(null);
      setReferralError(true);
    }
    setReferralValidating(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      // Store referral code for Google OAuth flow
      if (referralCode.trim() && referrerName) {
        localStorage.setItem("pending_referral_code", referralCode.trim());
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: referralCode.trim() && referrerName ? {
            referral_code: referralCode.trim()
          } : undefined,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your email.");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const metadata: Record<string, string> = { full_name: fullName };
        if (referralCode.trim() && referrerName) {
          metadata.referral_code = referralCode.trim();
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: metadata,
          }
        });
        if (error) throw error;
        toast.success("Account created! Please check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-2">
          <div className="text-center mb-2">
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Prop Gym
            </span>
          </div>
          <CardTitle className="text-2xl font-display">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? "Enter your email to receive a reset link"
              : isSignUp
                ? "Start your trading evaluation journey"
                : "Sign in to access your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isForgotPassword && (
            <>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>
            </>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-card" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card" />
            </div>
            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-card" />
              </div>
            )}

            {/* Referral Code - Only on Signup */}
            {isSignUp && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="referralCode"
                    placeholder="e.g. THR1A2B3C"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      setReferrerName(null);
                      setReferralError(false);
                    }}
                    maxLength={20}
                    className="bg-card"
                    disabled={!!referrerName}
                  />
                  <Button
                    type="button"
                    variant={referrerName ? "outline" : "secondary"}
                    className={referrerName ? "border-primary text-primary gap-1 shrink-0" : "shrink-0"}
                    onClick={() => {
                      if (referrerName) {
                        setReferrerName(null);
                        setReferralCode("");
                        setReferralError(false);
                      } else {
                        validateReferralCode(referralCode);
                      }
                    }}
                    disabled={!referralCode.trim() && !referrerName}
                  >
                    {referrerName ? (
                      <><CheckCircle className="h-4 w-4" /> Valid</>
                    ) : referralValidating ? "Checking..." : "Apply"}
                  </Button>
                </div>
                {referrerName && (
                  <p className="text-sm text-green-500 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Referred by: {referrerName}
                  </p>
                )}
                {referralError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Invalid referral code
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground" disabled={loading}>
              {loading ? "Loading..." : isForgotPassword ? "Send Reset Link" : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isForgotPassword ? (
              <button type="button" onClick={() => setIsForgotPassword(false)} className="text-primary hover:underline">
                Remember your password? Sign in
              </button>
            ) : (
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
