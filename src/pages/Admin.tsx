import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Wallet, TrendingUp, CheckCircle, XCircle, Crown, Search, Settings, Menu, X, BarChart3, MessageSquare, Copy, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "payments", label: "Payments", icon: TrendingUp },
  { key: "withdrawals", label: "Withdrawals", icon: Wallet },
  { key: "history", label: "History", icon: Clock },
  { key: "users", label: "Users", icon: Users },
  { key: "reports", label: "Reports", icon: MessageSquare },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, pendingPayments: 0, pendingWithdrawals: 0, openReports: 0 });

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
      fetchReports();
      fetchAllHistory();
    }
  }, [user, isAdmin]);

  const fetchSettings = async () => {
    const { data } = await supabase.from("platform_settings").select("value").eq("key", "usdt_deposit_address").single();
    if (data) setUsdtAddress(data.value);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from("withdrawal_reports" as any)
      .select("*, profiles:user_id(email, full_name), withdrawals:withdrawal_id(amount, usdt_address, network, status)")
      .order("created_at", { ascending: false });
    setReports((data as any[]) || []);
  };

  const fetchAllHistory = async () => {
    const { data: pData } = await supabase
      .from("challenge_purchases")
      .select("*, profiles(email, full_name), challenge_plans(account_size, challenge_type, price_usd)")
      .order("created_at", { ascending: false });
    setAllPurchases(pData || []);

    const { data: wData } = await supabase
      .from("withdrawals")
      .select("*, profiles(email, full_name)")
      .order("requested_at", { ascending: false });
    setAllWithdrawals(wData || []);
  };

  const fetchData = async () => {
    const { data: purchaseData } = await supabase
      .from("challenge_purchases")
      .select("*, profiles(email, full_name), challenge_plans(account_size, challenge_type, price_usd)")
      .eq("status", "payment_submitted")
      .order("created_at", { ascending: false });
    setPurchases(purchaseData || []);

    const { data: withdrawalData } = await supabase
      .from("withdrawals")
      .select("*, profiles(email, full_name)")
      .eq("status", "pending")
      .order("requested_at", { ascending: false });
    setWithdrawals(withdrawalData || []);

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
      openReports: 0,
    });
  };

  const handleApprovePurchase = async (purchaseId: string, userId: string, planData: any) => {
    const accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    const password = Math.random().toString(36).slice(-8);
    const { error: accountError } = await supabase.from("trading_accounts").insert({
      user_id: userId, purchase_id: purchaseId, account_number: accountNumber, password,
      balance: planData.account_size,
      profit_target: planData.challenge_type === "two_step" ? 8 : planData.challenge_type === "one_step" ? 10 : 0,
      phase: planData.challenge_type === "instant" ? "master" : "phase1",
      status: planData.challenge_type === "instant" ? "funded" : "active",
    });
    if (accountError) { toast.error("Failed to create trading account"); return; }
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

  const handleResolveReport = async (reportId: string, response: string) => {
    await supabase.from("withdrawal_reports" as any).update({
      status: "resolved",
      admin_response: response,
      resolved_at: new Date().toISOString(),
    } as any).eq("id", reportId);
    toast.success("Report resolved!");
    fetchReports();
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await supabase.from("platform_settings").upsert({ key: "usdt_deposit_address", value: usdtAddress, updated_at: new Date().toISOString() });
    toast.success("Settings saved!");
    setSavingSettings(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto px-4 py-12 text-center">Loading...</div></div>;
  if (!user || !isAdmin) return null;

  const filteredHistoryPurchases = allPurchases.filter((p: any) =>
    !historySearch || p.profiles?.email?.toLowerCase().includes(historySearch.toLowerCase())
  );
  const filteredHistoryWithdrawals = allWithdrawals.filter((w: any) =>
    !historySearch || w.profiles?.email?.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-[73px] left-0 z-40 h-[calc(100vh-73px)] bg-card border-r border-border transition-all duration-300
          ${sidebarCollapsed ? "md:w-16" : "md:w-64"} w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              {!sidebarCollapsed && (
                <span className="font-display font-bold bg-gradient-to-r from-admin to-admin-light bg-clip-text text-transparent">Admin</span>
              )}
              {/* Desktop collapse toggle */}
              <Button variant="ghost" size="icon" className="hidden md:flex ml-auto" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              {/* Mobile close */}
              <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1 p-2">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      sidebarCollapsed ? "justify-center" : ""
                    } ${
                      activeTab === item.key
                        ? "bg-gradient-to-r from-admin/10 to-admin-light/10 text-admin border-l-2 border-admin"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span>{item.label}</span>
                        {item.key === "payments" && stats.pendingPayments > 0 && (
                          <Badge className="ml-auto bg-destructive/20 text-destructive text-xs">{stats.pendingPayments}</Badge>
                        )}
                        {item.key === "withdrawals" && stats.pendingWithdrawals > 0 && (
                          <Badge className="ml-auto bg-destructive/20 text-destructive text-xs">{stats.pendingWithdrawals}</Badge>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile hamburger trigger in header area */}
        <div className="fixed top-[73px] left-0 right-0 z-30 md:hidden bg-card border-b border-border px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display font-bold text-sm bg-gradient-to-r from-admin to-admin-light bg-clip-text text-transparent">
            {SIDEBAR_ITEMS.find(s => s.key === activeTab)?.label || "Admin"}
          </span>
          <Badge className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground text-xs"><Crown className="h-3 w-3 mr-1" /> Admin</Badge>
        </div>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl space-y-6 mt-12 md:mt-0">
          <div className="hidden md:flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-display font-bold bg-gradient-to-r from-admin to-admin-light bg-clip-text text-transparent">
              {SIDEBAR_ITEMS.find(s => s.key === activeTab)?.label || "Admin"}
            </h1>
            <Badge className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground"><Crown className="h-3 w-3 mr-1" /> Admin</Badge>
          </div>

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-admin/20 gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-admin" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-admin">{stats.totalUsers}</div></CardContent>
              </Card>
              <Card className="border-admin/20 gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Pending Payments</CardTitle>
                  <TrendingUp className="h-4 w-4 text-admin" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-admin">{stats.pendingPayments}</div></CardContent>
              </Card>
              <Card className="border-admin/20 gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Pending Withdrawals</CardTitle>
                  <Wallet className="h-4 w-4 text-admin" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-admin">{stats.pendingWithdrawals}</div></CardContent>
              </Card>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <Card className="gradient-card">
              <CardHeader><CardTitle>Pending Challenge Payments</CardTitle></CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending payments</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Discount</TableHead>
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
                            <TableCell>${p.challenge_plans?.account_size?.toLocaleString()} - {p.challenge_plans?.challenge_type?.replace("_", "-")}</TableCell>
                            <TableCell className="font-semibold">
                              ${p.challenge_plans?.price_usd}
                              {p.discount_code && <span className="block text-xs text-primary">After 25% off: ${(p.challenge_plans?.price_usd * 0.75).toFixed(2)}</span>}
                            </TableCell>
                            <TableCell>
                              {p.discount_code ? <Badge className="bg-primary/10 text-primary text-xs">{p.discount_code}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                            </TableCell>
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Withdrawals */}
          {activeTab === "withdrawals" && (
            <Card className="gradient-card">
              <CardHeader><CardTitle>Pending Withdrawals</CardTitle></CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
                ) : (
                  <div className="overflow-x-auto">
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
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-xs max-w-[120px] truncate">{w.usdt_address || "N/A"}</span>
                                {w.usdt_address && (
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(w.usdt_address)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{w.network || "N/A"}</TableCell>
                            <TableCell>{new Date(w.requested_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground" onClick={() => handleApproveWithdrawal(w.id)}>
                                  <CheckCircle className="h-3 w-3 mr-1" /> Paid
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by email..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="pl-10" />
              </div>

              <Card className="gradient-card">
                <CardHeader><CardTitle>Challenge Purchases ({filteredHistoryPurchases.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistoryPurchases.slice(0, 50).map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{p.profiles?.full_name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{p.profiles?.email}</div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {p.challenge_plans?.challenge_type?.replace("_", "-")} — ${p.challenge_plans?.account_size?.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-semibold text-sm">${p.challenge_plans?.price_usd}</TableCell>
                            <TableCell>
                              <Badge className={
                                p.status === "approved" ? "bg-primary/10 text-primary" :
                                p.status === "rejected" ? "bg-destructive/10 text-destructive" :
                                p.status === "payment_submitted" ? "bg-admin/10 text-admin" :
                                "bg-muted text-muted-foreground"
                              }>{p.status?.replace("_", " ").toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader><CardTitle>Withdrawals ({filteredHistoryWithdrawals.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Net</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Network</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistoryWithdrawals.slice(0, 50).map((w: any) => (
                          <TableRow key={w.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{w.profiles?.full_name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{w.profiles?.email}</div>
                            </TableCell>
                            <TableCell className="font-semibold text-sm">${w.amount}</TableCell>
                            <TableCell className="text-sm">${w.net_amount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-xs max-w-[100px] truncate">{w.usdt_address || "N/A"}</span>
                                {w.usdt_address && (
                                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(w.usdt_address)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{w.network || "N/A"}</TableCell>
                            <TableCell>
                              <Badge className={
                                w.status === "paid" ? "bg-primary/10 text-primary" :
                                w.status === "rejected" ? "bg-destructive/10 text-destructive" :
                                "bg-muted text-muted-foreground"
                              }>{w.status?.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(w.requested_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>All Users ({users.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports */}
          {activeTab === "reports" && (
            <Card className="gradient-card">
              <CardHeader><CardTitle>Withdrawal Reports ({reports.length})</CardTitle></CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reports</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map((r: any) => (
                      <Card key={r.id} className="p-4 gradient-card space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{(r.profiles as any)?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{(r.profiles as any)?.email}</p>
                          </div>
                          <Badge className={r.status === "resolved" ? "bg-primary/10 text-primary" : "bg-admin/10 text-admin"}>
                            {r.status?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Withdrawal:</strong> ${(r.withdrawals as any)?.amount || "N/A"} — {(r.withdrawals as any)?.network || "N/A"}</p>
                          {(r.withdrawals as any)?.usdt_address && (
                            <p className="font-mono text-xs">Address: {(r.withdrawals as any)?.usdt_address}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                          <p className="font-medium mb-1">User Message:</p>
                          <p className="text-muted-foreground">{r.message}</p>
                        </div>
                        {r.admin_response && (
                          <div className="p-3 rounded-lg bg-primary/5 text-sm">
                            <p className="font-medium mb-1">Admin Response:</p>
                            <p className="text-muted-foreground">{r.admin_response}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">Submitted: {new Date(r.created_at).toLocaleString()}</p>
                        {r.status !== "resolved" && (
                          <ResolveReport reportId={r.id} onResolve={handleResolveReport} />
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <Card className="gradient-card">
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
          )}
        </main>
      </div>
    </div>
  );
}

function ResolveReport({ reportId, onResolve }: { reportId: string; onResolve: (id: string, response: string) => void }) {
  const [response, setResponse] = useState("");
  return (
    <div className="flex gap-2">
      <Input placeholder="Admin response..." value={response} onChange={(e) => setResponse(e.target.value)} className="flex-1" />
      <Button size="sm" className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground" onClick={() => { if (response.trim()) onResolve(reportId, response); }}>
        Resolve
      </Button>
    </div>
  );
}
