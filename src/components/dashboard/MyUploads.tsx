import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Film, Edit, Trash2, Megaphone, Search, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Movie {
  id: string;
  title: string;
  poster_url: string;
  language: string;
  category: string;
  views: number;
  downloads: number;
  is_web_series: boolean;
  created_at: string;
}

export function MyUploads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMovies();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredMovies(
        movies.filter((movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredMovies(movies);
    }
  }, [searchQuery, movies]);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("uploader_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovies(data || []);
      setFilteredMovies(data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to load uploads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMovie) return;

    try {
      const { error } = await supabase
        .from("movies")
        .delete()
        .eq("id", selectedMovie);

      if (error) throw error;

      toast.success("Movie deleted successfully");
      setMovies(movies.filter((m) => m.id !== selectedMovie));
      setDeleteDialogOpen(false);
      setSelectedMovie(null);
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie");
    }
  };

  const openDeleteDialog = (movieId: string) => {
    setSelectedMovie(movieId);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading uploads...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">My Uploads</h2>
          <p className="text-muted-foreground">Manage your uploaded content</p>
        </div>
        <Button
          className="bg-gradient-to-r from-premium to-premium-light"
          onClick={() => navigate("/upload")}
        >
          <Film className="h-4 w-4 mr-2" />
          New Upload
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No uploads found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Start uploading to see your content here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <Card key={movie.id} className="shadow-card overflow-hidden group">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {movie.is_web_series && (
                  <Badge className="absolute top-2 right-2 bg-premium text-premium-foreground">
                    Series
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{movie.language}</span>
                  <span>•</span>
                  <span>{movie.category}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{movie.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>{movie.downloads || 0} downloads</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/promotions?movie=${movie.id}`)}
                  >
                    <Megaphone className="h-4 w-4 mr-1" />
                    Promote
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Edit feature coming soon")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(movie.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this movie? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
