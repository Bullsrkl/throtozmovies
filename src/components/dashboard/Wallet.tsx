import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet as WalletIcon, DollarSign, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WalletData {
  balance: number;
  total_earnings: number;
  total_withdrawn: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  net_amount: number;
  platform_fee: number;
  usdt_address: string | null;
  network: string | null;
  status: string;
  requested_at: string;
}

export function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [network, setNetwork] = useState("BEP20");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const MIN_WITHDRAWAL = 100;
  const PLATFORM_FEE_PERCENT = 0; // No fee for now

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchWithdrawals();
    }
  }, [user]);

  const fetchWalletData = async () => {
    const { data } = await supabase.from("wallets").select("balance, total_earnings, total_withdrawn").eq("user_id", user!.id).single();
    setWallet(data);
    setLoading(false);
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase.from("withdrawals").select("*").eq("user_id", user!.id).order("requested_at", { ascending: false });
    setWithdrawals((data as Withdrawal[]) || []);
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawalAmount = parseFloat(amount);

    if (!withdrawalAmount || withdrawalAmount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
      return;
    }
    if (!wallet || withdrawalAmount > wallet.balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!usdtAddress.trim()) {
      toast.error("Please enter your USDT address");
      return;
    }

    // Check if user has a master (funded) account
    const { count } = await supabase.from("trading_accounts").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("phase", "master");
    if (!count || count === 0) {
      toast.error("Withdrawals are only available for funded (master) accounts.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user!.id,
        amount: withdrawalAmount,
        platform_fee: 0,
        net_amount: withdrawalAmount,
        upi_id: "N/A",
        usdt_address: usdtAddress,
        network: network,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Withdrawal request submitted!");
      setAmount("");
      setUsdtAddress("");
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading wallet...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your profits and withdrawals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet?.balance?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet?.total_earnings?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet?.total_withdrawn?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input type="number" step="0.01" placeholder="Min $100" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
                    <SelectItem value="ERC20">ERC20 (Ethereum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>USDT Address</Label>
              <Input placeholder="0x..." value={usdtAddress} onChange={(e) => setUsdtAddress(e.target.value)} className="font-mono" />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Withdrawals are processed within 24 hours</span>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              {submitting ? "Submitting..." : "Request Withdrawal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>USDT Address</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{new Date(w.requested_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">${w.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-xs">{w.usdt_address || "N/A"}</TableCell>
                      <TableCell>{w.network || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={
                          w.status === "paid" ? "bg-primary/10 text-primary" :
                          w.status === "rejected" ? "bg-destructive/10 text-destructive" :
                          "bg-muted text-muted-foreground"
                        }>
                          {w.status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
