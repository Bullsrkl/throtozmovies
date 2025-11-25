import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, Link as LinkIcon, Eye, BarChart3, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Episode {
  id: string;
  episode_number: number;
  episode_title: string;
  episode_link: string;
  downloads: number;
  views: number;
}

interface MovieDetailModalProps {
  movieId: string;
  open: boolean;
  onClose: () => void;
}

export function MovieDetailModal({ movieId, open, onClose }: MovieDetailModalProps) {
  const [movie, setMovie] = useState<any>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && movieId) {
      fetchMovieDetails();
    }
  }, [open, movieId]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      // Fetch movie with uploader profile
      const { data: movieData, error: movieError } = await supabase
        .from("movies")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq("id", movieId)
        .single();

      if (movieError) throw movieError;

      setMovie(movieData);

      // If web series, fetch episodes
      if (movieData.is_web_series) {
        const { data: episodesData, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .eq("movie_id", movieId)
          .order("episode_number", { ascending: true });

        if (episodesError) throw episodesError;
        setEpisodes(episodesData || []);
      }

      // Increment views
      await supabase
        .from("movies")
        .update({ views: (movieData.views || 0) + 1 })
        .eq("id", movieId);
    } catch (error: any) {
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (episodeId?: string) => {
    try {
      // Increment clicks
      await supabase
        .from("movies")
        .update({ clicks: (movie.clicks || 0) + 1 })
        .eq("id", movieId);

      // Increment downloads
      if (episodeId) {
        const episode = episodes.find(ep => ep.id === episodeId);
        await supabase
          .from("episodes")
          .update({ downloads: (episode?.downloads || 0) + 1 })
          .eq("id", episodeId);

        // Open episode link
        window.open(episode?.episode_link, "_blank");
      } else {
        await supabase
          .from("movies")
          .update({ downloads: (movie.downloads || 0) + 1 })
          .eq("id", movieId);

        // Open movie link
        window.open(movie.direct_link, "_blank");
      }

      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Check out ${movie?.title} on Throtoz Movies!`,
        url: window.location.href,
      });
    } else {
      toast.success("Share link copied!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const ctr = movie?.impressions > 0
    ? ((movie?.clicks / movie?.impressions) * 100).toFixed(2)
    : "0.00";

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{movie?.title}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Poster */}
          <div className="relative group">
            <img
              src={movie?.poster_url}
              alt={movie?.title}
              className="w-full rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Play className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">{movie?.category}</Badge>
              <Badge variant="outline">{movie?.language}</Badge>
              {movie?.is_web_series && <Badge>Web Series</Badge>}
            </div>

            {movie?.description && (
              <p className="text-muted-foreground">{movie.description}</p>
            )}

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>Views</span>
                </div>
                <p className="text-xl font-bold">{movie?.views || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>Downloads</span>
                </div>
                <p className="text-xl font-bold">{movie?.downloads || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="w-4 h-4" />
                  <span>CTR</span>
                </div>
                <p className="text-xl font-bold">{ctr}%</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span>Shares</span>
                </div>
                <p className="text-xl font-bold">{movie?.shares || 0}</p>
              </div>
            </div>

            <Separator />

            {/* Uploader */}
            <div>
              <p className="text-sm text-muted-foreground">Uploaded by</p>
              <p className="font-semibold">
                {movie?.profiles?.full_name || movie?.profiles?.email || "Creator"}
              </p>
            </div>

            {/* Actions */}
            {!movie?.is_web_series && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload()}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-light"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Episodes List */}
        {movie?.is_web_series && episodes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Episodes</h3>
            <div className="space-y-2">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      Episode {episode.episode_number}: {episode.episode_title}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>{episode.views || 0} views</span>
                      <span>{episode.downloads || 0} downloads</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(episode.id)}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary-light"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
