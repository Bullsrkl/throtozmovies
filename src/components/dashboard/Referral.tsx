import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Link, Gift, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReferralData {
  id: string;
  referred_id: string;
  status: string | null;
  created_at: string | null;
}

export function Referral() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [profileRes, referralsRes] = await Promise.all([
      supabase.from("profiles").select("referral_code").eq("id", user!.id).single(),
      supabase.from("referrals").select("id, referred_id, status, created_at").eq("referrer_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setReferralCode(profileRes.data?.referral_code || "");
    setReferrals((referralsRes.data as ReferralData[]) || []);
    setLoading(false);
  };

  const affiliateLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyText = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }
    else { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
    toast.success("Copied!");
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground">Share your code — new users get 25% off their first challenge</p>
      </div>

      {/* Referral Code */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            Your Referral / Discount Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background border border-border rounded-md px-4 py-3 text-lg font-mono font-bold tracking-wider text-center">
              {referralCode || "—"}
            </code>
            <Button size="icon" variant="outline" onClick={() => copyText(referralCode, "code")} disabled={!referralCode}>
              {codeCopied ? <CheckCircle className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This code gives new users <span className="text-primary font-semibold">25% off</span> their first challenge purchase.
          </p>
        </CardContent>
      </Card>

      {/* Affiliate Link */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Link className="h-4 w-4 text-primary" />
            Affiliate Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-xs font-mono break-all">
              {affiliateLink}
            </code>
            <Button size="icon" variant="outline" onClick={() => copyText(affiliateLink, "link")} disabled={!referralCode}>
              {linkCopied ? <CheckCircle className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this link — the referral code will be auto-filled on signup.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Gift className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{referrals.filter(r => r.status !== "pending").length}</p>
            <p className="text-xs text-muted-foreground">Active Referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral List */}
      {referrals.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <span className="text-sm text-muted-foreground">
                  {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "—"}
                </span>
                <Badge className={
                  ref.status === "pending" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }>
                  {ref.status || "pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
