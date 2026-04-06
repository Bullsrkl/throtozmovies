import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  amount: number;
  net_amount: number;
  platform_fee: number;
  usdt_address: string | null;
  network: string | null;
  status: string;
  requested_at: string;
  admin_notes: string | null;
}

export function History() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportWithdrawalId, setReportWithdrawalId] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (user) fetchWithdrawals();
  }, [user]);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user!.id)
      .order("requested_at", { ascending: false });
    setWithdrawals((data as Withdrawal[]) || []);
    setLoading(false);
  };

  const handleSubmitReport = async () => {
    if (!reportMessage.trim()) { toast.error("Please enter your message"); return; }
    setSubmittingReport(true);
    try {
      const { error } = await supabase.from("withdrawal_reports" as any).insert({
        withdrawal_id: reportWithdrawalId,
        user_id: user!.id,
        message: reportMessage,
      } as any);
      if (error) throw error;
      toast.success("Report submitted successfully!");
      setShowReport(false); setReportMessage(""); setReportWithdrawalId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle className="h-4 w-4 text-primary" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading history...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View all your withdrawal transactions</p>
      </div>

      {withdrawals.length === 0 ? (
        <Card className="gradient-card p-8 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No transactions yet</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {withdrawals.map((w) => (
            <Card
              key={w.id}
              className="p-4 cursor-pointer cream-hover gradient-card space-y-3"
              onClick={() => setSelectedWithdrawal(w)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(w.status)}
                  <span className="text-lg font-bold">${w.amount.toFixed(2)}</span>
                </div>
                <Badge className={
                  w.status === "paid" ? "bg-primary/10 text-primary" :
                  w.status === "rejected" ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                }>
                  {w.status?.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Network: {w.network || "N/A"}</p>
                <p>Net: ${w.net_amount.toFixed(2)}</p>
                <p>{new Date(w.requested_at).toLocaleDateString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>Transaction information</DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">${selectedWithdrawal.amount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span>${selectedWithdrawal.platform_fee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Net</span><span className="font-bold text-primary">${selectedWithdrawal.net_amount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span>{selectedWithdrawal.network || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-mono text-xs max-w-[200px] truncate">{selectedWithdrawal.usdt_address || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(selectedWithdrawal.requested_at).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono text-xs">{selectedWithdrawal.id.slice(0, 12)}...</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1">
                  {statusIcon(selectedWithdrawal.status)}
                  <Badge className={
                    selectedWithdrawal.status === "paid" ? "bg-primary/10 text-primary" :
                    selectedWithdrawal.status === "rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }>{selectedWithdrawal.status?.toUpperCase()}</Badge>
                </div>
              </div>
              {selectedWithdrawal.admin_notes && (
                <div className="p-3 rounded-lg bg-muted/50 text-xs">
                  <p className="font-medium mb-1">Admin Notes:</p>
                  <p className="text-muted-foreground">{selectedWithdrawal.admin_notes}</p>
                </div>
              )}
              {(selectedWithdrawal.status === "rejected" || selectedWithdrawal.status === "pending") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setReportWithdrawalId(selectedWithdrawal.id);
                    setSelectedWithdrawal(null);
                    setShowReport(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogDescription>Describe your issue with this withdrawal. Our team will review it.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe your issue..."
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>Cancel</Button>
            <Button onClick={handleSubmitReport} disabled={submittingReport} className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              {submittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
