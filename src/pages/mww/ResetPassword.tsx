import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/mww/MobileShell";
import { LogoMark } from "@/components/mww/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate("/home", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell className="px-6 pb-10 pt-8">
      <LogoMark className="h-10 w-10" />
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-2xl font-extrabold">Set New Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Naya password choose karein.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            aria-label="New password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gold-surface py-4 font-display font-bold text-primary-foreground shadow-gold press disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
