import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Wallet, TrendingUp, CheckCircle, XCircle, Trash2, Crown, UserCog, Megaphone, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  payment_verified: boolean;
  payment_receipt_url: string | null;
  start_date: string;
  expiry_date: string;
  profiles: { email: string; full_name: string | null };
  subscription_plans: { plan_name: string; price_inr: number };
}

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  platform_fee: number;
  upi_id: string;
  status: string;
  requested_at: string;
  profiles: { email: string; full_name: string | null };
}

interface Movie {
  id: string;
  title: string;
  uploader_id: string;
  views: number;
  downloads: number;
  clicks: number;
  impressions: number;
  is_promoted: boolean;
  promoted_until: string | null;
  created_at: string;
  profiles: { email: string; full_name: string | null };
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  subscription?: {
    status: string;
    subscription_plans: { plan_name: string };
  } | null;
  wallets?: { balance: number }[];
  movies?: { id: string }[];
}

interface PromotionRequest {
  id: string;
  user_id: string;
  movie_id: string;
  duration_days: number;
  status: string;
  requested_at: string;
  admin_notes: string | null;
  profiles: {
    email: string;
    full_name: string | null;
  };
  movies: {
    id: string;
    title: string;
    poster_url: string;
  };
}

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>([]);
  const [promotionNotes, setPromotionNotes] = useState<{ [key: string]: string }>({});
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalMovies: 0, pendingPayments: 0, pendingWithdrawals: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error("Access Denied: Admin only");
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
      fetchPlatformSettings();
    }
  }, [user, isAdmin]);

  const fetchPlatformSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'youtube_channel_url')
      .single();
    if (data) setYoutubeUrl(data.value);
  };

  const handleSaveYoutubeUrl = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    setSavingSettings(true);
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key: 'youtube_channel_url', value: youtubeUrl.trim(), updated_at: new Date().toISOString() });
    
    if (error) {
      toast.error("Failed to save YouTube URL");
    } else {
      toast.success("YouTube channel URL updated!");
    }
    setSavingSettings(false);
  };

  const fetchData = async () => {
    // Fetch pending subscriptions
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*, profiles(email, full_name), subscription_plans(plan_name, price_inr)')
      .eq('payment_verified', false)
      .order('start_date', { ascending: false });
    
    if (subData) setSubscriptions(subData as any);

    // Fetch pending withdrawals
    const { data: withdrawalData } = await supabase
      .from('withdrawals')
      .select('*, profiles(email, full_name)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    
    if (withdrawalData) setWithdrawals(withdrawalData as any);

    // Fetch movies
    const { data: movieData } = await supabase
      .from('movies')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (movieData) setMovies(movieData as any);

    // Fetch all users with detailed data (left join to include users without subscriptions)
    const { data: userData } = await supabase
      .from('profiles')
      .select(`
        *,
        subscriptions(status, subscription_plans(plan_name)),
        wallets(balance),
        movies(id)
      `)
      .order('created_at', { ascending: false });
    
    if (userData) {
      // Transform data to get latest subscription
      const transformedUsers = userData.map((user: any) => ({
        ...user,
        subscription: Array.isArray(user.subscriptions) ? user.subscriptions[0] : null,
        wallets: user.wallets || [],
        movies: user.movies || []
      }));
      setUsers(transformedUsers);
    }

    // Fetch promotion requests
    const { data: promoData } = await supabase
      .from('promotion_requests')
      .select('*, profiles(email, full_name), movies(id, title, poster_url)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    
    if (promoData) setPromotionRequests(promoData as any);

    // Fetch stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: movieCount } = await supabase.from('movies').select('*', { count: 'exact', head: true });
    
    setStats({
      totalUsers: userCount || 0,
      totalMovies: movieCount || 0,
      pendingPayments: subData?.length || 0,
      pendingWithdrawals: withdrawalData?.length || 0
    });
  };

  const handleApprovePayment = async (subscriptionId: string, expiryDate: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ payment_verified: true, status: 'active' })
      .eq('id', subscriptionId);

    if (error) {
      toast.error("Failed to approve payment");
    } else {
      toast.success("Payment approved!");
      fetchData();
    }
  };

  const handleRejectPayment = async (subscriptionId: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (error) {
      toast.error("Failed to reject payment");
    } else {
      toast.error("Payment rejected");
      fetchData();
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string, upiId: string, amount: number) => {
    // Open UPI deep link
    const upiLink = `upi://pay?pa=${upiId}&pn=Creator&am=${amount}&cu=INR`;
    window.open(upiLink, '_blank');

    toast.success(`UPI payment link opened for ₹${amount}. Mark as paid after transfer.`);
  };

  const handleCompleteWithdrawal = async (withdrawalId: string) => {
    // Get withdrawal details
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return;

    // Update withdrawal status
    const { error: withdrawalError } = await supabase
      .from('withdrawals')
      .update({ status: 'paid', processed_at: new Date().toISOString() })
      .eq('id', withdrawalId);

    if (withdrawalError) {
      toast.error("Failed to complete withdrawal");
      return;
    }

    // Update user wallet - deduct amount and update total_withdrawn
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance, total_withdrawn')
      .eq('user_id', withdrawal.user_id)
      .single();

    if (walletData) {
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: walletData.balance - withdrawal.amount,
          total_withdrawn: (walletData.total_withdrawn || 0) + withdrawal.net_amount
        })
        .eq('user_id', withdrawal.user_id);

      if (walletError) {
        toast.error("Failed to update wallet");
        return;
      }
    }

    toast.success("Withdrawal completed and wallet updated!");
    fetchData();
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawalId);

    if (error) {
      toast.error("Failed to reject withdrawal");
    } else {
      toast.error("Withdrawal rejected");
      fetchData();
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId);

    if (error) {
      toast.error("Failed to delete movie");
    } else {
      toast.success("Movie deleted");
      fetchData();
    }
  };

  const handleApprovePromotion = async (requestId: string, movieId: string, durationDays: number) => {
    const notes = promotionNotes[requestId] || "";
    
    // Calculate promoted_until date
    const promotedUntil = new Date();
    promotedUntil.setDate(promotedUntil.getDate() + durationDays);

    // Update movie promotion
    const { error: movieError } = await supabase
      .from('movies')
      .update({
        is_promoted: true,
        promoted_until: promotedUntil.toISOString()
      })
      .eq('id', movieId);

    if (movieError) {
      toast.error("Failed to promote movie");
      return;
    }

    // Update promotion request
    const { error: requestError } = await supabase
      .from('promotion_requests')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', requestId);

    if (requestError) {
      toast.error("Failed to update request");
    } else {
      toast.success("Promotion approved!");
      fetchData();
    }
  };

  const handleRejectPromotion = async (requestId: string) => {
    const notes = promotionNotes[requestId] || "";

    const { error } = await supabase
      .from('promotion_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', requestId);

    if (error) {
      toast.error("Failed to reject promotion");
    } else {
      toast.error("Promotion request rejected");
      fetchData();
    }
  };

  const handleInstantPromote = async (movieId: string) => {
    const days = prompt("Enter promotion duration (in days):", "7");
    if (!days) return;

    const durationDays = parseInt(days);
    if (isNaN(durationDays) || durationDays <= 0) {
      toast.error("Invalid duration");
      return;
    }

    const promotedUntil = new Date();
    promotedUntil.setDate(promotedUntil.getDate() + durationDays);

    const { error } = await supabase
      .from('movies')
      .update({
        is_promoted: true,
        promoted_until: promotedUntil.toISOString()
      })
      .eq('id', movieId);

    if (error) {
      toast.error("Failed to promote movie");
    } else {
      toast.success(`Movie promoted for ${durationDays} days!`);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with golden theme */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-admin to-admin-light bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <Badge className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">Manage platform operations</p>
            </div>
          </div>

          {/* Stats Grid - Golden Theme */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-card border-admin/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-admin" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-admin">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-admin/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                <FileText className="h-4 w-4 text-admin" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-admin">{stats.totalMovies}</div>
                <p className="text-xs text-muted-foreground">Uploaded content</p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-admin/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <TrendingUp className="h-4 w-4 text-admin" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-admin">{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Awaiting verification</p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-admin/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                <Wallet className="h-4 w-4 text-admin" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-admin">{stats.pendingWithdrawals}</div>
                <p className="text-xs text-muted-foreground">Saturday payouts</p>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="payments" className="space-y-6">
            <TabsList className="bg-card border border-admin/20">
              <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">
                Payment Verification
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">
                Withdrawal Requests
              </TabsTrigger>
              <TabsTrigger value="movies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">
                Movie Management
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">
                User Management
              </TabsTrigger>
              <TabsTrigger value="promotions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">
                Promotion Requests
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">
                Platform Settings
              </TabsTrigger>
            </TabsList>

            {/* Payment Verification Tab */}
            <TabsContent value="payments">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Pending Payment Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending payments</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Receipt</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{sub.profiles.full_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{sub.profiles.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{sub.subscription_plans.plan_name}</TableCell>
                            <TableCell className="font-semibold">₹{sub.subscription_plans.price_inr}</TableCell>
                            <TableCell className="text-sm">{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {sub.payment_receipt_url ? (
                                <a href={sub.payment_receipt_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm">View</Button>
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-sm">No receipt</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-gradient-to-r from-premium to-premium-light" onClick={() => handleApprovePayment(sub.id, sub.expiry_date)}>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectPayment(sub.id)}>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Withdrawal Requests Tab */}
            <TabsContent value="withdrawals">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Pending Withdrawal Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {withdrawals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Platform Fee (3%)</TableHead>
                          <TableHead>Net Amount</TableHead>
                          <TableHead>UPI ID</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{withdrawal.profiles.full_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{withdrawal.profiles.email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">₹{withdrawal.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">₹{withdrawal.platform_fee}</TableCell>
                            <TableCell className="font-bold text-admin">₹{withdrawal.net_amount}</TableCell>
                            <TableCell className="font-mono text-sm">{withdrawal.upi_id}</TableCell>
                            <TableCell className="text-sm">{new Date(withdrawal.requested_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-gradient-to-r from-admin to-admin-light" onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal.upi_id, withdrawal.net_amount)}>
                                  Pay via UPI
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleCompleteWithdrawal(withdrawal.id)}>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark Paid
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(withdrawal.id)}>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Movie Management Tab */}
            <TabsContent value="movies">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Movies ({movies.length})</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by title..."
                        value={movieSearchQuery}
                        onChange={(e) => setMovieSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {movies.filter(m => m.title.toLowerCase().includes(movieSearchQuery.toLowerCase())).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No movies found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Uploader</TableHead>
                            <TableHead>Impressions</TableHead>
                            <TableHead>Clicks</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>CTR %</TableHead>
                            <TableHead>Promoted</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movies
                            .filter(m => m.title.toLowerCase().includes(movieSearchQuery.toLowerCase()))
                            .map((movie) => {
                              const ctr = movie.impressions > 0 
                                ? ((movie.clicks || 0) / movie.impressions * 100).toFixed(2)
                                : '0.00';
                              const isPromoted = movie.is_promoted && movie.promoted_until && new Date(movie.promoted_until) > new Date();
                              
                              return (
                                <TableRow key={movie.id}>
                                  <TableCell className="font-medium">{movie.title}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="text-sm">{movie.profiles.full_name || 'N/A'}</div>
                                      <div className="text-xs text-muted-foreground">{movie.profiles.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{movie.impressions || 0}</TableCell>
                                  <TableCell>{movie.clicks || 0}</TableCell>
                                  <TableCell>{movie.downloads || 0}</TableCell>
                                  <TableCell className="font-semibold">{ctr}%</TableCell>
                                  <TableCell>
                                    {isPromoted ? (
                                      <Badge className="bg-premium text-premium-foreground">
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">No</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-admin/30"
                                        onClick={() => handleInstantPromote(movie.id)}
                                      >
                                        <Megaphone className="h-3 w-3 mr-1" />
                                        Promote
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteMovie(movie.id)}>
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      All Users ({users.length})
                    </CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Subscription</TableHead>
                            <TableHead>Wallet Balance</TableHead>
                            <TableHead>Uploads</TableHead>
                            <TableHead>Registered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users
                            .filter((user) =>
                              userSearchQuery
                                ? user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                  (user.full_name && user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()))
                                : true
                            )
                            .map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.full_name || 'N/A'}</TableCell>
                                <TableCell>
                                  {user.subscription ? (
                                    <Badge className="bg-premium text-premium-foreground">
                                      {user.subscription.subscription_plans.plan_name}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">No Plan</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  ₹{user.wallets && user.wallets[0] ? user.wallets[0].balance.toFixed(2) : '0.00'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{user.movies ? user.movies.length : 0}</Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {new Date(user.created_at).toLocaleDateString('en-IN')}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Promotion Requests Tab */}
            <TabsContent value="promotions">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Pending Promotion Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {promotionRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending promotion requests</p>
                  ) : (
                    <div className="space-y-4">
                      {promotionRequests.map((request) => (
                        <div key={request.id} className="border border-border rounded-lg p-4">
                          <div className="flex gap-4">
                            <img src={request.movies.poster_url} alt={request.movies.title} className="w-20 h-28 object-cover rounded" />
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-lg">{request.movies.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Requested by {request.profiles.email} • {request.duration_days} days
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.requested_at).toLocaleDateString()}
                              </p>
                              <Textarea
                                placeholder="Admin notes (optional)"
                                value={promotionNotes[request.id] || ""}
                                onChange={(e) => setPromotionNotes({...promotionNotes, [request.id]: e.target.value})}
                                className="mt-2"
                              />
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="bg-gradient-to-r from-premium to-premium-light" onClick={() => handleApprovePromotion(request.id, request.movies.id, request.duration_days)}>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectPromotion(request.id)}>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
