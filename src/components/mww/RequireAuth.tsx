import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MobileShell } from "@/components/mww/MobileShell";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <MobileShell className="items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </MobileShell>
    );
  }
  return <>{children}</>;
}
