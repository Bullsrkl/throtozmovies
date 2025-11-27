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
import { Megaphone, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

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
  const [duration, setDuration] = useState("7");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMovies();
    fetchRequests();
  }, [user]);

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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMovieId) {
      toast.error("Please select a movie");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("promotion_requests").insert({
        user_id: user!.id,
        movie_id: selectedMovieId,
        duration_days: parseInt(duration),
        status: "pending",
      });

      if (error) throw error;

      toast.success("Promotion request submitted! Waiting for admin approval.");
      setSelectedMovieId("");
      setDuration("7");
      fetchRequests();
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Failed to submit promotion request");
    } finally {
      setSubmitting(false);
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
              <Label htmlFor="duration">Promotion Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-accent border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>How it works:</strong> Your content will appear at the top of the
                homepage for the selected duration after admin approval. This increases
                visibility and potential downloads.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedMovieId}
              className="w-full bg-gradient-to-r from-premium to-premium-light"
            >
              {submitting ? "Submitting..." : "Submit Request"}
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
