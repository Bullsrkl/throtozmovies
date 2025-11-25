import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
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
      let query = supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMovies(data || []);
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
    if (movie) {
      await supabase
        .from("movies")
        .update({ 
          clicks: (movie.clicks || 0) + 1,
          downloads: (movie.downloads || 0) + 1
        })
        .eq("id", movieId);
    }
    toast.success(`Downloading ${title}...`);
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
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              Upload & Monetize Your Movies
            </h1>
            <p className="text-xl text-muted-foreground">
              Earn Per Download — Turn Your Content Into Income
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light" asChild>
                <a href="/auth">Become Creator</a>
              </Button>
              <Button size="lg" variant="outline">
                Browse Movies
              </Button>
            </div>
          </div>
        </div>
      </section>

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
      <section className="container mx-auto px-4 py-12">
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
