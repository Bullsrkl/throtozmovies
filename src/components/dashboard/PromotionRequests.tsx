import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Megaphone, Clock, CheckCircle, XCircle, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const PROMOTION_PRICING: Record<number, number> = {
  7: 50,
  14: 100,
  30: 200,
};

const ADMIN_UPI = "bharat00070@ybl";

interface Movie {
  id: string;
  title: string;
  poster_url: string;
}

interface PromotionRequest {
  id: string;
  duration_days: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  movies: {
    title: string;
    poster_url: string;
  };
}

export function PromotionRequests() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedMovieId = searchParams.get("movie");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState(preselectedMovieId || "");
  const [duration, setDuration] = useState<number>(7);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "upi">("wallet");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMovies();
    fetchRequests();
    fetchWalletBalance();
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user!.id)
        .single();
      
      setWalletBalance(data?.balance || 0);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, poster_url")
        .eq("uploader_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("promotion_requests")
        .select("*, movies(title, poster_url)")
        .eq("user_id", user!.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const openUpiApp = (promotionPrice: number) => {
    const upiUrl = `upi://pay?pa=${ADMIN_UPI}&pn=Throtoz%20Movies&am=${promotionPrice}&cu=INR&tn=Promotion%20Payment`;
    window.location.href = upiUrl;
    
    setTimeout(() => {
      const fallbackUrl = `https://pay.google.com/gp/v/pay?pa=${ADMIN_UPI}&pn=Throtoz%20Movies&am=${promotionPrice}&cu=INR`;
      window.open(fallbackUrl, '_blank');
    }, 500);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMovieId) {
      toast.error("Please select a movie");
      return;
    }

    // Check for active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user!.id)
      .eq("status", "active")
      .eq("payment_verified", true)
      .gte("expiry_date", new Date().toISOString())
      .maybeSingle();

    if (!subscription) {
      toast.error("You need an active subscription to request promotions");
      return;
    }

    const promotionPrice = PROMOTION_PRICING[duration];

    // Wallet payment
    if (paymentMethod === "wallet") {
      if (walletBalance < promotionPrice) {
        toast.error(`Insufficient balance. You need ₹${promotionPrice} but have ₹${walletBalance.toFixed(2)}`);
        return;
      }

      setSubmitting(true);
      try {
        // Deduct from wallet
        const { error: walletError } = await supabase
          .from("wallets")
          .update({ 
            balance: walletBalance - promotionPrice,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user!.id);

        if (walletError) throw walletError;

        // Create promotion request
        const { error } = await supabase.from("promotion_requests").insert({
          user_id: user!.id,
          movie_id: selectedMovieId,
          duration_days: duration,
          promotion_price: promotionPrice,
          payment_method: "wallet",
          status: "pending",
        });

        if (error) throw error;

        toast.success(`₹${promotionPrice} deducted from wallet. Promotion request submitted!`);
        setSelectedMovieId("");
        fetchRequests();
        fetchWalletBalance();
      } catch (error: any) {
        console.error("Error submitting request:", error);
        toast.error(error.message || "Failed to submit promotion request");
      } finally {
        setSubmitting(false);
      }
    } 
    // UPI payment
    else {
      setSubmitting(true);
      try {
        const { error } = await supabase.from("promotion_requests").insert({
          user_id: user!.id,
          movie_id: selectedMovieId,
          duration_days: duration,
          promotion_price: promotionPrice,
          payment_method: "upi",
          status: "pending",
        });

        if (error) throw error;

        toast.success("Opening UPI app for payment...");
        openUpiApp(promotionPrice);
        
        setTimeout(() => {
          toast.info("Complete the UPI payment. Admin will verify and approve your request.");
          setSelectedMovieId("");
          fetchRequests();
        }, 1000);
      } catch (error: any) {
        console.error("Error submitting request:", error);
        toast.error(error.message || "Failed to submit promotion request");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading promotions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Promotion Requests</h2>
        <p className="text-muted-foreground">Boost your content with homepage promotions</p>
      </div>

      {/* Request Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-premium" />
            Request Promotion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="movie">Select Movie/Series</Label>
              <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
                <SelectTrigger id="movie">
                  <SelectValue placeholder="Choose your content" />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days - ₹50</SelectItem>
                  <SelectItem value="14">14 Days - ₹100</SelectItem>
                  <SelectItem value="30">30 Days - ₹200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={paymentMethod === "wallet" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("wallet")}
                  className={paymentMethod === "wallet" ? "bg-premium hover:bg-premium/90" : ""}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                  <span className="ml-1 text-xs">(₹{walletBalance.toFixed(0)})</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "upi" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("upi")}
                  className={paymentMethod === "upi" ? "bg-primary hover:bg-primary/90" : ""}
                >
                  💳 UPI
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-accent border border-border">
                <p className="text-sm font-medium">
                  Promotion Cost: <span className="text-premium">₹{PROMOTION_PRICING[duration]}</span> for {duration} days
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedMovieId}
              className="w-full bg-gradient-to-r from-primary to-primary/80"
            >
              {submitting ? "Submitting..." : `Pay ₹${PROMOTION_PRICING[duration]} & Submit`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Requests History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No promotion requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={request.movies.poster_url}
                            alt={request.movies.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <span className="font-medium">{request.movies.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{request.duration_days} days</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            request.status === "approved"
                              ? "bg-premium text-premium-foreground"
                              : request.status === "rejected"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {request.status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {request.status === "approved" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {request.status === "rejected" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {request.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requested_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {request.admin_notes ? (
                          <span className="text-sm text-muted-foreground">
                            {request.admin_notes}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
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