import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentPopupProps {
  open: boolean;
  onClose: () => void;
  plan: {
    id: string;
    plan_name: string;
    price_inr: number;
    uploads_per_day: number;
    earning_per_download: number;
    duration_days: number;
  };
  userId: string;
}

const ADMIN_UPI = "tilaks631@paytm"; // Admin UPI ID
const ADMIN_NAME = "Throtoz Movies";

export function PaymentPopup({ open, onClose, plan, userId }: PaymentPopupProps) {
  const { isMobile } = useDeviceDetection();
  const [qrCode, setQrCode] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "waiting" | "success">("idle");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const amount = plan.price_inr;
  const upiLink = `upi://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Subscription ${plan.plan_name}`)}`;

  useEffect(() => {
    if (open && !isMobile) {
      QRCode.toDataURL(upiLink, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0B0E13",
          light: "#FFFFFF",
        },
      }).then(setQrCode);
    }
  }, [open, isMobile, upiLink]);

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
          setPaymentStatus("success");
          toast.success("Payment verified! Subscription activated.");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [paymentStatus, subscriptionId]);

  const handlePaymentInitiated = async () => {
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

      // Open UPI app on mobile
      if (isMobile) {
        window.location.href = upiLink;
      }
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
                <h4 className="font-display text-lg">{plan.plan_name}</h4>
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
                <div className="pt-4 border-t border-border/30">
                  <p className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      ₹{amount}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                💳 Secure payment via UPI
              </p>
            </div>

            {/* Right: Payment Options */}
            <div className="space-y-4">
              {isMobile ? (
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary-light text-lg font-semibold"
                    onClick={handlePaymentInitiated}
                  >
                    Pay via UPI
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Opens your UPI app and pre-fills payee + amount
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-background rounded-xl p-4 border border-border/30 flex flex-col items-center">
                    {qrCode && (
                      <img src={qrCode} alt="UPI QR Code" className="w-64 h-64 rounded-lg" />
                    )}
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Scan QR code with any UPI app
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary-light"
                    onClick={handlePaymentInitiated}
                  >
                    I've Made the Payment
                  </Button>
                </div>
              )}

              <div className="text-xs text-center text-muted-foreground space-y-1">
                <p>Pay to: <strong>{ADMIN_UPI}</strong></p>
                <p>Amount: <strong>₹{amount}</strong></p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
