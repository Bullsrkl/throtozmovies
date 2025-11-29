import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  "All",
  "South Hindi Dubbed",
  "Hollywood Hindi Dubbed",
  "Bollywood",
  "Web Series"
];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, [selectedCategory, searchQuery]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let query = supabase.from("movies").select("*");

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      // Order by promoted status first, then by creation date
      query = query.order("is_promoted", { ascending: false, nullsFirst: false })
                   .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter to only show currently promoted movies at top
      const now = new Date().toISOString();
      const sortedMovies = data?.sort((a, b) => {
        const aPromoted = a.is_promoted && a.promoted_until && a.promoted_until > now;
        const bPromoted = b.is_promoted && b.promoted_until && b.promoted_until > now;
        if (aPromoted && !bPromoted) return -1;
        if (!aPromoted && bPromoted) return 1;
        return 0;
      });
      
      setMovies(sortedMovies || []);
    } catch (error: any) {
      toast.error("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movieId: string) => {
    // Increment impressions
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      await supabase
        .from("movies")
        .update({ impressions: (movie.impressions || 0) + 1 })
        .eq("id", movieId);
    }
    setSelectedMovieId(movieId);
  };

  const handleDownload = async (movieId: string, title: string) => {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;

    try {
      // Update movie stats
      await supabase
        .from("movies")
        .update({ 
          clicks: (movie.clicks || 0) + 1,
          downloads: (movie.downloads || 0) + 1
        })
        .eq("id", movieId);

      // Get uploader's active subscription to calculate earnings
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("subscription_plans(earning_per_download)")
        .eq("user_id", movie.uploader_id)
        .eq("status", "active")
        .single();

      if (subscription?.subscription_plans?.earning_per_download) {
        const earning = subscription.subscription_plans.earning_per_download;

        // Create download log
        await supabase.from("download_logs").insert({
          movie_id: movieId,
          uploader_id: movie.uploader_id,
          earning: earning,
          downloader_ip: null // Could add IP tracking if needed
        });

        // Update uploader's wallet
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance, total_earnings")
          .eq("user_id", movie.uploader_id)
          .single();

        if (wallet) {
          await supabase
            .from("wallets")
            .update({
              balance: wallet.balance + earning,
              total_earnings: wallet.total_earnings + earning
            })
            .eq("user_id", movie.uploader_id);
        }
      }

      toast.success(`Downloading ${title}...`);
    } catch (error) {
      console.error("Download error:", error);
      toast.success(`Downloading ${title}...`);
    }
  };

  const handleShare = async (movieId: string, title: string) => {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      await supabase
        .from("movies")
        .update({ shares: (movie.shares || 0) + 1 })
        .eq("id", movieId);
    }

    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out ${title} on Throtoz Movies!`,
        url: window.location.href,
      });
    } else {
      toast.success("Share link copied!");
    }
  };

  const handleCopyLink = (title: string) => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <HeroBanner />

      {/* Search & Filter Bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gradient-to-r from-primary to-primary-light" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section id="movies-section" className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card mb-6">
              <Film className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">
              {searchQuery ? "No Results Found" : "No Movies Yet"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Try a different search term" 
                : "Be the first creator to upload amazing content!"}
            </p>
            {!searchQuery && (
              <Button className="bg-gradient-to-r from-primary to-primary-light" asChild>
                <a href="/auth">Start Uploading</a>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie: any) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster_url}
                category={movie.category}
                downloads={movie.downloads || 0}
                clicks={movie.clicks || 0}
                impressions={movie.impressions || 0}
                isWebSeries={movie.is_web_series}
                onDownload={() => handleDownload(movie.id, movie.title)}
                onShare={() => handleShare(movie.id, movie.title)}
                onCopyLink={() => handleCopyLink(movie.title)}
                onClick={() => handleMovieClick(movie.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Movie Detail Modal */}
      {selectedMovieId && (
        <MovieDetailModal
          movieId={selectedMovieId}
          open={!!selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
}
