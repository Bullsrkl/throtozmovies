import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  upi_id: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
}

export function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const PLATFORM_FEE_PERCENT = 3;

  useEffect(() => {
    if (!user) return;
    fetchWalletData();
    fetchWithdrawals();
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("balance, total_earnings, total_withdrawn")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user!.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  const calculateFee = (amount: number) => {
    return (amount * PLATFORM_FEE_PERCENT) / 100;
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateFee(amount);
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!wallet || withdrawalAmount > wallet.balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }

    setSubmitting(true);
    try {
      const platformFee = calculateFee(withdrawalAmount);
      const netAmount = calculateNetAmount(withdrawalAmount);

      const { error } = await supabase.from("withdrawals").insert({
        user_id: user!.id,
        amount: withdrawalAmount,
        platform_fee: platformFee,
        net_amount: netAmount,
        upi_id: upiId,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Withdrawal request submitted! Payouts are processed every Saturday.");
      setAmount("");
      setUpiId("");
      fetchWithdrawals();
    } catch (error: any) {
      console.error("Error requesting withdrawal:", error);
      toast.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Wallet</h2>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* Wallet Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{wallet?.balance.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{wallet?.total_earnings.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{wallet?.total_withdrawn.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Request Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={wallet?.balance || 0}
                />
                <p className="text-xs text-muted-foreground">
                  Available: ₹{wallet?.balance.toFixed(2) || "0.00"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upi">UPI ID</Label>
                <Input
                  id="upi"
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 rounded-lg bg-accent border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount:</span>
                  <span className="font-semibold">₹{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee ({PLATFORM_FEE_PERCENT}%):</span>
                  <span>- ₹{calculateFee(parseFloat(amount)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                  <span>You'll Receive:</span>
                  <span className="text-premium">₹{calculateNetAmount(parseFloat(amount)).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Payouts are processed every Saturday</span>
            </div>

            <Button
              type="submit"
              disabled={submitting || !amount || !upiId}
              className="w-full bg-gradient-to-r from-premium to-premium-light"
            >
              {submitting ? "Submitting..." : "Request Withdrawal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
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
                    <TableHead>Fee</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>UPI ID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {new Date(withdrawal.requested_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>₹{withdrawal.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        ₹{withdrawal.platform_fee.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{withdrawal.net_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{withdrawal.upi_id}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            withdrawal.status === "paid"
                              ? "bg-premium text-premium-foreground"
                              : withdrawal.status === "rejected"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {withdrawal.status.toUpperCase()}
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
