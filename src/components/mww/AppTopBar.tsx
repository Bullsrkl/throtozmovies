import { Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoMark } from "@/components/mww/Logo";

interface AppTopBarProps {
  onMenu: () => void;
  name?: string | null;
  avatarUrl?: string | null;
}

export function AppTopBar({ onMenu, name, avatarUrl }: AppTopBarProps) {
  const initial = (name || "M").trim().charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 press"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/home" className="flex items-center gap-2">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-sm font-extrabold tracking-tight">
            <span className="text-foreground">Multi</span>
            <span className="gold-text">WorkWala</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 press"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
          <Link to="/profile" aria-label="Profile">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Your profile"
                loading="lazy"
                className="h-10 w-10 rounded-xl border border-primary/40 object-cover"
              />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-xl gold-surface font-display font-bold text-primary-foreground">
                {initial}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
