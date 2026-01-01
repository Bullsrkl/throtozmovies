import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentPopup } from "@/components/PaymentPopup";

interface Plan {
  id: string;
  plan_code: string;
  plan_name: string;
  price_inr: number;
  original_price_inr: number | null;
  uploads_per_day: number;
  earning_per_download: number;
  withdrawal_min: number;
  withdrawal_max: number;
  withdrawal_threshold: number;
  duration_days: number;
  is_trial: boolean;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_inr', { ascending: true });

    if (error) {
      toast.error("Failed to load plans");
    } else if (data) {
      setPlans(data);
    }
    setLoading(false);
  };

  const handleSubscribe = (plan: Plan) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const getDiscountPercentage = (plan: Plan) => {
    if (!plan.original_price_inr) return 0;
    return Math.round(((plan.original_price_inr - plan.price_inr) / plan.original_price_inr) * 100);
  };

  const getSavings = (plan: Plan) => {
    if (!plan.original_price_inr) return 0;
    return plan.original_price_inr - plan.price_inr;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading plans...</div>
        </div>
      </div>
    );
  }

  const trialPlan = plans.find(p => p.is_trial);
  const regularPlans = plans.filter(p => !p.is_trial);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Limited Time Offer Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-destructive/90 via-orange-500 to-yellow-500 p-6 text-white shadow-lg">
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-2">
                <Flame className="h-8 w-8 animate-pulse" />
                <span className="text-2xl md:text-3xl font-display font-bold">LIMITED TIME OFFER</span>
                <Flame className="h-8 w-8 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white text-destructive text-lg px-4 py-2 font-bold animate-bounce">
                  70% OFF
                </Badge>
                <span className="text-lg">on All Plans!</span>
              </div>
            </div>
            <div className="relative flex items-center justify-center mt-2 gap-2 text-sm opacity-90">
              <Clock className="h-4 w-4" />
              <span>Hurry! Offer ends soon</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Start earning from your content today. All plans include Saturday payouts.
            </p>
          </div>

          {/* Trial Plan */}
          {trialPlan && (
            <Card className="relative border-2 border-premium shadow-elevated overflow-hidden">
              {/* Limited Time Ribbon */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white px-3 py-1 text-sm font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {getDiscountPercentage(trialPlan)}% OFF
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display">Trial Plan</CardTitle>
                    <CardDescription>Perfect for testing the platform</CardDescription>
                  </div>
                  <Badge className="bg-premium text-premium-foreground">7 Days</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-3">
                  {trialPlan.original_price_inr && (
                    <span className="text-2xl text-muted-foreground line-through">
                      ₹{trialPlan.original_price_inr}
                    </span>
                  )}
                  <span className="text-4xl font-bold bg-gradient-to-r from-premium to-premium-light bg-clip-text text-transparent">
                    ₹{trialPlan.price_inr}
                  </span>
                  <span className="text-muted-foreground">for 7 days</span>
                  {getSavings(trialPlan) > 0 && (
                    <Badge variant="outline" className="border-premium text-premium">
                      Save ₹{getSavings(trialPlan)}
                    </Badge>
                  )}
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-premium" />
                    <span>{trialPlan.uploads_per_day} uploads total</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-premium" />
                    <span>₹{trialPlan.earning_per_download} per download</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-premium" />
                    <span>No withdrawals (trial only)</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-gradient-to-r from-premium to-premium-light"
                  onClick={() => handleSubscribe(trialPlan)}
                >
                  Start Trial
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Regular Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPlans.map((plan) => (
              <Card key={plan.id} className="relative shadow-card hover:shadow-elevated transition-shadow overflow-hidden">
                {/* Limited Time Badge */}
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-destructive via-orange-500 to-yellow-500 text-white text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    LIMITED TIME OFFER
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-8 right-3">
                  <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white px-2 py-1 text-xs font-bold flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {getDiscountPercentage(plan)}% OFF
                  </Badge>
                </div>

                <CardHeader className="pt-10">
                  <CardTitle className="text-xl font-display">{plan.plan_name}</CardTitle>
                  <CardDescription>{plan.plan_code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      {plan.original_price_inr && (
                        <span className="text-xl text-muted-foreground line-through">
                          ₹{plan.original_price_inr}
                        </span>
                      )}
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                        ₹{plan.price_inr}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {getSavings(plan) > 0 && (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        You Save ₹{getSavings(plan)}
                      </Badge>
                    )}
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{plan.uploads_per_day} uploads/day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>₹{plan.earning_per_download} per download</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Withdraw: ₹{plan.withdrawal_min} - ₹{plan.withdrawal_max}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Threshold: ₹{plan.withdrawal_threshold}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Saturday payouts</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary-light"
                    onClick={() => handleSubscribe(plan)}
                  >
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Platform fee: 3% on withdrawals • AutoPay available for convenience</p>
          </div>
        </div>
      </section>

      {/* Payment Popup */}
      {selectedPlan && user && (
        <PaymentPopup
          open={showPayment}
          onClose={() => setShowPayment(false)}
          plan={{
            ...selectedPlan,
            original_price_inr: selectedPlan.original_price_inr || undefined
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}