import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Wallet, TrendingUp, Calendar, Crown, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Stats {
  totalUploads: number;
  totalDownloads: number;
  walletBalance: number;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  expiryDate: string | null;
  youtubeBonusClaimed: boolean;
}

export function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalUploads: 0,
    totalDownloads: 0,
    walletBalance: 0,
    subscriptionStatus: null,
    subscriptionPlan: null,
    expiryDate: null,
    youtubeBonusClaimed: false,
  });
  const [loading, setLoading] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchStats();
    fetchYoutubeUrl();
  }, [user]);

  const fetchYoutubeUrl = async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "youtube_channel_url")
      .single();
    if (data) setYoutubeUrl(data.value);
  };

  const fetchStats = async () => {
    try {
      // Fetch uploads count
      const { count: uploadsCount } = await supabase
        .from("movies")
        .select("*", { count: "exact", head: true })
        .eq("uploader_id", user!.id);

      // Fetch downloads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: downloadsCount } = await supabase
        .from("download_logs")
        .select("*", { count: "exact", head: true })
        .eq("uploader_id", user!.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Fetch wallet balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user!.id)
        .single();

      // Fetch subscription
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("status, expiry_date, plan_id, subscription_plans(plan_name)")
        .eq("user_id", user!.id)
        .eq("payment_verified", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Fetch YouTube bonus status
      const { data: profileData } = await supabase
        .from("profiles")
        .select("youtube_bonus_claimed")
        .eq("id", user!.id)
        .single();

      setStats({
        totalUploads: uploadsCount || 0,
        totalDownloads: downloadsCount || 0,
        walletBalance: walletData?.balance || 0,
        subscriptionStatus: subscriptionData?.status || null,
        subscriptionPlan: subscriptionData?.subscription_plans?.plan_name || null,
        expiryDate: subscriptionData?.expiry_date || null,
        youtubeBonusClaimed: profileData?.youtube_bonus_claimed || false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextSaturday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    return nextSaturday.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const handleYouTubeSubscribe = async () => {
    if (stats.youtubeBonusClaimed) {
      toast.info("You've already claimed this bonus!");
      openYouTubeChannel();
      return;
    }

    try {
      // Mark as claimed
      await supabase
        .from("profiles")
        .update({ youtube_bonus_claimed: true })
        .eq("id", user!.id);
      
      // Credit ₹100 bonus
      await supabase.rpc('credit_wallet_bonus', {
        p_user_id: user!.id,
        p_amount: 100
      });

      toast.success("₹100 bonus credited to your wallet!");
      
      // Update local state
      setStats(prev => ({ ...prev, youtubeBonusClaimed: true, walletBalance: prev.walletBalance + 100 }));
      
      // Open YouTube
      openYouTubeChannel();
    } catch (error) {
      console.error("Error claiming bonus:", error);
      toast.error("Failed to claim bonus");
    }
  };

  const openYouTubeChannel = () => {
    if (!youtubeUrl) return;
    // Extract channel handle from URL for deep link
    const url = new URL(youtubeUrl);
    const channelPath = url.pathname;
    const youtubeDeepLink = `vnd.youtube://www.youtube.com${channelPath}?sub_confirmation=1`;
    
    window.location.href = youtubeDeepLink;
    
    setTimeout(() => {
      const fallback = youtubeUrl.includes('sub_confirmation') ? youtubeUrl : `${youtubeUrl}${youtubeUrl.includes('?') ? '&' : '?'}sub_confirmation=1`;
      window.open(fallback, '_blank');
    }, 500);
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your content and earnings</p>
        </div>
        <Button
          className="bg-gradient-to-r from-premium to-premium-light hover:opacity-90"
          onClick={() => navigate("/upload")}
        >
          <Upload className="h-4 w-4 mr-2" />
          New Upload
        </Button>
      </div>

      {/* YouTube Subscribe Bonus Card */}
      <Card className="shadow-card border-2 border-red-500/20 bg-gradient-to-r from-red-500/5 to-red-600/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Youtube className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-semibold">Earn ₹100 Bonus!</p>
              <p className="text-sm text-muted-foreground">
                {stats.youtubeBonusClaimed ? "Already claimed - Visit channel" : "Subscribe to our YouTube channel"}
              </p>
            </div>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleYouTubeSubscribe}
          >
            {stats.youtubeBonusClaimed ? "Visit Channel" : "Subscribe & Earn ₹100"}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Badge */}
      {stats.subscriptionPlan && (
        <Card className="border-premium/20 bg-gradient-to-r from-premium/5 to-premium-light/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-premium" />
              <div>
                <p className="font-semibold text-premium">
                  {stats.subscriptionPlan} Plan Active
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.expiryDate && `Expires: ${new Date(stats.expiryDate).toLocaleDateString("en-IN")}`}
                </p>
              </div>
            </div>
            <Badge className="bg-premium text-premium-foreground">
              {stats.subscriptionStatus?.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUploads === 0 ? "No uploads yet" : "Movies/Series"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Downloads (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.walletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getNextSaturday()}</div>
            <p className="text-xs text-muted-foreground">Every Saturday</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {!stats.subscriptionPlan && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent border border-border">
              <div>
                <h3 className="font-semibold">Subscribe to a Plan</h3>
                <p className="text-sm text-muted-foreground">Start uploading and earning</p>
              </div>
              <Button
                className="bg-gradient-to-r from-premium to-premium-light"
                onClick={() => navigate("/subscriptions")}
              >
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
