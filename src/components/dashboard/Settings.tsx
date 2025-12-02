import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  Camera,
  LogOut,
  Key
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Settings() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  // Payment state
  const [primaryUpi, setPrimaryUpi] = useState("");
  const [secondaryUpi, setSecondaryUpi] = useState("");
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);
  const [withdrawalThreshold, setWithdrawalThreshold] = useState("500");

  // Notification state
  const [notifyDownloads, setNotifyDownloads] = useState(true);
  const [notifyEarnings, setNotifyEarnings] = useState(true);
  const [notifyWithdrawals, setNotifyWithdrawals] = useState(true);
  const [notifySubscription, setNotifySubscription] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(true);

  // Upload preferences
  const [defaultLanguage, setDefaultLanguage] = useState("Hindi");
  const [defaultCategory, setDefaultCategory] = useState("Bollywood");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
      setPrimaryUpi((profile as any).primary_upi_id || "");
      setSecondaryUpi((profile as any).secondary_upi_id || "");
      setAutoWithdrawal((profile as any).auto_withdrawal || false);
      setWithdrawalThreshold((profile as any).auto_withdrawal_threshold?.toString() || "500");
      setNotifyDownloads((profile as any).notify_downloads ?? true);
      setNotifyEarnings((profile as any).notify_earnings ?? true);
      setNotifyWithdrawals((profile as any).notify_withdrawals ?? true);
      setNotifySubscription((profile as any).notify_subscription ?? true);
      setNotifyPromotions((profile as any).notify_promotions ?? true);
      setDefaultLanguage((profile as any).default_language || "Hindi");
      setDefaultCategory((profile as any).default_category || "Bollywood");
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('movie-posters')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('movie-posters')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded successfully!");
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
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentSettings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          primary_upi_id: primaryUpi,
          secondary_upi_id: secondaryUpi,
          auto_withdrawal: autoWithdrawal,
          auto_withdrawal_threshold: parseFloat(withdrawalThreshold)
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Payment settings saved!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notify_downloads: notifyDownloads,
          notify_earnings: notifyEarnings,
          notify_withdrawals: notifyWithdrawals,
          notify_subscription: notifySubscription,
          notify_promotions: notifyPromotions
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Notification preferences saved!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveUploadPreferences = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          default_language: defaultLanguage,
          default_category: defaultCategory
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Upload preferences saved!");
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
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/auth'
      });

      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success("Logged out from all devices!");
      window.location.href = '/auth';
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAllUploads = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('uploader_id', user.id);

      if (error) throw error;
      toast.success("All uploads deleted!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In production, this should call an edge function to properly delete user data
      await supabase.auth.signOut();
      toast.success("Account deletion initiated. Contact support for completion.");
      window.location.href = '/auth';
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          ⚙️ Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <User className="w-5 h-5" />
          Profile Settings
        </div>
        <Separator />
        
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Profile Picture
            </Label>
            <div className="flex items-center gap-4 mt-2">
              {avatarUrl && (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={user?.email} disabled className="bg-muted" />
          </div>

          <Button onClick={saveProfile} disabled={loading}>
            Save Profile
          </Button>
        </div>
      </Card>

      {/* Account Security */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="w-5 h-5" />
          Account Security
        </div>
        <Separator />
        
        <div className="flex gap-4">
          <Button onClick={handleChangePassword} disabled={loading} variant="outline">
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button onClick={handleLogoutAll} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout All Devices
          </Button>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CreditCard className="w-5 h-5" />
          Payment & Withdrawal Settings
        </div>
        <Separator />
        
        <div className="space-y-4">
          <div>
            <Label>Primary UPI ID</Label>
            <Input
              value={primaryUpi}
              onChange={(e) => setPrimaryUpi(e.target.value)}
              placeholder="yourname@upi"
            />
          </div>

          <div>
            <Label>Secondary UPI ID (Optional)</Label>
            <Input
              value={secondaryUpi}
              onChange={(e) => setSecondaryUpi(e.target.value)}
              placeholder="backup@upi"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Withdrawal</Label>
              <p className="text-sm text-muted-foreground">Automatically request withdrawal when balance reaches threshold</p>
            </div>
            <Switch checked={autoWithdrawal} onCheckedChange={setAutoWithdrawal} />
          </div>

          {autoWithdrawal && (
            <div>
              <Label>Withdrawal Threshold (₹)</Label>
              <Input
                type="number"
                value={withdrawalThreshold}
                onChange={(e) => setWithdrawalThreshold(e.target.value)}
                placeholder="500"
              />
            </div>
          )}

          <Button onClick={savePaymentSettings} disabled={loading}>
            Save Payment Settings
          </Button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </div>
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Download Alerts</Label>
            <Switch checked={notifyDownloads} onCheckedChange={setNotifyDownloads} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Earnings Updates</Label>
            <Switch checked={notifyEarnings} onCheckedChange={setNotifyEarnings} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Withdrawal Status</Label>
            <Switch checked={notifyWithdrawals} onCheckedChange={setNotifyWithdrawals} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Subscription Reminders</Label>
            <Switch checked={notifySubscription} onCheckedChange={setNotifySubscription} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Promotion Updates</Label>
            <Switch checked={notifyPromotions} onCheckedChange={setNotifyPromotions} />
          </div>

          <Button onClick={saveNotificationSettings} disabled={loading}>
            Save Notification Settings
          </Button>
        </div>
      </Card>

      {/* Upload Preferences */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Upload className="w-5 h-5" />
          Upload Preferences
        </div>
        <Separator />
        
        <div className="space-y-4">
          <div>
            <Label>Default Language</Label>
            <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Tamil">Tamil</SelectItem>
                <SelectItem value="Telugu">Telugu</SelectItem>
                <SelectItem value="Malayalam">Malayalam</SelectItem>
                <SelectItem value="Kannada">Kannada</SelectItem>
                <SelectItem value="Bengali">Bengali</SelectItem>
                <SelectItem value="Marathi">Marathi</SelectItem>
                <SelectItem value="Punjabi">Punjabi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Default Category</Label>
            <Select value={defaultCategory} onValueChange={setDefaultCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bollywood">Bollywood</SelectItem>
                <SelectItem value="Hollywood">Hollywood</SelectItem>
                <SelectItem value="South Indian">South Indian</SelectItem>
                <SelectItem value="Web Series">Web Series</SelectItem>
                <SelectItem value="Documentary">Documentary</SelectItem>
                <SelectItem value="Animation">Animation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={saveUploadPreferences} disabled={loading}>
            Save Upload Preferences
          </Button>
        </div>
      </Card>

      {/* Auto-Pay Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <RefreshCw className="w-5 h-5" />
          Auto-Pay & Subscription
        </div>
        <Separator />
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage auto-renewal and view payment history in Subscription Management section.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/subscriptions'}>
            Go to Subscription Management
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-destructive/50">
        <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </div>
        <Separator />
        
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                Delete All Uploads
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your uploaded movies and web series. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllUploads}>Delete All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all associated data. This action cannot be undone. 
                  You will need to contact support to complete this process.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
