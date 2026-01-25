import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Share2, Users, Gift, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface Referral {
  id: string;
  referred_id: string;
  referral_code: string;
  status: string;
  signup_bonus_credited: boolean;
  subscription_bonus_credited: boolean;
  created_at: string;
  referred_user?: {
    email: string;
    full_name: string | null;
  };
}

interface ReferralStats {
  totalReferrals: number;
  signupBonusCount: number;
  subscriptionBonusCount: number;
  totalEarned: number;
}

export function Referrals() {
  const { user, profile } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    signupBonusCount: 0,
    subscriptionBonusCount: 0,
    totalEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralCode();
    fetchReferrals();
  }, [user]);

  const fetchReferralCode = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();
    
    if (data?.referral_code) {
      setReferralCode(data.referral_code);
    }
  };

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referred_user:profiles!referrals_referred_id_fkey(email, full_name)
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const referralData = data || [];
      setReferrals(referralData);

      // Calculate stats
      const signupBonusCount = referralData.filter(r => r.signup_bonus_credited).length;
      const subscriptionBonusCount = referralData.filter(r => r.subscription_bonus_credited).length;
      const totalEarned = (signupBonusCount * 25) + (subscriptionBonusCount * 50);

      setStats({
        totalReferrals: referralData.length,
        signupBonusCount,
        subscriptionBonusCount,
        totalEarned,
      });
    } catch (error: any) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const shareViaWhatsApp = () => {
    const message = `🎬 Join ThrotozMovies and earn money by uploading movies! Use my referral code: ${referralCode} and get ₹25 bonus on signup + ₹25 on first subscription! 🎁\n\nSign up now: ${window.location.origin}/auth?ref=${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareViaTwitter = () => {
    const message = `🎬 Join ThrotozMovies and earn money! Use my referral code: ${referralCode} and get ₹50 bonus! Sign up: ${window.location.origin}/auth?ref=${referralCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getStatusBadge = (referral: Referral) => {
    if (referral.subscription_bonus_credited) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Subscribed</Badge>;
    }
    if (referral.signup_bonus_credited) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Signed Up</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
  };

  const getBonusEarned = (referral: Referral) => {
    let bonus = 0;
    if (referral.signup_bonus_credited) bonus += 25;
    if (referral.subscription_bonus_credited) bonus += 50;
    return bonus;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Referral Program</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-premium to-premium-light bg-clip-text text-transparent">
          Referral Program
        </h1>
        <p className="text-muted-foreground mt-1">
          Invite friends and earn bonus rewards!
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-premium/30 bg-gradient-to-br from-premium/5 to-premium-light/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-premium" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-background/50 border border-border rounded-lg p-4 text-center">
              <span className="text-2xl font-bold font-mono tracking-widest text-premium">
                {referralCode}
              </span>
            </div>
            <Button onClick={copyToClipboard} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
              <Gift className="h-4 w-4" />
              Referral Rewards
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                You get ₹25 + Friend gets ₹25 on signup
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                You get ₹50 + Friend gets ₹25 on first subscription
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={shareViaWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
              <Share2 className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button onClick={shareViaTwitter} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.signupBonusCount}</p>
                <p className="text-sm text-muted-foreground">Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.subscriptionBonusCount}</p>
                <p className="text-sm text-muted-foreground">Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-premium/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-premium/10">
                <Gift className="h-6 w-6 text-premium" />
              </div>
              <div>
                <p className="text-2xl font-bold text-premium">₹{stats.totalEarned}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet. Share your code to start earning!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Bonus Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {referral.referred_user?.full_name || "User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {referral.referred_user?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(referral.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(referral)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {getBonusEarned(referral) > 0 ? (
                        <span className="text-green-400">₹{getBonusEarned(referral)}</span>
                      ) : (
                        <span className="text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
