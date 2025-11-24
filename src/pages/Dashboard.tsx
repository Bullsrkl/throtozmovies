import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Wallet, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">Creator Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your content and earnings</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary-light" asChild>
              <a href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                New Upload
              </a>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No uploads yet</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Downloads (30d)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹0.00</div>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Saturday</div>
                <p className="text-xs text-muted-foreground">Weekly payouts</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <h3 className="font-semibold">Subscribe to a Plan</h3>
                  <p className="text-sm text-muted-foreground">Start uploading and earning</p>
                </div>
                <Button className="bg-gradient-to-r from-premium to-premium-light" asChild>
                  <a href="/subscriptions">View Plans</a>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border opacity-50">
                <div>
                  <h3 className="font-semibold">Upload Your First Movie</h3>
                  <p className="text-sm text-muted-foreground">Requires active subscription</p>
                </div>
                <Button disabled>Upload</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
