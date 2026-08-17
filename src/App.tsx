import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/mww/RequireAuth";

import Splash from "./pages/mww/Splash";
import Onboarding from "./pages/mww/Onboarding";
import Login from "./pages/mww/Login";
import Signup from "./pages/mww/Signup";
import ForgotPassword from "./pages/mww/ForgotPassword";
import ResetPassword from "./pages/mww/ResetPassword";
import VerifyOtp from "./pages/mww/VerifyOtp";
import AccountCreated from "./pages/mww/AccountCreated";
import Home from "./pages/mww/Home";
import Wallets from "./pages/mww/Wallets";
import MvsPay from "./pages/mww/MvsPay";
import Offers from "./pages/mww/Offers";
import Profile from "./pages/mww/Profile";

import Admin from "./pages/Admin";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/account-created" element={<AccountCreated />} />

            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/wallet" element={<RequireAuth><Wallets /></RequireAuth>} />
            <Route path="/mvs-pay" element={<RequireAuth><MvsPay /></RequireAuth>} />
            <Route path="/offers" element={<RequireAuth><Offers /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Profile /></RequireAuth>} />

            <Route path="/admin" element={<Admin />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

            {/* Legacy routes */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/home" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
