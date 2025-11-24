import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plan {
  id: string;
  plan_code: string;
  plan_name: string;
  price_inr: number;
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
    
    toast.info("Payment integration coming soon!");
    // Will implement UPI payment flow
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
            <Card className="border-2 border-premium shadow-elevated">
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
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-premium to-premium-light bg-clip-text text-transparent">
                    ₹{trialPlan.price_inr}
                  </span>
                  <span className="text-muted-foreground">for 7 days</span>
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
              <Card key={plan.id} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-display">{plan.plan_name}</CardTitle>
                  <CardDescription>{plan.plan_code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      ₹{plan.price_inr}
                    </span>
                    <span className="text-muted-foreground">/month</span>
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
    </div>
  );
}
