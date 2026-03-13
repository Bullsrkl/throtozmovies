import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Certificate {
  id: string;
  certificate_type: string;
  issued_at: string;
  trading_accounts: { account_number: string } | null;
}

export function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCerts();
  }, [user]);

  const fetchCerts = async () => {
    const { data } = await supabase
      .from("certificates")
      .select("*, trading_accounts(account_number)")
      .eq("user_id", user!.id)
      .order("issued_at", { ascending: false });
    setCerts((data as any) || []);
    setLoading(false);
  };

  const typeLabel = (t: string) => {
    if (t === "phase1_pass") return "Phase 1 Passed";
    if (t === "phase2_pass") return "Phase 2 Passed";
    return "Funded Trader";
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Certificates</h1>
        <p className="text-muted-foreground">Your trading achievements</p>
      </div>

      {certs.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16 space-y-3">
            <Award className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-display font-bold">No Certificates Yet</h3>
            <p className="text-muted-foreground text-sm">Pass your evaluation to earn certificates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <Card key={cert.id} className="border-border">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold">{typeLabel(cert.certificate_type)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Account #{cert.trading_accounts?.account_number || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(cert.issued_at).toLocaleDateString()}</p>
                </div>
                <Badge className="bg-primary/10 text-primary">{typeLabel(cert.certificate_type)}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
