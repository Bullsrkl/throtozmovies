import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Eye, MousePointerClick, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  totalImpressions: number;
  totalClicks: number;
  avgCTR: number;
  monthlyEarnings: number;
  downloadsOverTime: any[];
  earningsByMovie: any[];
  contentByCategory: any[];
}

export function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalImpressions: 0,
    totalClicks: 0,
    avgCTR: 0,
    monthlyEarnings: 0,
    downloadsOverTime: [],
    earningsByMovie: [],
    contentByCategory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch movies for aggregation
      const { data: movies } = await supabase
        .from("movies")
        .select("*")
        .eq("uploader_id", user!.id);

      if (!movies) return;

      const totalImpressions = movies.reduce((sum, m) => sum + (m.impressions || 0), 0);
      const totalClicks = movies.reduce((sum, m) => sum + (m.clicks || 0), 0);
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      // Fetch earnings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: logs } = await supabase
        .from("download_logs")
        .select("earning, created_at")
        .eq("uploader_id", user!.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const monthlyEarnings = logs?.reduce((sum, log) => sum + log.earning, 0) || 0;

      // Downloads over time (last 7 days)
      const downloadsMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        downloadsMap.set(dateStr, 0);
      }

      logs?.forEach((log) => {
        const date = new Date(log.created_at);
        const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        if (downloadsMap.has(dateStr)) {
          downloadsMap.set(dateStr, (downloadsMap.get(dateStr) || 0) + 1);
        }
      });

      const downloadsOverTime = Array.from(downloadsMap.entries()).map(([date, downloads]) => ({
        date,
        downloads,
      }));

      // Earnings by movie (top 5)
      const movieEarningsMap = new Map<string, { title: string; earning: number }>();
      logs?.forEach((log: any) => {
        const movie = movies.find((m) => m.id === log.movie_id);
        if (movie) {
          const current = movieEarningsMap.get(movie.id) || { title: movie.title, earning: 0 };
          movieEarningsMap.set(movie.id, {
            ...current,
            earning: current.earning + log.earning,
          });
        }
      });

      const earningsByMovie = Array.from(movieEarningsMap.values())
        .sort((a, b) => b.earning - a.earning)
        .slice(0, 5);

      // Content by category
      const categoryMap = new Map<string, number>();
      movies.forEach((movie) => {
        const count = categoryMap.get(movie.category) || 0;
        categoryMap.set(movie.category, count + 1);
      });

      const contentByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      setAnalytics({
        totalImpressions,
        totalClicks,
        avgCTR,
        monthlyEarnings,
        downloadsOverTime,
        earningsByMovie,
        contentByCategory,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(158, 79%, 66%)", "hsl(158, 58%, 51%)", "hsl(19, 100%, 50%)", "hsl(22, 100%, 62%)", "hsl(43, 63%, 52%)"];

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Analytics</h2>
        <p className="text-muted-foreground">Track your performance and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total views</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total engagement</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Click-through rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.monthlyEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Downloads Over Time */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Downloads (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.downloadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line type="monotone" dataKey="downloads" stroke="hsl(var(--premium))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content by Category */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Content by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.contentByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {analytics.contentByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Earnings by Movie */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Top Earning Movies</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.earningsByMovie}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="title" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="earning" fill="hsl(var(--premium))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
