import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

/** MultiWorkWala "M" monogram — twin gold chevrons rising around an upward arrow. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-2xl border border-primary/40 shadow-gold",
        className
      )}
      style={{
        background: "linear-gradient(150deg, hsl(219 55% 14%), hsl(219 62% 7%))",
      }}
    >
      <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]" aria-hidden="true">
        <defs>
          <linearGradient id="mww-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(38 62% 50%)" />
            <stop offset="50%" stopColor="hsl(45 92% 74%)" />
            <stop offset="100%" stopColor="hsl(38 62% 50%)" />
          </linearGradient>
        </defs>
        <path
          d="M4 42 L4 12 L14 6 L24 22 L34 6 L44 12 L44 42 L35 42 L35 21 L24 38 L13 21 L13 42 Z"
          fill="url(#mww-gold)"
        />
      </svg>
    </div>
  );
}

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const sizes = {
  sm: { mark: "h-9 w-9", title: "text-base", tag: "text-[10px]" },
  md: { mark: "h-12 w-12", title: "text-xl", tag: "text-[11px]" },
  lg: { mark: "h-24 w-24", title: "text-3xl", tag: "text-sm" },
};

export function Logo({ className, size = "md", showTagline = true }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className={s.mark} />
      <div className="leading-tight">
        <div className={cn("font-display font-extrabold tracking-tight", s.title)}>
          <span className="text-foreground">Multi</span>
          <span className="gold-text">WorkWala</span>
        </div>
        {showTagline && (
          <div className={cn("text-muted-foreground tracking-wide", s.tag)}>
            समाधान हर जरूरत का
          </div>
        )}
      </div>
    </div>
  );
}
