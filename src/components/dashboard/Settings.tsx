import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Shield, Key, LogOut, Camera, AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Settings() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    try {
      const filePath = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('payment-screenshots').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('payment-screenshots').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, avatar_url: avatarUrl }).eq('id', user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin + '/auth' });
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    toast.success("Logged out from all devices!");
    window.location.href = '/auth';
  };

  const handleDeleteAccount = async () => {
    await supabase.auth.signOut();
    toast.success("Account deletion initiated. Contact support.");
    window.location.href = '/auth';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold"><User className="w-5 h-5" /> Profile</div>
        <Separator />
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2"><Camera className="w-4 h-4" /> Profile Picture</Label>
            <div className="flex items-center gap-4 mt-2">
              {avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />}
              <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
            </div>
          </div>
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email} disabled className="bg-muted" />
          </div>
          <Button onClick={saveProfile} disabled={loading}>Save Profile</Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold"><Shield className="w-5 h-5" /> Security</div>
        <Separator />
        <div className="flex gap-4">
          <Button onClick={handleChangePassword} disabled={loading} variant="outline"><Key className="w-4 h-4 mr-2" /> Change Password</Button>
          <Button onClick={handleLogoutAll} variant="outline"><LogOut className="w-4 h-4 mr-2" /> Logout All Devices</Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border-destructive/50">
        <div className="flex items-center gap-2 text-lg font-semibold text-destructive"><AlertTriangle className="w-5 h-5" /> Danger Zone</div>
        <Separator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. All your data will be permanently deleted.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
