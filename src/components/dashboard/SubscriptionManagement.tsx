import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Upload, TrendingDown, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PaymentPopup } from "@/components/PaymentPopup";

interface Subscription {
  id: string;
  status: string;
  start_date: string;
  expiry_date: string;
  payment_verified: boolean;
  subscription_plans: {
    id: string;
    plan_name: string;
    plan_code: string;
    price_inr: number;
    duration_days: number;
    uploads_per_day: number;
    earning_per_download: number;
    withdrawal_min: number;
    withdrawal_max: number;
  };
}

interface Plan {
  id: string;
  plan_name: string;
  plan_code: string;
  price_inr: number;
  duration_days: number;
  uploads_per_day: number;
  earning_per_download: number;
  withdrawal_min: number;
  withdrawal_max: number;
}

export function SubscriptionManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchSubscriptionData();
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      // Fetch current subscription
      const { data: currentSub } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user!.id)
        .eq("payment_verified", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setCurrentSubscription(currentSub);

      // Fetch all plans
      const { data: plans } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_inr", { ascending: true });

      setAvailablePlans(plans || []);

      // Fetch subscription history
      const { data: history } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      setSubscriptionHistory(history || []);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!currentSubscription) return 0;
    const expiry = new Date(currentSubscription.expiry_date);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentPopupOpen(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading subscription...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Subscription Management</h2>
        <p className="text-muted-foreground">Manage your plan and billing</p>
      </div>

      {/* Current Plan */}
      {currentSubscription ? (
        <Card className="shadow-card border-premium/20 bg-gradient-to-r from-premium/5 to-premium-light/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-premium" />
                <div>
                  <CardTitle className="text-2xl">
                    {currentSubscription.subscription_plans.plan_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                </div>
              </div>
              <Badge className="bg-premium text-premium-foreground">
                {currentSubscription.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="font-semibold">{getDaysRemaining()} days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Daily Uploads</p>
                  <p className="font-semibold">
                    {currentSubscription.subscription_plans.uploads_per_day}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Per Download</p>
                  <p className="font-semibold">
                    ₹{currentSubscription.subscription_plans.earning_per_download}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ArrowUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawal Range</p>
                  <p className="font-semibold">
                    ₹{currentSubscription.subscription_plans.withdrawal_min} - ₹
                    {currentSubscription.subscription_plans.withdrawal_max}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Expires on</p>
                <p className="font-semibold">
                  {new Date(currentSubscription.expiry_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Active Subscription</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to a plan to start uploading and earning
            </p>
            <Button
              className="bg-gradient-to-r from-premium to-premium-light"
              onClick={() => navigate("/subscriptions")}
            >
              View All Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      {currentSubscription && (
        <div className="space-y-4">
          <h3 className="text-xl font-display font-bold">Upgrade Your Plan</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {availablePlans
              .filter(
                (plan) =>
                  plan.price_inr > currentSubscription.subscription_plans.price_inr &&
                  !plan.plan_code.startsWith("TRIAL")
              )
              .map((plan) => (
                <Card key={plan.id} className="shadow-card hover:border-premium/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-premium" />
                      {plan.plan_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">₹{plan.price_inr}</div>
                    <ul className="space-y-2 text-sm">
                      <li>✓ {plan.uploads_per_day} uploads/day</li>
                      <li>✓ ₹{plan.earning_per_download}/download</li>
                      <li>✓ {plan.duration_days} days validity</li>
                      <li>✓ Withdraw ₹{plan.withdrawal_min}-₹{plan.withdrawal_max}</li>
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-premium to-premium-light"
                      onClick={() => handleUpgrade(plan)}
                    >
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Subscription History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No subscription history</p>
          ) : (
            <div className="space-y-4">
              {subscriptionHistory.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-semibold">{sub.subscription_plans.plan_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sub.start_date).toLocaleDateString("en-IN")} -{" "}
                      {new Date(sub.expiry_date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{sub.subscription_plans.price_inr}</p>
                    <Badge
                      className={
                        sub.status === "active"
                          ? "bg-premium text-premium-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {sub.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Popup */}
      {selectedPlan && (
        <PaymentPopup
          open={paymentPopupOpen}
          onClose={() => {
            setPaymentPopupOpen(false);
            setSelectedPlan(null);
            fetchSubscriptionData();
          }}
          plan={{
            id: selectedPlan.id,
            plan_name: selectedPlan.plan_name,
            price_inr: selectedPlan.price_inr,
            uploads_per_day: selectedPlan.uploads_per_day,
            earning_per_download: selectedPlan.earning_per_download,
            duration_days: selectedPlan.duration_days,
          }}
          userId={user!.id}
        />
      )}
    </div>
  );
}
