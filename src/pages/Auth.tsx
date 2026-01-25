import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Gift, CheckCircle } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [validReferral, setValidReferral] = useState<{id: string; email: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    
    // Check for referral code in URL
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      setIsSignUp(true);
      validateReferralCode(refCode);
    }
  }, [user, navigate, searchParams]);

  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 6) {
      setValidReferral(null);
      return;
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("referral_code", code.toUpperCase())
      .maybeSingle();
    
    if (data && !error) {
      setValidReferral(data);
    } else {
      setValidReferral(null);
    }
  };

  const handleReferralCodeChange = (value: string) => {
    const upperCode = value.toUpperCase();
    setReferralCode(upperCode);
    if (upperCode.length >= 6) {
      validateReferralCode(upperCode);
    } else {
      setValidReferral(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
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
        const redirectUrl = `${window.location.origin}/`;
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName
            }
          }
        });
        
        if (error) throw error;
        
        // If we have a valid referral and signup succeeded
        if (signUpData.user && validReferral) {
          // Create referral record and credit bonuses
          const { error: refError } = await supabase
            .from("referrals")
            .insert({
              referrer_id: validReferral.id,
              referred_id: signUpData.user.id,
              referral_code: referralCode,
              status: "signup_bonus",
              signup_bonus_credited: true
            });
          
          if (!refError) {
            // Credit signup bonus to both users
            await supabase.rpc("credit_referral_bonus", {
              p_referrer_id: validReferral.id,
              p_referred_id: signUpData.user.id,
              p_bonus_type: "signup"
            });
            toast.success("Account created with ₹25 referral bonus! Check your email.");
          } else {
            toast.success("Account created! Please check your email.");
          }
        } else {
          toast.success("Account created! Please check your email.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
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
          <CardTitle className="text-3xl font-display bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? "Enter your email to receive a reset link"
              : isSignUp 
                ? "Upload & monetize your movies" 
                : "Sign in to access your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          {!isForgotPassword && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-card"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card"
              />
            </div>
            
            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-card"
                />
              </div>
            )}

            {/* Referral Code Field - Only on Signup */}
            {isSignUp && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="referralCode" className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-premium" />
                  Referral Code (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="referralCode"
                    type="text"
                    value={referralCode}
                    onChange={(e) => handleReferralCodeChange(e.target.value)}
                    placeholder="THR..."
                    className="bg-card font-mono uppercase"
                    maxLength={9}
                  />
                  {validReferral && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {validReferral && (
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Valid code! You'll get ₹25 bonus on signup + ₹25 on first subscription
                  </div>
                )}
                {referralCode.length >= 6 && !validReferral && (
                  <p className="text-xs text-destructive">Invalid referral code</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-light"
              disabled={loading}
            >
              {loading ? "Loading..." : isForgotPassword ? "Send Reset Link" : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-primary hover:underline"
              >
                Remember your password? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
