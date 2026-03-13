import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Wallet, TrendingUp, CheckCircle, XCircle, Crown, Search, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, pendingPayments: 0, pendingWithdrawals: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error("Access Denied: Admin only");
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
      fetchSettings();
    }
  }, [user, isAdmin]);

  const fetchSettings = async () => {
    const { data } = await supabase.from("platform_settings").select("value").eq("key", "usdt_deposit_address").single();
    if (data) setUsdtAddress(data.value);
  };

  const fetchData = async () => {
    // Pending challenge purchases
    const { data: purchaseData } = await supabase
      .from("challenge_purchases")
      .select("*, profiles(email, full_name), challenge_plans(account_size, challenge_type, price_usd)")
      .eq("status", "payment_submitted")
      .order("created_at", { ascending: false });
    setPurchases(purchaseData || []);

    // Pending withdrawals
    const { data: withdrawalData } = await supabase
      .from("withdrawals")
      .select("*, profiles(email, full_name)")
      .eq("status", "pending")
      .order("requested_at", { ascending: false });
    setWithdrawals(withdrawalData || []);

    // Users
    const { data: userData } = await supabase
      .from("profiles")
      .select("*, wallets(balance), trading_accounts(id)")
      .order("created_at", { ascending: false });
    setUsers(userData || []);

    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

    setStats({
      totalUsers: userCount || 0,
      pendingPayments: purchaseData?.length || 0,
      pendingWithdrawals: withdrawalData?.length || 0,
    });
  };

  const handleApprovePurchase = async (purchaseId: string, userId: string, planData: any) => {
    // Generate trading account
    const accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    const password = Math.random().toString(36).slice(-8);

    const { error: accountError } = await supabase.from("trading_accounts").insert({
      user_id: userId,
      purchase_id: purchaseId,
      account_number: accountNumber,
      password: password,
      balance: planData.account_size,
      profit_target: planData.challenge_type === "two_step" ? 8 : planData.challenge_type === "one_step" ? 10 : 0,
      phase: planData.challenge_type === "instant" ? "master" : "phase1",
      status: planData.challenge_type === "instant" ? "funded" : "active",
    });

    if (accountError) {
      toast.error("Failed to create trading account");
      return;
    }

    await supabase.from("challenge_purchases").update({ status: "approved" }).eq("id", purchaseId);
    toast.success(`Trading account #${accountNumber} created!`);
    fetchData();
  };

  const handleRejectPurchase = async (purchaseId: string) => {
    await supabase.from("challenge_purchases").update({ status: "rejected" }).eq("id", purchaseId);
    toast.error("Purchase rejected");
    fetchData();
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    const withdrawal = withdrawals.find((w: any) => w.id === withdrawalId);
    if (!withdrawal) return;

    await supabase.from("withdrawals").update({ status: "paid", processed_at: new Date().toISOString() }).eq("id", withdrawalId);

    const { data: walletData } = await supabase.from("wallets").select("balance, total_withdrawn").eq("user_id", withdrawal.user_id).single();
    if (walletData) {
      await supabase.from("wallets").update({
        balance: walletData.balance - withdrawal.amount,
        total_withdrawn: (walletData.total_withdrawn || 0) + withdrawal.net_amount,
      }).eq("user_id", withdrawal.user_id);
    }

    toast.success("Withdrawal approved!");
    fetchData();
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", withdrawalId);
    toast.error("Withdrawal rejected");
    fetchData();
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await supabase.from("platform_settings").upsert({ key: "usdt_deposit_address", value: usdtAddress, updated_at: new Date().toISOString() });
    toast.success("Settings saved!");
    setSavingSettings(false);
  };

  if (loading) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto px-4 py-12 text-center">Loading...</div></div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-admin to-admin-light bg-clip-text text-transparent">Admin Dashboard</h1>
          <Badge className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground"><Crown className="h-3 w-3 mr-1" /> Admin</Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-admin/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Users</CardTitle>
              <Users className="h-4 w-4 text-admin" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-admin">{stats.totalUsers}</div></CardContent>
          </Card>
          <Card className="border-admin/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Pending Payments</CardTitle>
              <TrendingUp className="h-4 w-4 text-admin" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-admin">{stats.pendingPayments}</div></CardContent>
          </Card>
          <Card className="border-admin/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Pending Withdrawals</CardTitle>
              <Wallet className="h-4 w-4 text-admin" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-admin">{stats.pendingWithdrawals}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="bg-card border border-admin/20">
            <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">Payments Review</TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">Withdrawals</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">Users</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-admin data-[state=active]:to-admin-light data-[state=active]:text-admin-foreground">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Pending Challenge Payments</CardTitle></CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending payments</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tx ID</TableHead>
                        <TableHead>Screenshot</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="font-medium">{p.profiles?.full_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{p.profiles?.email}</div>
                          </TableCell>
                          <TableCell>
                            ${p.challenge_plans?.account_size?.toLocaleString()} - {p.challenge_plans?.challenge_type?.replace("_", "-")}
                          </TableCell>
                          <TableCell className="font-semibold">${p.challenge_plans?.price_usd}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[150px] truncate">{p.transaction_id || "N/A"}</TableCell>
                          <TableCell>
                            {p.payment_screenshot_url ? (
                              <a href={p.payment_screenshot_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">View</Button>
                              </a>
                            ) : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground" onClick={() => handleApprovePurchase(p.id, p.user_id, p.challenge_plans)}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectPurchase(p.id)}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
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

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader><CardTitle>Pending Withdrawals</CardTitle></CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>USDT Address</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w: any) => (
                        <TableRow key={w.id}>
                          <TableCell>
                            <div className="font-medium">{w.profiles?.full_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{w.profiles?.email}</div>
                          </TableCell>
                          <TableCell className="font-semibold">${w.amount}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[150px] truncate">{w.usdt_address || "N/A"}</TableCell>
                          <TableCell>{w.network || "N/A"}</TableCell>
                          <TableCell>{new Date(w.requested_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground" onClick={() => handleApproveWithdrawal(w.id)}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(w.id)}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
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

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Users ({users.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Accounts</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter((u: any) => !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.full_name || "N/A"}</TableCell>
                          <TableCell>${u.wallets?.[0]?.balance?.toFixed(2) || "0.00"}</TableCell>
                          <TableCell><Badge variant="outline">{u.trading_accounts?.length || 0}</Badge></TableCell>
                          <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> System Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>USDT Deposit Address (BEP20)</Label>
                  <Input value={usdtAddress} onChange={(e) => setUsdtAddress(e.target.value)} className="font-mono" />
                </div>
                <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground">
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
