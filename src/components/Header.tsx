import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Prop Gym
            </h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/buy-challenge">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Challenge
              </Link>
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" className="bg-gradient-to-r from-admin to-admin-light text-admin-foreground hover:opacity-90" asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground" asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link to="/buy-challenge">Buy Challenge</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/dashboard/accounts">My Trading Accounts</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/dashboard/wallet">Wallet</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/dashboard/certificates">Certificates</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/dashboard/referral">Refer & Earn</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/dashboard/settings">Settings</Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-admin" asChild onClick={() => setMobileOpen(false)}>
                    <Link to="/admin">Admin Panel</Link>
                  </Button>
                )}
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground" asChild onClick={() => setMobileOpen(false)}>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
