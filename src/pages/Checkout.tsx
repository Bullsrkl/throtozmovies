import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Upload, CheckCircle, ArrowLeft, Loader2, XCircle, Clock } from "lucide-react";

const BASE_PRICES: Record<number, number> = {
  5000: 28,
  10000: 49,
  30000: 90,
  50000: 169,
  100000: 210,
  500000: 350,
};

type ChallengeType = "instant" | "one_step" | "two_step";

function getPrice(size: number, type: string): number {
  const base = BASE_PRICES[size];
  if (!base) return 0;
  if (type === "one_step") return Math.round(base * 1.1 * 10) / 10;
  if (type === "instant") return Math.round(base * 1.2 * 10) / 10;
  return base;
}

const TYPE_LABELS: Record<string, string> = {
  two_step: "2-Step Challenge",
  one_step: "1-Step Challenge",
  instant: "Instant Funding",
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const size = Number(searchParams.get("size")) || 0;
  const type = searchParams.get("type") || "two_step";
  const basePrice = getPrice(size, type);

  const [usdtAddress, setUsdtAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Discount state
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountReferrerName, setDiscountReferrerName] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  const finalPrice = discountApplied
    ? Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100
    : basePrice;

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (!size || !BASE_PRICES[size]) { navigate("/buy-challenge"); return; }
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "usdt_deposit_address")
      .single()
      .then(({ data }) => { if (data?.value) setUsdtAddress(data.value); });
  }, [user, size, navigate]);

  // Timer
  useEffect(() => {
    if (!popupOpen) return;
    setTimeLeft(30 * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPopupOpen(false);
          toast({ title: "Payment session expired", description: "Please try again.", variant: "destructive" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [popupOpen, toast]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const copyAddress = async () => {
    if (!usdtAddress) return;
    await navigator.clipboard.writeText(usdtAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Address copied!" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20MB allowed", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image", variant: "destructive" });
      return;
    }
    setScreenshotFile(file);
  };

  const validateDiscount = async () => {
    if (!discountCode.trim() || !user) return;
    setDiscountValidating(true);
    setDiscountError(null);
    try {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id, full_name, referral_code")
        .eq("referral_code", discountCode.trim())
        .single();
      if (!referrer) { setDiscountError("Invalid discount code"); setDiscountValidating(false); return; }
      if (referrer.id === user.id) { setDiscountError("You cannot use your own referral code"); setDiscountValidating(false); return; }
      const { count } = await supabase
        .from("challenge_purchases")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("status", "eq", "rejected");
      if (count && count > 0) { setDiscountError("Discount only valid for your first purchase"); setDiscountValidating(false); return; }
      setDiscountApplied(true);
      setDiscountReferrerName(referrer.full_name || "Unknown");
      setDiscountPercent(25);
      setDiscountError(null);
    } catch { setDiscountError("Failed to validate code"); } finally { setDiscountValidating(false); }
  };

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    if (!transactionId.trim()) { toast({ title: "Transaction ID required", variant: "destructive" }); return; }
    if (!screenshotFile) { toast({ title: "Payment screenshot required", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data: plan, error: planError } = await supabase
        .from("challenge_plans")
        .select("id")
        .eq("account_size", size)
        .eq("challenge_type", type as ChallengeType)
        .single();
      if (planError || !plan) { toast({ title: "Plan not found", variant: "destructive" }); setSubmitting(false); return; }
      const ext = screenshotFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("payment-screenshots").upload(filePath, screenshotFile);
      if (uploadError) { toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" }); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from("payment-screenshots").getPublicUrl(filePath);
      const { error: insertError } = await supabase.from("challenge_purchases").insert({
        user_id: user.id, plan_id: plan.id, status: "payment_submitted",
        transaction_id: transactionId.trim(), payment_screenshot_url: urlData.publicUrl,
        discount_code: discountApplied ? discountCode.trim() : null,
      });
      if (insertError) { toast({ title: "Submission failed", description: insertError.message, variant: "destructive" }); setSubmitting(false); return; }
      toast({ title: "Payment submitted!", description: "Your payment is under review. You'll be notified once approved." });
      setPopupOpen(false);
      navigate("/dashboard");
    } catch { toast({ title: "Something went wrong", variant: "destructive" }); } finally { setSubmitting(false); }
  }, [user, transactionId, screenshotFile, size, type, discountApplied, discountCode, toast, navigate]);

  if (!size || !BASE_PRICES[size]) return null;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/buy-challenge")}>
          <ArrowLeft className="h-4 w-4" /> Back to Plans
        </Button>

        {/* Order Summary */}
        <Card className="mb-6 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Challenge Type</span>
              <span className="font-medium">{TYPE_LABELS[type] || type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Size</span>
              <span className="font-medium">${size.toLocaleString()}</span>
            </div>

            {/* Discount Code */}
            <div className="pt-2 border-t border-border">
              <Label htmlFor="discount" className="text-xs text-muted-foreground">Discount / Referral Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="discount"
                  placeholder="Enter code"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountApplied(false);
                    setDiscountReferrerName(null);
                    setDiscountError(null);
                    setDiscountPercent(0);
                  }}
                  maxLength={50}
                  disabled={discountApplied}
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant={discountApplied ? "outline" : "secondary"}
                  className={discountApplied ? "border-primary text-primary gap-1 shrink-0" : "shrink-0"}
                  onClick={() => {
                    if (discountApplied) {
                      setDiscountApplied(false); setDiscountCode(""); setDiscountReferrerName(null); setDiscountPercent(0);
                    } else { validateDiscount(); }
                  }}
                  disabled={(!discountCode.trim() && !discountApplied) || discountValidating}
                >
                  {discountApplied ? (<><CheckCircle className="h-3.5 w-3.5" /> Applied</>) : discountValidating ? "Checking..." : "Apply"}
                </Button>
              </div>
              {discountReferrerName && (
                <p className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" /> Referred by: {discountReferrerName} — 25% off!
                </p>
              )}
              {discountError && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <XCircle className="h-3 w-3" /> {discountError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${basePrice} USDT</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-500">
                <span>Discount (25%)</span>
                <span>-${(basePrice - finalPrice).toFixed(2)} USDT</span>
              </div>
            )}
            <div className="flex justify-between border-t border-primary/20 pt-2 mt-1">
              <span className="font-semibold">Amount to Pay</span>
              <div className="text-right">
                {discountApplied && (
                  <span className="text-xs text-muted-foreground line-through mr-2">${basePrice}</span>
                )}
                <span className="text-xl font-display font-bold text-primary">${finalPrice} USDT</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="mb-6 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Payment — USDT (BEP20)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Network</Label>
              <p className="font-medium text-sm">BEP20 (BSC — Binance Smart Chain)</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Deposit Address</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-xs break-all font-mono">
                  {usdtAddress || "Loading..."}
                </code>
                <Button size="icon" variant="outline" onClick={copyAddress} className="shrink-0" disabled={!usdtAddress}>
                  {copied ? <CheckCircle className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Send exactly <span className="text-primary font-semibold">${finalPrice} USDT</span> to the above address via BEP20 network.
            </p>
          </CardContent>
        </Card>

        {/* Buy Now Button */}
        <Button
          className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-display font-bold"
          onClick={() => setPopupOpen(true)}
          disabled={!usdtAddress}
        >
          Buy Now — ${finalPrice} USDT
        </Button>

        {/* Payment Popup */}
        <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-center">Complete Payment</DialogTitle>
            </DialogHeader>

            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 text-lg font-mono font-bold ${timeLeft < 300 ? "text-destructive" : "text-primary"}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              {qrUrl ? (
                <img src={qrUrl} alt="Payment QR Code" className="w-48 h-48 rounded-lg border border-border bg-white p-2" />
              ) : (
                <div className="w-48 h-48 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Scan to get the deposit address
              </p>
            </div>

            {/* Address + Copy */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">USDT Address (BEP20)</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted rounded-md px-3 py-2 text-xs break-all font-mono">
                  {usdtAddress}
                </code>
                <Button size="icon" variant="outline" onClick={copyAddress} className="shrink-0 h-8 w-8">
                  {copied ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <p className="text-center text-sm font-medium">
              Send exactly <span className="text-primary font-bold">${finalPrice} USDT</span>
            </p>

            {/* Heading */}
            <p className="text-sm text-muted-foreground text-center font-medium border-t border-border pt-3">
              If you have already made the payment, please fill in the details below
            </p>

            {/* Transaction ID */}
            <div>
              <Label htmlFor="popup-txn-id" className="text-sm">Transaction ID / Hash *</Label>
              <Input
                id="popup-txn-id"
                placeholder="e.g. 0x1a2b3c..."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                maxLength={200}
                className="mt-1"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <Label htmlFor="popup-screenshot" className="text-sm">Payment Screenshot *</Label>
              <div className="mt-1">
                <label htmlFor="popup-screenshot" className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  {screenshotFile ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="truncate max-w-[200px]">{screenshotFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                    </>
                  )}
                </label>
                <input id="popup-screenshot" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            {/* Done Button */}
            <Button
              className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground"
              onClick={handleSubmit}
              disabled={submitting || !transactionId.trim() || !screenshotFile}
            >
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>) : "Done"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
