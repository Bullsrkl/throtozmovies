import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Wallet as WalletIcon, DollarSign, TrendingUp, Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TradingAccount {
  id: string;
  account_number: string;
  balance: number;
  phase: string;
  status: string;
  profit_percent: number;
  challenge_plans: {
    account_size: number;
    challenge_type: string;
  };
}

const NETWORKS = ["BEP20", "ERC20", "TRC20", "Polygon", "Arbitrum", "Solana"];

export function Wallet() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [network, setNetwork] = useState("BEP20");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);

  const MIN_WITHDRAWAL = 100;
  const PLATFORM_FEE_PERCENT = 0;

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from("trading_accounts")
      .select("id, account_number, balance, phase, status, profit_percent, purchase_id")
      .eq("user_id", user!.id)
      .in("status", ["active", "funded"]);

    if (data && data.length > 0) {
      const purchaseIds = data.map(a => a.purchase_id);
      const { data: purchases } = await supabase
        .from("challenge_purchases")
        .select("id, plan_id, challenge_plans(account_size, challenge_type)")
        .in("id", purchaseIds);

      const purchaseMap: Record<string, any> = {};
      purchases?.forEach(p => { purchaseMap[p.id] = p.challenge_plans; });

      const enriched = data.map(a => ({
        ...a,
        challenge_plans: purchaseMap[a.purchase_id] || { account_size: 0, challenge_type: "unknown" },
      })) as TradingAccount[];

      setAccounts(enriched);
      if (!selectedAccountId && enriched.length > 0) setSelectedAccountId(enriched[0].id);
    }
    setLoading(false);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const accountProfit = selectedAccount ? Math.max(0, selectedAccount.balance - selectedAccount.challenge_plans.account_size) : 0;
  const eligibleAmount = selectedAccount?.phase === "master" ? accountProfit : 0;
  const eligibilityPercent = MIN_WITHDRAWAL > 0 ? Math.min(100, (eligibleAmount / MIN_WITHDRAWAL) * 100) : 0;

  const handlePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawalAmount = parseFloat(amount);

    if (!withdrawalAmount || withdrawalAmount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL}`); return;
    }
    if (withdrawalAmount > eligibleAmount) {
      toast.error("Amount exceeds eligible withdrawal balance"); return;
    }
    if (!usdtAddress.trim()) {
      toast.error("Please enter your USDT address"); return;
    }
    if (!selectedAccount || selectedAccount.phase !== "master") {
      toast.error("Withdrawals are only available for funded (master) accounts."); return;
    }

    const fee = withdrawalAmount * PLATFORM_FEE_PERCENT / 100;
    const net = withdrawalAmount - fee;
    const txRef = `WD-${Date.now().toString(36).toUpperCase()}`;

    setConfirmData({ amount: withdrawalAmount, fee, net, address: usdtAddress, network, txRef, date: new Date().toLocaleString() });
    setShowConfirm(true);
  };

  const confirmWithdrawal = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user!.id,
        amount: confirmData.amount,
        platform_fee: confirmData.fee,
        net_amount: confirmData.net,
        usdt_address: confirmData.address,
        network: confirmData.network,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Withdrawal request submitted!");
      setAmount(""); setUsdtAddress(""); setShowConfirm(false); setConfirmData(null);
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

      {/* Account Selector */}
      {accounts.length > 0 && (
        <Card className="gradient-card">
          <CardContent className="p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Select Active Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.challenge_plans.challenge_type.replace("_", "-")} — ${a.challenge_plans.account_size.toLocaleString()} (#{a.account_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${selectedAccount?.balance?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{selectedAccount?.phase === "master" ? "Funded Account" : selectedAccount?.phase || "No account"}</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trading Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${accountProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{selectedAccount?.profit_percent?.toFixed(1) || "0"}% return</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible to Withdraw</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${eligibleAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{selectedAccount?.phase === "master" ? "Available" : "Fund account first"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Progress Bar */}
      <Card className="gradient-card">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Withdrawal Eligibility</span>
            <span className="font-medium">{eligibilityPercent.toFixed(0)}%</span>
          </div>
          <Progress value={eligibilityPercent} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {eligibleAmount >= MIN_WITHDRAWAL
              ? "✅ You are eligible to request a withdrawal"
              : `Need $${(MIN_WITHDRAWAL - eligibleAmount).toFixed(2)} more profit to withdraw`}
          </p>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Card className="gradient-card">
        <CardHeader><CardTitle>Request Withdrawal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePayout} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input type="number" step="0.01" placeholder="Min $100" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
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

            <Button type="submit" disabled={submitting || eligibleAmount < MIN_WITHDRAWAL} className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground cream-ripple">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Request Payout"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {accounts.length === 0 && (
        <Card className="gradient-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <WalletIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No active trading accounts. Buy a challenge to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>Please review the details below before confirming.</DialogDescription>
          </DialogHeader>
          {confirmData && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">${confirmData.amount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span>${confirmData.fee.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground font-medium">Net Amount</span><span className="font-bold text-primary">${confirmData.net.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span>{confirmData.network}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-mono text-xs max-w-[200px] truncate">{confirmData.address}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{confirmData.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">{confirmData.txRef}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={confirmWithdrawal} disabled={submitting} className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              {submitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
