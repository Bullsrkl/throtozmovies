import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle2, Loader2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentPopupProps {
  open: boolean;
  onClose: () => void;
  plan: {
    id: string;
    plan_name: string;
    price_inr: number;
    original_price_inr?: number;
    uploads_per_day: number;
    earning_per_download: number;
    duration_days: number;
  };
  userId: string;
}

const ADMIN_UPI = "bharat00070@ybl"; // Admin UPI ID
const ADMIN_NAME = "Throtoz Movies";

export function PaymentPopup({ open, onClose, plan, userId }: PaymentPopupProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "waiting" | "success">("idle");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const amount = plan.price_inr;
  const originalAmount = plan.original_price_inr;
  const savings = originalAmount ? originalAmount - amount : 0;
  const discountPercent = originalAmount ? Math.round(((originalAmount - amount) / originalAmount) * 100) : 0;
  
  const upiLink = `upi://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Subscription ${plan.plan_name}`)}`;

  // Poll for payment verification
  useEffect(() => {
    if (paymentStatus === "waiting" && subscriptionId) {
      const interval = setInterval(async () => {
        const { data } = await supabase
          .from("subscriptions")
          .select("payment_verified")
          .eq("id", subscriptionId)
          .single();

        if (data?.payment_verified) {
          // Credit ₹110 bonus to wallet
          try {
            await supabase.rpc('credit_wallet_bonus', {
              p_user_id: userId,
              p_amount: 110
            });
            toast.success("Payment verified! ₹110 bonus credited to your wallet!");
          } catch (bonusError) {
            console.error("Error crediting bonus:", bonusError);
          }

          setPaymentStatus("success");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [paymentStatus, subscriptionId, userId]);

  const openUpiApp = (app?: string) => {
    const links: Record<string, string> = {
      generic: upiLink,
      gpay: `gpay://upi/pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Subscription ${plan.plan_name}`)}`,
      phonepe: `phonepe://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Subscription ${plan.plan_name}`)}`,
      paytm: `paytmmp://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Subscription ${plan.plan_name}`)}`,
    };
    
    window.location.href = links[app || 'generic'];
  };

  const handlePaymentInitiated = async (app?: string) => {
    try {
      // Create pending subscription
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          expiry_date: expiryDate.toISOString(),
          status: "active",
          payment_verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      setSubscriptionId(data.id);
      setPaymentStatus("waiting");

      // Open UPI app
      openUpiApp(app);
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to initiate payment");
    }
  };

  const handleClose = () => {
    setPaymentStatus("idle");
    setSubscriptionId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-2 border-border/50 backdrop-blur-xl shadow-elevated">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl font-display">
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Complete Payment
            </span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2 className="h-20 w-20 text-premium animate-in zoom-in" />
            <h3 className="text-2xl font-display text-premium">Payment Successful!</h3>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        ) : paymentStatus === "waiting" ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <h3 className="text-xl font-display">Waiting for Payment Confirmation</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Please complete the payment in your UPI app. We'll automatically verify and activate your subscription once payment is received.
            </p>
            <p className="text-xs text-destructive/80">
              ⚠️ Payment verified before activation — no fake success
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 py-6">
            {/* Left: Plan Summary */}
            <div className="space-y-4">
              <div className="bg-background/50 rounded-xl p-6 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-lg">{plan.plan_name}</h4>
                  {discountPercent > 0 && (
                    <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Uploads/Day:</span>
                    <span className="font-medium">{plan.uploads_per_day}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Per Download:</span>
                    <span className="font-medium">₹{plan.earning_per_download}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{plan.duration_days} days</span>
                  </p>
                </div>
                <div className="pt-4 border-t border-border/30 space-y-2">
                  {originalAmount && originalAmount > amount && (
                    <p className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Original Price:</span>
                      <span className="text-lg text-muted-foreground line-through">
                        ₹{originalAmount}
                      </span>
                    </p>
                  )}
                  <p className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      ₹{amount}
                    </span>
                  </p>
                  {savings > 0 && (
                    <Badge variant="outline" className="border-green-500 text-green-600 w-fit">
                      🎉 You Save ₹{savings}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                💳 Secure payment via UPI
              </p>
            </div>

            {/* Right: Payment Options */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary-light text-lg font-semibold h-14"
                  onClick={() => handlePaymentInitiated()}
                >
                  💳 Pay ₹{amount} via UPI
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Opens your preferred UPI app
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">Or choose your app:</p>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-background/50 hover:bg-background border-border/30"
                    onClick={() => handlePaymentInitiated('gpay')}
                  >
                    <span className="text-2xl">G</span>
                    <span className="text-xs">Google Pay</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-background/50 hover:bg-background border-border/30"
                    onClick={() => handlePaymentInitiated('phonepe')}
                  >
                    <span className="text-2xl">💜</span>
                    <span className="text-xs">PhonePe</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-background/50 hover:bg-background border-border/30"
                    onClick={() => handlePaymentInitiated('paytm')}
                  >
                    <span className="text-2xl">🔵</span>
                    <span className="text-xs">Paytm</span>
                  </Button>
                </div>
              </div>

              <div className="text-xs text-center text-muted-foreground space-y-1 pt-2">
                <p>Pay to: <strong>{ADMIN_UPI}</strong></p>
                <p className="text-destructive/80">⚠️ Payment verified before activation</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}