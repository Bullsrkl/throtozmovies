import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Download, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function HeroBanner() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    creators: 0,
    paidOut: 0,
    downloads: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total creators count
      const { count: creatorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total paid out (sum of total_withdrawn from wallets)
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('total_withdrawn');
      
      const totalPaidOut = walletsData?.reduce((sum, w) => sum + (w.total_withdrawn || 0), 0) || 0;

      // Get total downloads (sum of downloads from movies)
      const { data: moviesData } = await supabase
        .from('movies')
        .select('downloads');
      
      const totalDownloads = moviesData?.reduce((sum, m) => sum + (m.downloads || 0), 0) || 0;

      setStats({
        creators: creatorsCount || 0,
        paidOut: totalPaidOut,
        downloads: totalDownloads
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const scrollToMovies = () => {
    const moviesSection = document.getElementById("movies-section");
    if (moviesSection) {
      moviesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden border-b border-border">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-premium/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--premium)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        {/* Main Hero Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Brand Logo/Name */}
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border shadow-card">
            <Play className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg">THROTOZ</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-tight">
            <span className="block bg-gradient-to-r from-primary via-primary-light to-premium bg-clip-text text-transparent">
              Upload Movies.
            </span>
            <span className="block bg-gradient-to-r from-premium via-premium-light to-primary bg-clip-text text-transparent">
              Earn Money.
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            India's #1 Movie Monetization Platform
          </p>
          <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-premium to-premium-light bg-clip-text text-transparent">
            Upload. Share. Earn.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 py-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-premium" />
              <div className="text-left">
                <div className="font-bold text-xl">{stats.creators.toLocaleString('en-IN')}+</div>
                <div className="text-xs text-muted-foreground">Creators</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-premium" />
              <div className="text-left">
                <div className="font-bold text-xl">₹{(stats.paidOut / 100000).toFixed(1)} Lakh+</div>
                <div className="text-xs text-muted-foreground">Paid Out</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-premium" />
              <div className="text-left">
                <div className="font-bold text-xl">{(stats.downloads / 1000).toFixed(0)}K+</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-premium to-premium-light hover:opacity-90 shadow-elegant text-lg px-8 py-6 h-auto"
              onClick={() => navigate("/auth")}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Start Earning Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-premium/20 hover:bg-premium/10 text-lg px-8 py-6 h-auto"
              onClick={scrollToMovies}
            >
              Explore Movies
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
