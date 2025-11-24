import { useState } from "react";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "South Hindi Dubbed",
  "Hollywood Hindi Dubbed",
  "Bollywood",
  "Web Series"
];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Placeholder movies - will be replaced with real data
  const movies = [];

  const handleDownload = (title: string) => {
    toast.success(`Downloading ${title}...`);
  };

  const handleShare = (title: string) => {
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

      {/* Filter Bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
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
        {movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card mb-6">
              <Film className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">No Movies Yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first creator to upload amazing content!
            </p>
            <Button className="bg-gradient-to-r from-primary to-primary-light" asChild>
              <a href="/auth">Start Uploading</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie: any) => (
              <MovieCard
                key={movie.id}
                {...movie}
                onDownload={() => handleDownload(movie.title)}
                onShare={() => handleShare(movie.title)}
                onCopyLink={() => handleCopyLink(movie.title)}
                onClick={() => console.log("Open movie detail", movie.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
